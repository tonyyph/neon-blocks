import { MODES, previousDateKey } from '../game/modes';
import { newlyEarned } from './achievements';
import type { GameOutcomeSummary, GameResult, ModeRecord, Progress } from './types';

export const RECENT_LIMIT = 10;
/** Daily results older than this many entries are dropped to keep storage small. */
export const DAILY_HISTORY_LIMIT = 60;

export const EMPTY_PROGRESS: Progress = {
  records: {},
  totals: {
    games: 0,
    lines: 0,
    tetrises: 0,
    pieces: 0,
    playTimeMs: 0,
    maxCombo: 0,
    maxChain: 0,
    maxZoneLines: 0,
  },
  recent: [],
  daily: { results: {}, streak: 0, bestStreak: 0, lastDateKey: null },
  achievements: {},
};

const EMPTY_RECORD: ModeRecord = {
  plays: 0,
  bestScore: 0,
  bestTimeMs: null,
  bestLines: 0,
  bestLevel: 0,
};

/** Did this game beat the mode's previous best? */
const beatsRecord = (result: GameResult, previous: ModeRecord | undefined): boolean => {
  if (MODES[result.mode].record === 'time') {
    if (result.outcome !== 'completed') return false;
    return previous?.bestTimeMs == null || result.timeMs < previous.bestTimeMs;
  }
  return result.score > 0 && result.score > (previous?.bestScore ?? 0);
};

const updateRecord = (previous: ModeRecord | undefined, result: GameResult): ModeRecord => {
  const record = previous ?? EMPTY_RECORD;
  const completedTime = result.outcome === 'completed' ? result.timeMs : null;
  return {
    plays: record.plays + 1,
    bestScore: Math.max(record.bestScore, result.score),
    bestTimeMs:
      completedTime === null
        ? record.bestTimeMs
        : record.bestTimeMs === null
          ? completedTime
          : Math.min(record.bestTimeMs, completedTime),
    bestLines: Math.max(record.bestLines, result.lines),
    bestLevel: Math.max(record.bestLevel, result.level),
  };
};

const trimDaily = (results: Record<string, number>): Record<string, number> =>
  Object.fromEntries(
    Object.entries(results)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, DAILY_HISTORY_LIMIT),
  );

/**
 * Folds one finished game into the player's progress: records, totals, recent history, the Daily
 * streak and achievements. Pure, so it is easy to test and safe to replay.
 */
export const applyGameResult = (
  progress: Progress,
  result: GameResult,
  gameId: number,
): { progress: Progress; summary: GameOutcomeSummary } => {
  const previous = progress.records[result.mode];
  const isRecord = beatsRecord(result, previous);
  const previousBest =
    MODES[result.mode].record === 'time'
      ? (previous?.bestTimeMs ?? null)
      : (previous?.bestScore ?? null);

  const totals = {
    games: progress.totals.games + 1,
    lines: progress.totals.lines + result.lines,
    tetrises: progress.totals.tetrises + result.tetrises,
    pieces: progress.totals.pieces + result.pieces,
    playTimeMs: progress.totals.playTimeMs + result.timeMs,
    maxCombo: Math.max(progress.totals.maxCombo, result.maxCombo),
    maxChain: Math.max(progress.totals.maxChain, result.maxChain),
    maxZoneLines: Math.max(progress.totals.maxZoneLines, result.maxZoneLines),
  };

  let daily = progress.daily;
  const isOfficialDaily =
    result.mode === 'daily' && result.dateKey !== null && !(result.dateKey in daily.results);
  if (isOfficialDaily && result.dateKey) {
    const continues = daily.lastDateKey === previousDateKey(result.dateKey);
    const streak = continues ? daily.streak + 1 : 1;
    daily = {
      results: trimDaily({ ...daily.results, [result.dateKey]: result.score }),
      streak,
      bestStreak: Math.max(daily.bestStreak, streak),
      lastDateKey: result.dateKey,
    };
  }

  const recent = [
    {
      mode: result.mode,
      outcome: result.outcome,
      score: result.score,
      lines: result.lines,
      timeMs: result.timeMs,
      finishedAt: result.finishedAt,
    },
    ...progress.recent,
  ].slice(0, RECENT_LIMIT);

  const updated: Progress = {
    ...progress,
    records: { ...progress.records, [result.mode]: updateRecord(previous, result) },
    totals,
    recent,
    daily,
  };
  const unlocked = newlyEarned(result, updated);
  const achievements = { ...updated.achievements };
  for (const id of unlocked) achievements[id] = result.finishedAt;

  return {
    progress: { ...updated, achievements },
    summary: { gameId, isRecord, isOfficialDaily, previousBest, unlocked },
  };
};

/**
 * The streak still shown today: it only survives if the last Daily was today or yesterday.
 */
export const currentStreak = (daily: Progress['daily'], todayKey: string): number =>
  daily.lastDateKey === todayKey || daily.lastDateKey === previousDateKey(todayKey)
    ? daily.streak
    : 0;

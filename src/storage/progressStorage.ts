import { MODES } from '../game/modes';
import type { GameMode, GameOutcome } from '../game/types';
import { ACHIEVEMENTS } from '../progress/achievements';
import { EMPTY_PROGRESS, RECENT_LIMIT } from '../progress/records';
import type { ModeRecord, Progress, RecentGame, Totals } from '../progress/types';
import { isRecord, readJson, writeJson } from './jsonStorage';
import { STORAGE_KEYS } from './storageKeys';

const count = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

const isMode = (value: unknown): value is GameMode => typeof value === 'string' && value in MODES;

const OUTCOMES: readonly GameOutcome[] = ['topOut', 'completed', 'timeUp'];
const isOutcome = (value: unknown): value is GameOutcome =>
  typeof value === 'string' && (OUTCOMES as readonly string[]).includes(value);

const parseRecord = (value: unknown): ModeRecord | null => {
  if (!isRecord(value)) return null;
  const time = count(value.bestTimeMs);
  return {
    plays: count(value.plays),
    bestScore: count(value.bestScore),
    bestTimeMs: time > 0 ? time : null,
    bestLines: count(value.bestLines),
    bestLevel: count(value.bestLevel),
  };
};

const parseTotals = (value: unknown): Totals => {
  const source = isRecord(value) ? value : {};
  const totals = { ...EMPTY_PROGRESS.totals };
  for (const key of Object.keys(totals) as (keyof Totals)[]) totals[key] = count(source[key]);
  return totals;
};

const parseRecent = (value: unknown): RecentGame[] =>
  (Array.isArray(value) ? value : [])
    .filter(isRecord)
    .filter((game) => isMode(game.mode) && isOutcome(game.outcome))
    .map((game) => ({
      mode: game.mode as GameMode,
      outcome: game.outcome as GameOutcome,
      score: count(game.score),
      lines: count(game.lines),
      timeMs: count(game.timeMs),
      finishedAt: count(game.finishedAt),
    }))
    .slice(0, RECENT_LIMIT);

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts any stored value and keeps only well-formed parts; anything broken resets to empty. */
export const parseProgress = (value: unknown): Progress => {
  if (!isRecord(value)) return EMPTY_PROGRESS;

  const records: Progress['records'] = {};
  if (isRecord(value.records)) {
    for (const [mode, record] of Object.entries(value.records)) {
      const parsed = parseRecord(record);
      if (isMode(mode) && parsed) records[mode] = parsed;
    }
  }

  const daily = isRecord(value.daily) ? value.daily : {};
  const results: Record<string, number> = {};
  if (isRecord(daily.results)) {
    for (const [key, score] of Object.entries(daily.results)) {
      if (DATE_KEY.test(key)) results[key] = count(score);
    }
  }

  const achievements: Progress['achievements'] = {};
  if (isRecord(value.achievements)) {
    for (const { id } of ACHIEVEMENTS) {
      const at = count(value.achievements[id]);
      if (at > 0) achievements[id] = at;
    }
  }

  return {
    records,
    totals: parseTotals(value.totals),
    recent: parseRecent(value.recent),
    daily: {
      results,
      streak: count(daily.streak),
      bestStreak: count(daily.bestStreak),
      lastDateKey:
        typeof daily.lastDateKey === 'string' && DATE_KEY.test(daily.lastDateKey)
          ? daily.lastDateKey
          : null,
    },
    achievements,
  };
};

/**
 * v1 kept a single high score and a few bests for what is now Marathon. Carry them over so
 * updating the app never wipes a player's record.
 */
export const migrateV1 = (value: unknown): Progress => {
  if (!isRecord(value)) return EMPTY_PROGRESS;
  const games = count(value.gamesPlayed);
  return {
    ...EMPTY_PROGRESS,
    records: {
      marathon: {
        plays: games,
        bestScore: count(value.highScore),
        bestTimeMs: null,
        bestLines: count(value.bestLines),
        bestLevel: count(value.bestLevel),
      },
    },
    totals: { ...EMPTY_PROGRESS.totals, games },
  };
};

export const loadProgress = async (): Promise<Progress> => {
  const stored = await readJson(STORAGE_KEYS.progress);
  if (stored !== null) return parseProgress(stored);
  const legacy = await readJson(STORAGE_KEYS.statsV1);
  return legacy === null ? EMPTY_PROGRESS : migrateV1(legacy);
};

export const saveProgress = (progress: Progress): Promise<void> =>
  writeJson(STORAGE_KEYS.progress, progress);

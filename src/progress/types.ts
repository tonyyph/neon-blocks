import type { GameMode, GameOutcome, GameState } from '../game/types';

/** Everything worth remembering about one finished game. */
export interface GameResult {
  mode: GameMode;
  dateKey: string | null;
  outcome: GameOutcome;
  score: number;
  lines: number;
  level: number;
  timeMs: number;
  pieces: number;
  tetrises: number;
  backToBacks: number;
  maxCombo: number;
  maxChain: number;
  maxZoneLines: number;
  finishedAt: number;
}

export interface ModeRecord {
  plays: number;
  bestScore: number;
  /** Fastest completion, for Sprint and Dig. Null until the mode has been completed. */
  bestTimeMs: number | null;
  bestLines: number;
  bestLevel: number;
}

export interface RecentGame {
  mode: GameMode;
  outcome: GameOutcome;
  score: number;
  lines: number;
  timeMs: number;
  finishedAt: number;
}

export interface Totals {
  games: number;
  lines: number;
  tetrises: number;
  pieces: number;
  playTimeMs: number;
  maxCombo: number;
  maxChain: number;
  maxZoneLines: number;
}

export interface DailyProgress {
  /** The official (first) score of each day played, by date key. */
  results: Record<string, number>;
  streak: number;
  bestStreak: number;
  lastDateKey: string | null;
}

export type AchievementId =
  | 'first-game'
  | 'first-tetris'
  | 'tetris-25'
  | 'back-to-back'
  | 'combo-5'
  | 'lines-100'
  | 'lines-1000'
  | 'level-10'
  | 'marathon-50k'
  | 'sprint-done'
  | 'sprint-2min'
  | 'ultra-20k'
  | 'dig-done'
  | 'dig-90s'
  | 'chain-3'
  | 'chain-5'
  | 'zone-8'
  | 'zone-16'
  | 'mutator-5'
  | 'daily-first'
  | 'daily-streak-7'
  | 'speed-2pps';

export interface Progress {
  records: Partial<Record<GameMode, ModeRecord>>;
  totals: Totals;
  recent: RecentGame[];
  daily: DailyProgress;
  /** Unlock time (epoch ms) of each earned achievement. */
  achievements: Partial<Record<AchievementId, number>>;
}

/** What a finished game changed, for the game-over screen. */
export interface GameOutcomeSummary {
  gameId: number;
  isRecord: boolean;
  /** True for the first Daily game of the day; later ones are practice. */
  isOfficialDaily: boolean;
  previousBest: number | null;
  unlocked: AchievementId[];
}

export const toGameResult = (state: GameState, finishedAt: number): GameResult => ({
  mode: state.mode,
  dateKey: state.dateKey,
  outcome: state.outcome ?? 'topOut',
  score: state.score,
  lines: state.lines,
  level: state.level,
  timeMs: Math.round(state.elapsedMs),
  pieces: state.piecesPlaced,
  tetrises: state.tetrises,
  backToBacks: state.backToBacks,
  maxCombo: state.maxCombo,
  maxChain: state.maxChain,
  maxZoneLines: state.maxZoneLines,
  finishedAt,
});

/** Pieces per second over a whole game. */
export const piecesPerSecond = (pieces: number, timeMs: number): number =>
  timeMs > 0 ? pieces / (timeMs / 1000) : 0;

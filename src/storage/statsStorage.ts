import { isRecord, readJson, writeJson } from './jsonStorage';
import { STORAGE_KEYS } from './storageKeys';

export type PersistedStats = {
  highScore: number;
  gamesPlayed: number;
  bestLines: number;
  bestLevel: number;
};

export const DEFAULT_STATS: PersistedStats = {
  highScore: 0,
  gamesPlayed: 0,
  bestLines: 0,
  bestLevel: 0,
};

const toCount = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

export const parseStats = (value: unknown): PersistedStats => {
  if (!isRecord(value)) return DEFAULT_STATS;
  return {
    highScore: toCount(value.highScore),
    gamesPlayed: toCount(value.gamesPlayed),
    bestLines: toCount(value.bestLines),
    bestLevel: toCount(value.bestLevel),
  };
};

export interface GameResult {
  score: number;
  lines: number;
  level: number;
}

export const applyGameResult = (stats: PersistedStats, result: GameResult): PersistedStats => ({
  highScore: Math.max(stats.highScore, result.score),
  gamesPlayed: stats.gamesPlayed + 1,
  bestLines: Math.max(stats.bestLines, result.lines),
  bestLevel: Math.max(stats.bestLevel, result.level),
});

export const loadStats = async (): Promise<PersistedStats> =>
  parseStats(await readJson(STORAGE_KEYS.stats));

export const saveStats = (stats: PersistedStats): Promise<void> =>
  writeJson(STORAGE_KEYS.stats, stats);

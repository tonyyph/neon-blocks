import { create } from 'zustand';

import {
  DEFAULT_STATS,
  type GameResult,
  type PersistedStats,
  applyGameResult,
  loadStats,
  saveStats,
} from '../storage/statsStorage';

export interface LastGameOutcome {
  gameId: number;
  isNewHighScore: boolean;
}

interface StatsStore {
  stats: PersistedStats;
  lastOutcome: LastGameOutcome | null;
  hydrate: () => Promise<void>;
  /** Records a finished game once; repeated calls for the same game id are ignored. */
  recordGame: (gameId: number, result: GameResult) => void;
  resetStats: () => void;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  stats: DEFAULT_STATS,
  lastOutcome: null,
  hydrate: async () => set({ stats: await loadStats() }),
  recordGame: (gameId, result) => {
    const { stats, lastOutcome } = get();
    if (lastOutcome?.gameId === gameId) return;
    const next = applyGameResult(stats, result);
    set({
      stats: next,
      lastOutcome: { gameId, isNewHighScore: result.score > 0 && result.score > stats.highScore },
    });
    void saveStats(next);
  },
  resetStats: () => {
    set({ stats: DEFAULT_STATS });
    void saveStats(DEFAULT_STATS);
  },
}));

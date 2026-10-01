import { create } from 'zustand';

import { EMPTY_PROGRESS, applyGameResult } from '../progress/records';
import type { GameOutcomeSummary, GameResult, Progress } from '../progress/types';
import { loadProgress, saveProgress } from '../storage/progressStorage';

interface StatsStore {
  progress: Progress;
  /** What the last finished game changed, for the game-over screen. */
  lastOutcome: GameOutcomeSummary | null;
  hydrate: () => Promise<void>;
  /** Records a finished game once; repeated calls for the same game id are ignored. */
  recordGame: (gameId: number, result: GameResult) => void;
  resetProgress: () => void;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  progress: EMPTY_PROGRESS,
  lastOutcome: null,
  hydrate: async () => set({ progress: await loadProgress() }),
  recordGame: (gameId, result) => {
    const { progress, lastOutcome } = get();
    if (lastOutcome?.gameId === gameId) return;
    const applied = applyGameResult(progress, result, gameId);
    set({ progress: applied.progress, lastOutcome: applied.summary });
    void saveProgress(applied.progress);
  },
  resetProgress: () => {
    set({ progress: EMPTY_PROGRESS, lastOutcome: null });
    void saveProgress(EMPTY_PROGRESS);
  },
}));

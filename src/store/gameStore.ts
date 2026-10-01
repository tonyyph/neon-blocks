import { create } from 'zustand';

import { dailySeed, toDateKey } from '../game/modes';
import { createInitialState, gameReducer } from '../game/reducer';
import type { GameAction, GameMode, GameState } from '../game/types';

interface GameStore {
  game: GameState;
  dispatch: (action: GameAction) => void;
}

/**
 * The whole game lives in one pure reducer; this store only holds its current state so
 * components can subscribe to the slices they draw.
 */
export const useGameStore = create<GameStore>((set) => ({
  game: createInitialState(),
  dispatch: (action) => set((store) => ({ game: gameReducer(store.game, action) })),
}));

export const dispatchGame = (action: GameAction) => useGameStore.getState().dispatch(action);

/**
 * Starts a game in `mode`, or replays the current mode when omitted. Daily games take their seed
 * from today's date so every player gets the same pieces.
 */
export const startNewGame = (mode?: GameMode) => {
  const next = mode ?? useGameStore.getState().game.mode;
  if (next === 'daily') {
    const dateKey = toDateKey(new Date());
    dispatchGame({ type: 'start', seed: dailySeed(dateKey), mode: next, dateKey });
  } else {
    dispatchGame({ type: 'start', seed: Date.now(), mode: next });
  }
};

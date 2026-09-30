import { create } from 'zustand';

import { createInitialState, gameReducer } from '../game/reducer';
import type { GameAction, GameState } from '../game/types';

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

export const startNewGame = () => dispatchGame({ type: 'start', seed: Date.now() });

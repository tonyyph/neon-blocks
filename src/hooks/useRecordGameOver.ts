import { useEffect } from 'react';

import { useGameStore } from '../store/gameStore';
import { useStatsStore } from '../store/statsStore';

/** Saves stats the moment a game ends. The stats store ignores repeats for the same game. */
export const useRecordGameOver = () => {
  useEffect(
    () =>
      useGameStore.subscribe(({ game }, previous) => {
        if (game.status !== 'gameOver' || previous.game.status === 'gameOver') return;
        useStatsStore.getState().recordGame(game.gameId, {
          score: game.score,
          lines: game.lines,
          level: game.level,
        });
      }),
    [],
  );
};

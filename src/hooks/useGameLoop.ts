import { useEffect } from 'react';
import { AppState } from 'react-native';

import { dispatchGame, useGameStore } from '../store/gameStore';

/**
 * Drives the reducer with frame deltas while a game is playing. There is exactly one
 * requestAnimationFrame chain, created when play starts and cancelled on pause, game over or
 * unmount, so ticks can never stack up. The app also pauses itself when sent to the background.
 */
export const useGameLoop = () => {
  const playing = useGameStore((store) => store.game.status === 'playing');

  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    let last: number | null = null;
    const loop = (now: number) => {
      if (last !== null) dispatchGame({ type: 'tick', deltaMs: now - last });
      last = now;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next !== 'active') dispatchGame({ type: 'pause' });
    });
    return () => subscription.remove();
  }, []);
};

import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

import type { GameEvent } from '../game/types';
import { useGameStore } from '../store/gameStore';
import { getSettings } from '../store/settingsStore';

const ignore = () => undefined;

/** Haptics are fire-and-forget; devices without a taptic engine simply reject. */
const whenEnabled = (effect: () => Promise<void>) => {
  if (getSettings().hapticsEnabled) effect().catch(ignore);
};

export const haptics = {
  tap: () => whenEnabled(() => Haptics.selectionAsync()),
  impact: () => whenEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => whenEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () =>
    whenEnabled(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => whenEnabled(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

export const useHaptics = () => haptics;

const hapticForEvents = (events: readonly GameEvent[]): (() => void) | null => {
  let feedback: (() => void) | null = null;
  for (const event of events) {
    if (event.type === 'gameOver') return haptics.error;
    if (event.type === 'lineClear') feedback = event.lines === 4 ? haptics.heavy : haptics.success;
    else if (event.type === 'hardDrop' && !feedback) feedback = haptics.impact;
  }
  return feedback;
};

/** Plays one haptic per game action for the events that deserve physical feedback. */
export const useGameEventHaptics = () => {
  useEffect(
    () =>
      useGameStore.subscribe((store, previous) => {
        if (store.game.events === previous.game.events) return;
        hapticForEvents(store.game.events)?.();
      }),
    [],
  );
};

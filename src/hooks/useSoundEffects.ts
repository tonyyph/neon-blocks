import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';

import type { GameEvent } from '../game/types';
import { useGameStore } from '../store/gameStore';
import { getSettings } from '../store/settingsStore';

const SOUNDS = {
  move: require('../../assets/sounds/move.wav'),
  rotate: require('../../assets/sounds/rotate.wav'),
  hold: require('../../assets/sounds/hold.wav'),
  lock: require('../../assets/sounds/lock.wav'),
  hardDrop: require('../../assets/sounds/hard-drop.wav'),
  clear: require('../../assets/sounds/clear.wav'),
  tetris: require('../../assets/sounds/tetris.wav'),
  levelUp: require('../../assets/sounds/level-up.wav'),
  gameOver: require('../../assets/sounds/game-over.wav'),
} as const;

type SoundName = keyof typeof SOUNDS;

const VOLUME: Partial<Record<SoundName, number>> = { move: 0.35, rotate: 0.5 };

/** Picks at most one "action" sound and one "result" sound for everything an action caused. */
export const soundsForEvents = (events: readonly GameEvent[]): SoundName[] => {
  let action: SoundName | null = null;
  let result: SoundName | null = null;
  for (const event of events) {
    switch (event.type) {
      case 'gameOver':
        return ['gameOver'];
      case 'lineClear':
        result = event.lines === 4 ? 'tetris' : result === 'levelUp' ? result : 'clear';
        break;
      case 'levelUp':
        result = 'levelUp';
        break;
      case 'hardDrop':
        action = 'hardDrop';
        break;
      case 'lock':
        action = action ?? 'lock';
        break;
      default:
        action = action ?? event.type;
    }
  }
  const sounds: (SoundName | null)[] = [action, result];
  return sounds.filter((name): name is SoundName => name !== null);
};

/** Loads the effects once, plays them in response to game events and releases them on unmount. */
export const useSoundEffects = () => {
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(
      () => undefined,
    );

    const players = {} as Record<SoundName, AudioPlayer>;
    for (const name of Object.keys(SOUNDS) as SoundName[]) {
      try {
        players[name] = createAudioPlayer(SOUNDS[name]);
        players[name].volume = VOLUME[name] ?? 0.8;
      } catch {
        // A missing player only means that effect stays silent.
      }
    }

    const play = (name: SoundName) => {
      const player = players[name];
      if (!player) return;
      try {
        player.seekTo(0).catch(() => undefined);
        player.play();
      } catch {
        // Never let audio failures interrupt play.
      }
    };

    const unsubscribe = useGameStore.subscribe((store, previous) => {
      const { events } = store.game;
      if (events === previous.game.events || !events.length) return;
      if (!getSettings().soundEnabled) return;
      soundsForEvents(events).forEach(play);
    });

    return () => {
      unsubscribe();
      Object.values(players).forEach((player) => player.release());
    };
  }, []);
};

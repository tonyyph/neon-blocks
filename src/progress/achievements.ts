import type { IconName } from '../components/ui/Icon';
import { type AchievementId, type GameResult, type Progress, piecesPerSecond } from './types';

/** Names and descriptions live in the i18n dictionaries, keyed by id. */
export interface Achievement {
  id: AchievementId;
  icon: IconName;
  /** Checked after the game's result has been added to progress. */
  earned: (result: GameResult, progress: Progress) => boolean;
}

const completed = (result: GameResult, mode: GameResult['mode']) =>
  result.mode === mode && result.outcome === 'completed';

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-game',
    icon: 'power',
    earned: () => true,
  },
  {
    id: 'first-tetris',
    icon: 'numeric-4-box',
    earned: (r) => r.tetrises > 0,
  },
  {
    id: 'tetris-25',
    icon: 'layers-triple',
    earned: (_, p) => p.totals.tetrises >= 25,
  },
  {
    id: 'back-to-back',
    icon: 'repeat',
    earned: (r) => r.backToBacks > 0,
  },
  {
    id: 'combo-5',
    icon: 'music-note-eighth',
    earned: (r) => r.maxCombo >= 5,
  },
  {
    id: 'lines-100',
    icon: 'counter',
    earned: (_, p) => p.totals.lines >= 100,
  },
  {
    id: 'lines-1000',
    icon: 'trophy-variant',
    earned: (_, p) => p.totals.lines >= 1000,
  },
  {
    id: 'level-10',
    icon: 'speedometer',
    earned: (r) => r.level >= 10,
  },
  {
    id: 'marathon-50k',
    icon: 'run-fast',
    earned: (r) => r.mode === 'marathon' && r.score >= 50_000,
  },
  {
    id: 'sprint-done',
    icon: 'flag-checkered',
    earned: (r) => completed(r, 'sprint'),
  },
  {
    id: 'sprint-2min',
    icon: 'timer-outline',
    earned: (r) => completed(r, 'sprint') && r.timeMs < 120_000,
  },
  {
    id: 'ultra-20k',
    icon: 'lightning-bolt',
    earned: (r) => r.mode === 'ultra' && r.score >= 20_000,
  },
  {
    id: 'dig-done',
    icon: 'shovel',
    earned: (r) => completed(r, 'dig'),
  },
  {
    id: 'dig-90s',
    icon: 'excavator',
    earned: (r) => completed(r, 'dig') && r.timeMs < 90_000,
  },
  {
    id: 'chain-3',
    icon: 'link-variant',
    earned: (r) => r.maxChain >= 3,
  },
  {
    id: 'chain-5',
    icon: 'fire',
    earned: (r) => r.maxChain >= 5,
  },
  {
    id: 'zone-8',
    icon: 'timer-sand',
    earned: (r) => r.maxZoneLines >= 8,
  },
  {
    id: 'zone-16',
    icon: 'timer-sand-complete',
    earned: (r) => r.maxZoneLines >= 16,
  },
  {
    id: 'mutator-5',
    icon: 'dna',
    earned: (r) => r.mode === 'mutators' && r.level >= 5,
  },
  {
    id: 'daily-first',
    icon: 'calendar-check',
    earned: (r) => r.mode === 'daily',
  },
  {
    id: 'daily-streak-7',
    icon: 'calendar-star',
    earned: (_, p) => p.daily.streak >= 7,
  },
  {
    id: 'speed-2pps',
    icon: 'hand-pointing-right',
    earned: (r) => r.pieces >= 100 && piecesPerSecond(r.pieces, r.timeMs) >= 2,
  },
];

/** Achievements this game earned that were not already unlocked. */
export const newlyEarned = (result: GameResult, progress: Progress): AchievementId[] =>
  ACHIEVEMENTS.filter(
    (achievement) => !progress.achievements[achievement.id] && achievement.earned(result, progress),
  ).map((achievement) => achievement.id);

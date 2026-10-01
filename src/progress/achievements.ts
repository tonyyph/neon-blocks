import type { IconName } from '../components/ui/Icon';
import { type AchievementId, type GameResult, type Progress, piecesPerSecond } from './types';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: IconName;
  /** Checked after the game's result has been added to progress. */
  earned: (result: GameResult, progress: Progress) => boolean;
}

const completed = (result: GameResult, mode: GameResult['mode']) =>
  result.mode === mode && result.outcome === 'completed';

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-game',
    name: 'Boot sequence',
    description: 'Finish your first game.',
    icon: 'power',
    earned: () => true,
  },
  {
    id: 'first-tetris',
    name: 'Four at once',
    description: 'Clear four lines with one piece.',
    icon: 'numeric-4-box',
    earned: (r) => r.tetrises > 0,
  },
  {
    id: 'tetris-25',
    name: 'Quad stacker',
    description: 'Clear 25 Tetrises in total.',
    icon: 'layers-triple',
    earned: (_, p) => p.totals.tetrises >= 25,
  },
  {
    id: 'back-to-back',
    name: 'Encore',
    description: 'Score a Tetris straight after another.',
    icon: 'repeat',
    earned: (r) => r.backToBacks > 0,
  },
  {
    id: 'combo-5',
    name: 'Rhythm',
    description: 'Clear lines with six pieces in a row.',
    icon: 'music-note-eighth',
    earned: (r) => r.maxCombo >= 5,
  },
  {
    id: 'lines-100',
    name: 'Century',
    description: 'Clear 100 lines in total.',
    icon: 'counter',
    earned: (_, p) => p.totals.lines >= 100,
  },
  {
    id: 'lines-1000',
    name: 'Thousand rows',
    description: 'Clear 1,000 lines in total.',
    icon: 'trophy-variant',
    earned: (_, p) => p.totals.lines >= 1000,
  },
  {
    id: 'level-10',
    name: 'Terminal velocity',
    description: 'Reach level 10 in any mode.',
    icon: 'speedometer',
    earned: (r) => r.level >= 10,
  },
  {
    id: 'marathon-50k',
    name: 'Long haul',
    description: 'Score 50,000 in Marathon.',
    icon: 'run-fast',
    earned: (r) => r.mode === 'marathon' && r.score >= 50_000,
  },
  {
    id: 'sprint-done',
    name: 'Off the line',
    description: 'Finish a Sprint.',
    icon: 'flag-checkered',
    earned: (r) => completed(r, 'sprint'),
  },
  {
    id: 'sprint-2min',
    name: 'Under two',
    description: 'Finish a Sprint in under 2 minutes.',
    icon: 'timer-outline',
    earned: (r) => completed(r, 'sprint') && r.timeMs < 120_000,
  },
  {
    id: 'ultra-20k',
    name: 'Overclocked',
    description: 'Score 20,000 in one Ultra.',
    icon: 'lightning-bolt',
    earned: (r) => r.mode === 'ultra' && r.score >= 20_000,
  },
  {
    id: 'dig-done',
    name: 'Bedrock',
    description: 'Dig through all the garbage.',
    icon: 'shovel',
    earned: (r) => completed(r, 'dig'),
  },
  {
    id: 'dig-90s',
    name: 'Excavator',
    description: 'Finish Dig in under 90 seconds.',
    icon: 'excavator',
    earned: (r) => completed(r, 'dig') && r.timeMs < 90_000,
  },
  {
    id: 'chain-3',
    name: 'Chain reaction',
    description: 'Set off a 3-link chain in Cascade.',
    icon: 'link-variant',
    earned: (r) => r.maxChain >= 3,
  },
  {
    id: 'chain-5',
    name: 'Meltdown',
    description: 'Set off a 5-link chain in Cascade.',
    icon: 'fire',
    earned: (r) => r.maxChain >= 5,
  },
  {
    id: 'zone-8',
    name: 'Octoris',
    description: 'Bank 8 lines in one Zone.',
    icon: 'timer-sand',
    earned: (r) => r.maxZoneLines >= 8,
  },
  {
    id: 'zone-16',
    name: 'Decahexatris',
    description: 'Bank 16 lines in one Zone.',
    icon: 'timer-sand-complete',
    earned: (r) => r.maxZoneLines >= 16,
  },
  {
    id: 'mutator-5',
    name: 'Adaptive',
    description: 'Reach level 5 in Mutators.',
    icon: 'dna',
    earned: (r) => r.mode === 'mutators' && r.level >= 5,
  },
  {
    id: 'daily-first',
    name: 'Clocked in',
    description: 'Play a Daily challenge.',
    icon: 'calendar-check',
    earned: (r) => r.mode === 'daily',
  },
  {
    id: 'daily-streak-7',
    name: 'Seven days',
    description: 'Play the Daily seven days running.',
    icon: 'calendar-star',
    earned: (_, p) => p.daily.streak >= 7,
  },
  {
    id: 'speed-2pps',
    name: 'Fast hands',
    description: 'Average 2 pieces a second over 100+ pieces.',
    icon: 'hand-pointing-right',
    earned: (r) => r.pieces >= 100 && piecesPerSecond(r.pieces, r.timeMs) >= 2,
  },
];

/** Achievements this game earned that were not already unlocked. */
export const newlyEarned = (result: GameResult, progress: Progress): AchievementId[] =>
  ACHIEVEMENTS.filter(
    (achievement) => !progress.achievements[achievement.id] && achievement.earned(result, progress),
  ).map((achievement) => achievement.id);

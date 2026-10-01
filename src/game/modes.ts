import type { GameMode, Mutator } from './types';

export type RecordKind = 'score' | 'time';

export interface ModeConfig {
  id: GameMode;
  name: string;
  /** One line for the mode picker: what you do and how it ends. */
  summary: string;
  /** The game ends with outcome 'timeUp' when the clock reaches this. */
  timeLimitMs: number | null;
  /** The game ends with outcome 'completed' once this many lines are cleared. */
  lineGoal: number | null;
  /** Rows of garbage the board starts with; clearing them all completes the game. */
  garbageRows: number;
  /** Floating blocks fall after a clear and can set off chain clears. */
  cascade: boolean;
  zone: boolean;
  /** A new random mutator at every level. */
  mutators: boolean;
  /** What counts as a record: highest score, or fastest completion. */
  record: RecordKind;
}

export const MODES: Record<GameMode, ModeConfig> = {
  marathon: {
    id: 'marathon',
    name: 'Marathon',
    summary: 'Endless. Faster every 10 lines.',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    record: 'score',
  },
  sprint: {
    id: 'sprint',
    name: 'Sprint',
    summary: 'Clear 40 lines as fast as you can.',
    timeLimitMs: null,
    lineGoal: 40,
    garbageRows: 0,
    cascade: false,
    zone: false,
    mutators: false,
    record: 'time',
  },
  ultra: {
    id: 'ultra',
    name: 'Ultra',
    summary: 'Two minutes. Score as much as you can.',
    timeLimitMs: 120_000,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    record: 'score',
  },
  dig: {
    id: 'dig',
    name: 'Dig',
    summary: 'Ten rows of garbage. Dig to the floor.',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 10,
    cascade: false,
    zone: false,
    mutators: false,
    record: 'time',
  },
  cascade: {
    id: 'cascade',
    name: 'Cascade',
    summary: 'Loose blocks fall after a clear. Chain the reactions.',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: true,
    zone: false,
    mutators: false,
    record: 'score',
  },
  mutators: {
    id: 'mutators',
    name: 'Mutators',
    summary: 'Every level twists a rule: fog, mirror, ghosts, turbo.',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: true,
    record: 'score',
  },
  daily: {
    id: 'daily',
    name: 'Daily',
    summary: 'Three minutes, today’s pieces and today’s twist.',
    timeLimitMs: 180_000,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    record: 'score',
  },
};

/** Order of the mode picker. Daily gets its own card above the list. */
export const MODE_ORDER: readonly GameMode[] = [
  'marathon',
  'sprint',
  'ultra',
  'dig',
  'cascade',
  'mutators',
];

export const MUTATORS: readonly Mutator[] = ['fog', 'mirror', 'invisible', 'turbo'];

export const MUTATOR_INFO: Record<Mutator, { name: string; hint: string }> = {
  fog: { name: 'Fog', hint: 'The bottom of the well is hidden.' },
  mirror: { name: 'Mirror', hint: 'Left and right are swapped.' },
  invisible: { name: 'Ghosts', hint: 'Locked blocks fade to outlines.' },
  turbo: { name: 'Turbo', hint: 'Gravity doubles.' },
};

/** Local calendar date as YYYY-MM-DD; the key for Daily seeds and history. */
export const toDateKey = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** The date key of the day before `dateKey`. */
export const previousDateKey = (dateKey: string): string => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1, d - 1));
};

/** FNV-1a over the date key: everyone gets the same seed on the same day. */
export const dailySeed = (dateKey: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** Today's twist, fixed for the whole Daily game. */
export const dailyMutator = (dateKey: string): Mutator =>
  MUTATORS[dailySeed(`twist:${dateKey}`) % MUTATORS.length];

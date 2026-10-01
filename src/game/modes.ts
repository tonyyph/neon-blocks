import type { GameMode, Mutator } from './types';

export type RecordKind = 'score' | 'time';

export interface ModeConfig {
  id: GameMode;
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
  /** Pieces fall on their own. Off only in the tutorial, so nobody is rushed while learning. */
  gravity: boolean;
  /** What counts as a record: highest score, or fastest completion. */
  record: RecordKind;
}

export const MODES: Record<GameMode, ModeConfig> = {
  marathon: {
    id: 'marathon',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    gravity: true,
    record: 'score',
  },
  sprint: {
    id: 'sprint',
    timeLimitMs: null,
    lineGoal: 40,
    garbageRows: 0,
    cascade: false,
    zone: false,
    mutators: false,
    gravity: true,
    record: 'time',
  },
  ultra: {
    id: 'ultra',
    timeLimitMs: 120_000,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    gravity: true,
    record: 'score',
  },
  dig: {
    id: 'dig',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 10,
    cascade: false,
    zone: false,
    mutators: false,
    gravity: true,
    record: 'time',
  },
  cascade: {
    id: 'cascade',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: true,
    zone: false,
    mutators: false,
    gravity: true,
    record: 'score',
  },
  mutators: {
    id: 'mutators',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: true,
    gravity: true,
    record: 'score',
  },
  daily: {
    id: 'daily',
    timeLimitMs: 180_000,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    gravity: true,
    record: 'score',
  },
  tutorial: {
    id: 'tutorial',
    timeLimitMs: null,
    lineGoal: null,
    garbageRows: 0,
    cascade: false,
    zone: true,
    mutators: false,
    gravity: false,
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

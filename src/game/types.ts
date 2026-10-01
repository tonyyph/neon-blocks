export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** Grey rows that Dig mode starts with. */
export const GARBAGE = 'G';
/** Lines cleared during Zone, stacked at the bottom until Zone ends. */
export const ZONE_LINE = 'X';

/**
 * A board cell: empty, the type of the piece that locked there, a garbage block, or a Zone line.
 */
export type Cell = PieceType | typeof GARBAGE | typeof ZONE_LINE | null;

/** Row-major grid, `board[y][x]`. Row 0 is the top of the hidden spawn zone. */
export type Board = readonly (readonly Cell[])[];

export type Rotation = 0 | 1 | 2 | 3;

export interface Point {
  x: number;
  y: number;
}

/** The falling piece. `x`/`y` locate the top-left corner of its bounding box. */
export interface ActivePiece {
  type: PieceType;
  rotation: Rotation;
  x: number;
  y: number;
}

/**
 * A prepared starting position, for the tutorial: a board to start on, the first pieces to deal
 * (random 7-bags follow), and an optional pre-charged Zone meter.
 */
export interface Scenario {
  board?: Board;
  pieces?: readonly PieceType[];
  zoneMeter?: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export type GameMode =
  'marathon' | 'sprint' | 'ultra' | 'dig' | 'cascade' | 'mutators' | 'daily' | 'tutorial';

/** How a game ended: stacked out, reached its goal, or ran out of time. */
export type GameOutcome = 'topOut' | 'completed' | 'timeUp';

/** Temporary rule changes in Mutators mode (and the daily twist). */
export type Mutator = 'fog' | 'mirror' | 'invisible' | 'turbo';

export interface ZoneState {
  /** Charge from 0 to 1. Zone can start once it reaches ZONE_MIN_METER. */
  meter: number;
  active: boolean;
  remainingMs: number;
  /** Lines banked at the bottom of the board during this Zone. */
  lines: number;
}

export type GameEvent =
  | { type: 'move'; dx: -1 | 1 }
  | { type: 'softDrop' }
  | { type: 'rotate' }
  | { type: 'hold' }
  | { type: 'hardDrop'; cells: number }
  | { type: 'lock' }
  | { type: 'lineClear'; lines: number }
  | { type: 'levelUp'; level: number }
  | { type: 'chain'; chain: number }
  | { type: 'zoneStart' }
  | { type: 'zoneEnd'; lines: number }
  | { type: 'mutator'; mutator: Mutator }
  | { type: 'gameOver'; outcome: GameOutcome };

export interface ClearSummary {
  /** Increments with every clear so the UI can re-trigger its label animation. */
  id: number;
  lines: number;
  points: number;
  backToBack: boolean;
  combo: number;
  /** Position in a Cascade chain: 1 for the first clear, 2+ for clears caused by falling blocks. */
  chain: number;
  /** Set when this summary is the burst of lines banked during Zone. */
  zone: boolean;
}

export interface ClearingRows {
  rows: readonly number[];
  elapsedMs: number;
}

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  gameId: number;
  /** Date (YYYY-MM-DD) whose seed and twist a Daily game uses; null for other modes. */
  dateKey: string | null;
  outcome: GameOutcome | null;
  board: Board;
  active: ActivePiece | null;
  queue: readonly PieceType[];
  hold: PieceType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  /** Consecutive locks that cleared lines, minus one. -1 means no combo running. */
  combo: number;
  /** True when the previous line clear was a Tetris, arming the back-to-back bonus. */
  backToBack: boolean;
  gravityMs: number;
  lockMs: number;
  lockResets: number;
  /** Deepest row the current piece has reached; reaching a new one refreshes lock resets. */
  lowestY: number;
  /** Full rows flashing before they collapse. Input is ignored while set. */
  clearing: ClearingRows | null;
  lastClear: ClearSummary | null;
  /** Play time, which drives Sprint, Ultra and Daily clocks and pieces-per-second. */
  elapsedMs: number;
  piecesPlaced: number;
  tetrises: number;
  backToBacks: number;
  maxCombo: number;
  chain: number;
  maxChain: number;
  /** Rows still holding garbage in Dig mode. */
  garbageLeft: number;
  mutator: Mutator | null;
  zone: ZoneState;
  maxZoneLines: number;
  seed: number;
  /** Side effects produced by the most recent action, for sound and haptics. */
  events: readonly GameEvent[];
}

export type GameAction =
  | { type: 'start'; seed: number; mode?: GameMode; dateKey?: string; scenario?: Scenario }
  | { type: 'tick'; deltaMs: number }
  | { type: 'move'; dx: -1 | 1 }
  | { type: 'rotate'; direction: 1 | -1 }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'hold' }
  | { type: 'activateZone' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'quit' };

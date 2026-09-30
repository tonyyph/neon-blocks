export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** A board cell is either empty or holds the type of the piece that locked there. */
export type Cell = PieceType | null;

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

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export type GameEvent =
  | { type: 'move' }
  | { type: 'rotate' }
  | { type: 'hold' }
  | { type: 'hardDrop'; cells: number }
  | { type: 'lock' }
  | { type: 'lineClear'; lines: number }
  | { type: 'levelUp'; level: number }
  | { type: 'gameOver' };

export interface ClearSummary {
  /** Increments with every clear so the UI can re-trigger its label animation. */
  id: number;
  lines: number;
  points: number;
  backToBack: boolean;
  combo: number;
}

export interface ClearingRows {
  rows: readonly number[];
  elapsedMs: number;
}

export interface GameState {
  status: GameStatus;
  gameId: number;
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
  seed: number;
  /** Side effects produced by the most recent action, for sound and haptics. */
  events: readonly GameEvent[];
}

export type GameAction =
  | { type: 'start'; seed: number }
  | { type: 'tick'; deltaMs: number }
  | { type: 'move'; dx: -1 | 1 }
  | { type: 'rotate'; direction: 1 | -1 }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'hold' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'quit' };

export const BOARD_WIDTH = 10;
export const VISIBLE_ROWS = 20;
/** Rows above the visible field where pieces spawn. */
export const HIDDEN_ROWS = 2;
export const BOARD_HEIGHT = VISIBLE_ROWS + HIDDEN_ROWS;

export const NEXT_QUEUE_SIZE = 3;

export const LOCK_DELAY_MS = 500;
/** Moves/rotations on the ground that may restart the lock delay before the piece is forced down. */
export const MAX_LOCK_RESETS = 15;
export const LINE_CLEAR_MS = 220;
/** Longest frame the loop will simulate, so a stalled JS thread cannot drop a piece through several rows. */
export const MAX_TICK_MS = 100;

export const LINES_PER_LEVEL = 10;

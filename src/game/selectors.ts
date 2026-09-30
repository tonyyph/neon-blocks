import { getPieceCells } from './board';
import { BOARD_WIDTH, HIDDEN_ROWS, NEXT_QUEUE_SIZE } from './constants';
import { getGhostPiece } from './ghost';
import type { ActivePiece, Board, GameState, PieceType } from './types';

export const selectNextPieces = (state: GameState): readonly PieceType[] =>
  state.queue.slice(0, NEXT_QUEUE_SIZE);

export const EMPTY_CELL = '.';

/**
 * Encodes each visible row as a string, one character per cell: `.` empty, an upper-case piece
 * letter for a block, a lower-case letter for the ghost. Rows are compared by value, so the board
 * only re-renders rows whose contents actually changed.
 */
export const getVisibleRowSignatures = (
  board: Board,
  active: ActivePiece | null,
  showGhost: boolean,
): string[] => {
  const grid: string[][] = board
    .slice(HIDDEN_ROWS)
    .map((row) => row.map((cell) => cell ?? EMPTY_CELL));

  const paint = (piece: ActivePiece, glyph: string) => {
    for (const { x, y } of getPieceCells(piece)) {
      const row = grid[y - HIDDEN_ROWS];
      if (row && x >= 0 && x < BOARD_WIDTH) row[x] = glyph;
    }
  };

  if (active) {
    if (showGhost) paint(getGhostPiece(board, active), active.type.toLowerCase());
    paint(active, active.type);
  }
  return grid.map((row) => row.join(''));
};

/** Visible-row indices of rows currently flashing before they clear. */
export const getVisibleClearingRows = (state: GameState): readonly number[] =>
  state.clearing ? state.clearing.rows.map((y) => y - HIDDEN_ROWS).filter((y) => y >= 0) : [];

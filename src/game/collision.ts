import { getPieceCells } from './board';
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import type { ActivePiece, Board } from './types';

export const collides = (board: Board, piece: ActivePiece): boolean =>
  getPieceCells(piece).some(
    ({ x, y }) => x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT || board[y][x] !== null,
  );

/** Returns the moved piece, or null if the move is blocked. */
export const tryMove = (
  board: Board,
  piece: ActivePiece,
  dx: number,
  dy: number,
): ActivePiece | null => {
  const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return collides(board, moved) ? null : moved;
};

export const isGrounded = (board: Board, piece: ActivePiece): boolean =>
  tryMove(board, piece, 0, 1) === null;

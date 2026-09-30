import { tryMove } from './collision';
import type { ActivePiece, Board } from './types';

/** Where the piece would land if hard-dropped now. */
export const getGhostPiece = (board: Board, piece: ActivePiece): ActivePiece => {
  let ghost = piece;
  for (let next = tryMove(board, ghost, 0, 1); next; next = tryMove(board, ghost, 0, 1)) {
    ghost = next;
  }
  return ghost;
};

export const getDropDistance = (board: Board, piece: ActivePiece): number =>
  getGhostPiece(board, piece).y - piece.y;

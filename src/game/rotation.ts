import { collides } from './collision';
import type { ActivePiece, Board, Point, Rotation } from './types';

type KickTable = Record<string, readonly (readonly [number, number])[]>;

/*
 * Super Rotation System wall kicks, written as in the guideline (x right, y UP) and keyed
 * "from>to" with 0 = spawn, 1 = R, 2 = 2, 3 = L. `toBoardOffset` flips y for our y-down grid.
 */
// prettier-ignore
const JLSTZ_KICKS: KickTable = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// prettier-ignore
const I_KICKS: KickTable = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

const toBoardOffset = ([x, y]: readonly [number, number]): Point => ({ x, y: -y });

export const getRotatedState = (rotation: Rotation, direction: 1 | -1): Rotation =>
  ((((rotation + direction) % 4) + 4) % 4) as Rotation;

export const getKicks = (piece: ActivePiece, to: Rotation): Point[] => {
  const table = piece.type === 'I' ? I_KICKS : JLSTZ_KICKS;
  return table[`${piece.rotation}>${to}`].map(toBoardOffset);
};

/**
 * Rotates with SRS wall kicks. Returns the first kick position that fits, or null if none do.
 * The O piece is rotationally symmetric, so it never rotates.
 */
export const tryRotate = (
  board: Board,
  piece: ActivePiece,
  direction: 1 | -1,
): ActivePiece | null => {
  if (piece.type === 'O') return null;
  const rotation = getRotatedState(piece.rotation, direction);
  for (const kick of getKicks(piece, rotation)) {
    const candidate = { ...piece, rotation, x: piece.x + kick.x, y: piece.y + kick.y };
    if (!collides(board, candidate)) return candidate;
  }
  return null;
};

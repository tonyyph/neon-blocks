import { BOARD_WIDTH } from './constants';
import type { PieceType, Point, Rotation } from './types';

export const PIECE_TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/** Spawn orientation of each piece, in the Super Rotation System's bounding boxes. */
const SPAWN_SHAPES: Record<PieceType, readonly (readonly number[])[]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const rotateClockwise = (matrix: readonly (readonly number[])[]): number[][] =>
  matrix.map((row, y) => row.map((_, x) => matrix[matrix.length - 1 - x][y]));

const toCells = (matrix: readonly (readonly number[])[]): Point[] => {
  const cells: Point[] = [];
  matrix.forEach((row, y) =>
    row.forEach((filled, x) => {
      if (filled) cells.push({ x, y });
    }),
  );
  return cells;
};

const buildRotations = (type: PieceType): readonly (readonly Point[])[] => {
  const rotations: Point[][] = [];
  let matrix = SPAWN_SHAPES[type].map((row) => [...row]);
  for (let i = 0; i < 4; i += 1) {
    rotations.push(toCells(matrix));
    matrix = rotateClockwise(matrix);
  }
  return rotations;
};

/** Cell offsets for every piece and rotation, relative to the bounding box's top-left. */
export const PIECE_CELLS: Record<PieceType, readonly (readonly Point[])[]> = {
  I: buildRotations('I'),
  O: buildRotations('O'),
  T: buildRotations('T'),
  S: buildRotations('S'),
  Z: buildRotations('Z'),
  J: buildRotations('J'),
  L: buildRotations('L'),
};

export const getShapeSize = (type: PieceType): number => SPAWN_SHAPES[type].length;

export const getPieceOffsets = (type: PieceType, rotation: Rotation): readonly Point[] =>
  PIECE_CELLS[type][rotation];

/** Column where a piece's bounding box starts so it spawns centred (left-biased for odd widths). */
export const getSpawnX = (type: PieceType): number =>
  Math.floor((BOARD_WIDTH - getShapeSize(type)) / 2);

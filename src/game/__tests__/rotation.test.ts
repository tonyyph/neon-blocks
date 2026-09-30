import { createEmptyBoard, getPieceCells } from '../board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';
import { PIECE_CELLS, PIECE_TYPES, getSpawnX } from '../pieces';
import { getRotatedState, tryRotate } from '../rotation';
import type { ActivePiece } from '../types';
import { boardFrom } from '../__fixtures__/boards';

const sortCells = (cells: { x: number; y: number }[]) =>
  [...cells].sort((a, b) => a.y - b.y || a.x - b.x);

describe('pieces', () => {
  it('defines all 7 tetrominoes with 4 cells in every rotation', () => {
    expect(PIECE_TYPES).toEqual(['I', 'O', 'T', 'S', 'Z', 'J', 'L']);
    PIECE_TYPES.forEach((type) => {
      expect(PIECE_CELLS[type]).toHaveLength(4);
      PIECE_CELLS[type].forEach((cells) => expect(cells).toHaveLength(4));
    });
  });

  it('spawns pieces centred', () => {
    expect(getSpawnX('I')).toBe(3);
    expect(getSpawnX('O')).toBe(4);
    expect(getSpawnX('T')).toBe(3);
  });

  it('matches the SRS T states', () => {
    // R state: stem pointing right.
    expect(sortCells([...PIECE_CELLS.T[1]])).toEqual(
      sortCells([
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ]),
    );
  });
});

describe('rotation', () => {
  const board = createEmptyBoard();
  const T: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 5 };

  it('wraps rotation states both ways', () => {
    expect(getRotatedState(0, 1)).toBe(1);
    expect(getRotatedState(3, 1)).toBe(0);
    expect(getRotatedState(0, -1)).toBe(3);
  });

  it('rotates clockwise and counter-clockwise in open space without kicking', () => {
    expect(tryRotate(board, T, 1)).toEqual({ ...T, rotation: 1 });
    expect(tryRotate(board, T, -1)).toEqual({ ...T, rotation: 3 });
  });

  it('four clockwise rotations return to the start', () => {
    let piece: ActivePiece | null = T;
    for (let i = 0; i < 4; i += 1) piece = piece && tryRotate(board, piece, 1);
    expect(piece).toEqual(T);
  });

  it('never rotates the O piece', () => {
    expect(tryRotate(board, { type: 'O', rotation: 0, x: 4, y: 5 }, 1)).toBeNull();
  });

  it('kicks off the left wall', () => {
    // T in R state hugging the left wall: its box starts at x = -1, so state 2 needs a kick.
    const piece: ActivePiece = { type: 'T', rotation: 1, x: -1, y: 5 };
    const rotated = tryRotate(board, piece, 1);
    expect(rotated).not.toBeNull();
    expect(rotated!.rotation).toBe(2);
    expect(rotated!.x).toBe(0);
    getPieceCells(rotated!).forEach(({ x }) => expect(x).toBeGreaterThanOrEqual(0));
  });

  it('kicks the I piece off the right wall', () => {
    // Vertical I in the rightmost column.
    const piece: ActivePiece = { type: 'I', rotation: 1, x: BOARD_WIDTH - 3, y: 5 };
    getPieceCells(piece).forEach(({ x }) => expect(x).toBe(BOARD_WIDTH - 1));
    const rotated = tryRotate(board, piece, 1);
    expect(rotated).not.toBeNull();
    getPieceCells(rotated!).forEach(({ x }) => expect(x).toBeLessThan(BOARD_WIDTH));
  });

  it('kicks off the floor', () => {
    const piece: ActivePiece = { type: 'T', rotation: 0, x: 3, y: BOARD_HEIGHT - 2 };
    const rotated = tryRotate(board, piece, 1);
    expect(rotated).not.toBeNull();
    getPieceCells(rotated!).forEach(({ y }) => expect(y).toBeLessThan(BOARD_HEIGHT));
  });

  it('fails when every kick is blocked', () => {
    // Vertical I in a one-wide well cannot turn horizontal anywhere.
    const well = boardFrom(Array.from({ length: BOARD_HEIGHT }, () => '####.#####'));
    const piece: ActivePiece = { type: 'I', rotation: 1, x: 2, y: 10 };
    expect(tryRotate(well, piece, 1)).toBeNull();
  });
});

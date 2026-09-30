import { clearRows, createEmptyBoard, findFullRows, mergePiece } from '../board';
import { collides, isGrounded, tryMove } from '../collision';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';
import { getDropDistance, getGhostPiece } from '../ghost';
import type { ActivePiece } from '../types';
import { FULL, boardFrom } from '../__fixtures__/boards';

const T: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 0 };

describe('createEmptyBoard', () => {
  it('is 10 wide and 22 tall (20 visible + 2 hidden) and entirely empty', () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_HEIGHT);
    expect(BOARD_HEIGHT).toBe(22);
    board.forEach((row) => {
      expect(row).toHaveLength(BOARD_WIDTH);
      expect(row.every((cell) => cell === null)).toBe(true);
    });
  });

  it('gives every row its own array', () => {
    const board = createEmptyBoard();
    expect(board[0]).not.toBe(board[1]);
  });
});

describe('collision', () => {
  const board = createEmptyBoard();

  it('allows a piece inside an empty board', () => {
    expect(collides(board, T)).toBe(false);
  });

  it('detects the left and right walls', () => {
    expect(collides(board, { ...T, x: -1 })).toBe(true);
    expect(collides(board, { ...T, x: BOARD_WIDTH - 2 })).toBe(true);
    expect(collides(board, { ...T, x: BOARD_WIDTH - 3 })).toBe(false);
  });

  it('detects the floor', () => {
    expect(collides(board, { ...T, y: BOARD_HEIGHT - 2 })).toBe(false);
    expect(collides(board, { ...T, y: BOARD_HEIGHT - 1 })).toBe(true);
  });

  it('detects locked blocks', () => {
    const blocked = boardFrom(['###.......']);
    expect(collides(blocked, { ...T, x: 0, y: BOARD_HEIGHT - 2 })).toBe(true);
    expect(collides(blocked, { ...T, x: 3, y: BOARD_HEIGHT - 2 })).toBe(false);
  });
});

describe('tryMove', () => {
  const board = createEmptyBoard();

  it('moves left, right and down', () => {
    expect(tryMove(board, T, -1, 0)).toEqual({ ...T, x: 2 });
    expect(tryMove(board, T, 1, 0)).toEqual({ ...T, x: 4 });
    expect(tryMove(board, T, 0, 1)).toEqual({ ...T, y: 1 });
  });

  it('returns null when blocked', () => {
    expect(tryMove(board, { ...T, x: 0 }, -1, 0)).toBeNull();
  });

  it('does not mutate the piece', () => {
    const piece = { ...T };
    tryMove(board, piece, 1, 0);
    expect(piece).toEqual(T);
  });
});

describe('mergePiece', () => {
  it('writes the piece cells without mutating the source board', () => {
    const board = createEmptyBoard();
    const merged = mergePiece(board, T);
    expect(merged[0][4]).toBe('T');
    expect(merged[1].slice(3, 6)).toEqual(['T', 'T', 'T']);
    expect(board[0][4]).toBeNull();
    expect(merged[5]).toBe(board[5]);
  });
});

describe('line clear', () => {
  it('finds full rows', () => {
    const board = boardFrom([FULL, '#########.', FULL]);
    expect(findFullRows(board)).toEqual([BOARD_HEIGHT - 3, BOARD_HEIGHT - 1]);
  });

  it('removes full rows and shifts the rest down', () => {
    const board = boardFrom(['#.........', FULL, '.#........', FULL]);
    const cleared = clearRows(board, findFullRows(board));
    expect(cleared).toHaveLength(BOARD_HEIGHT);
    expect(findFullRows(cleared)).toEqual([]);
    expect(cleared[BOARD_HEIGHT - 1][1]).toBe('Z');
    expect(cleared[BOARD_HEIGHT - 2][0]).toBe('Z');
    expect(cleared[BOARD_HEIGHT - 3].every((c) => c === null)).toBe(true);
  });

  it('clears four rows at once', () => {
    const board = boardFrom([FULL, FULL, FULL, FULL]);
    const cleared = clearRows(board, findFullRows(board));
    expect(cleared.flat().every((c) => c === null)).toBe(true);
  });
});

describe('ghost', () => {
  it('lands on the floor on an empty board', () => {
    const ghost = getGhostPiece(createEmptyBoard(), T);
    expect(ghost.y).toBe(BOARD_HEIGHT - 2);
    expect(isGrounded(createEmptyBoard(), ghost)).toBe(true);
  });

  it('lands on top of the stack', () => {
    const board = boardFrom(['....#.....', FULL]);
    expect(getDropDistance(board, T)).toBe(BOARD_HEIGHT - 4);
  });
});

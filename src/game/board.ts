import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { getPieceOffsets } from './pieces';
import { type ActivePiece, type Board, type Cell, type Point, ZONE_LINE } from './types';

const createEmptyRow = (): Cell[] => Array.from({ length: BOARD_WIDTH }, () => null);

export const createEmptyBoard = (): Board => Array.from({ length: BOARD_HEIGHT }, createEmptyRow);

export const getPieceCells = (piece: ActivePiece): Point[] =>
  getPieceOffsets(piece.type, piece.rotation).map((offset) => ({
    x: piece.x + offset.x,
    y: piece.y + offset.y,
  }));

/** Returns a new board with the piece written into it. Only the touched rows are copied. */
export const mergePiece = (board: Board, piece: ActivePiece): Board => {
  const next = [...board];
  for (const { x, y } of getPieceCells(piece)) {
    const row = [...next[y]];
    row[x] = piece.type;
    next[y] = row;
  }
  return next;
};

/** A row is full when every cell is filled. Banked Zone lines don't count: they stay until Zone ends. */
export const isRowFull = (row: readonly Cell[]): boolean =>
  row.every((cell) => cell !== null) && !row.every((cell) => cell === ZONE_LINE);

export const findFullRows = (board: Board): number[] =>
  board.reduce<number[]>((rows, row, y) => (isRowFull(row) ? [...rows, y] : rows), []);

/** Removes the given rows and drops everything above them, keeping the board height constant. */
export const clearRows = (board: Board, rows: readonly number[]): Board => {
  if (rows.length === 0) return board;
  const remove = new Set(rows);
  const kept = board.filter((_, y) => !remove.has(y));
  return [...Array.from({ length: rows.length }, createEmptyRow), ...kept];
};

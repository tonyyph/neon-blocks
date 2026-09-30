import { createEmptyBoard } from '../board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';
import type { Board, Cell } from '../types';

/**
 * Builds a board from rows drawn bottom-up-aligned: the last string is the bottom row.
 * `#` is a locked block (stored as 'Z'), anything else is empty.
 */
export const boardFrom = (rows: string[]): Board => {
  const board = createEmptyBoard().map((row) => [...row]);
  const offset = BOARD_HEIGHT - rows.length;
  rows.forEach((line, i) => {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      board[offset + i][x] = (line[x] === '#' ? 'Z' : null) as Cell;
    }
  });
  return board;
};

export const FULL = '##########';

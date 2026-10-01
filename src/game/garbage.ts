import { BOARD_WIDTH } from './constants';
import { type Board, type Cell, GARBAGE } from './types';

/**
 * Fills the bottom `rows` of the board with garbage: each row solid except one hole. Consecutive
 * holes never line up, so no single piece clears two rows at once.
 */
export const addGarbageRows = (board: Board, rows: number, random: () => number): Board => {
  const next = board.map((row) => [...row]);
  let previousHole = -1;
  for (let i = 0; i < rows; i += 1) {
    let hole = Math.floor(random() * BOARD_WIDTH);
    if (hole === previousHole)
      hole = (hole + 1 + Math.floor(random() * (BOARD_WIDTH - 1))) % BOARD_WIDTH;
    previousHole = hole;
    next[next.length - 1 - i] = Array.from({ length: BOARD_WIDTH }, (_, x): Cell =>
      x === hole ? null : GARBAGE,
    );
  }
  return next;
};

export const countGarbageRows = (board: Board): number =>
  board.filter((row) => row.includes(GARBAGE)).length;

import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import type { Board, Cell, Point } from './types';

/** 4-connected groups of filled cells. Each group falls as one rigid piece. */
const findGroups = (board: Board): Point[][] => {
  const seen = board.map((row) => row.map(() => false));
  const groups: Point[][] = [];
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (seen[y][x] || board[y][x] === null) continue;
      const group: Point[] = [];
      const stack: Point[] = [{ x, y }];
      seen[y][x] = true;
      while (stack.length) {
        const cell = stack.pop()!;
        group.push(cell);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cell.x + dx;
          const ny = cell.y + dy;
          if (nx < 0 || nx >= BOARD_WIDTH || ny < 0 || ny >= BOARD_HEIGHT) continue;
          if (seen[ny][nx] || board[ny][nx] === null) continue;
          seen[ny][nx] = true;
          stack.push({ x: nx, y: ny });
        }
      }
      groups.push(group);
    }
  }
  return groups;
};

/**
 * Lets every unsupported group of blocks fall until it rests on the floor or another group, the
 * way loose rubble settles after a clear. Groups keep their shape. Returns the same board object
 * when nothing moves.
 */
export const settleCascade = (board: Board): Board => {
  const grid: Cell[][] = board.map((row) => [...row]);
  let moved = false;
  let changed = true;

  while (changed) {
    changed = false;
    // Lowest groups first, so a group never falls through one that is about to drop.
    const groups = findGroups(grid).sort(
      (a, b) => Math.max(...b.map((c) => c.y)) - Math.max(...a.map((c) => c.y)),
    );
    for (const group of groups) {
      const own = new Set(group.map(({ x, y }) => y * BOARD_WIDTH + x));
      let drop = 0;
      const fits = (d: number) =>
        group.every(({ x, y }) => {
          const ny = y + d;
          if (ny >= BOARD_HEIGHT) return false;
          return grid[ny][x] === null || own.has(ny * BOARD_WIDTH + x);
        });
      while (fits(drop + 1)) drop += 1;
      if (drop === 0) continue;

      const cells = group.map(({ x, y }) => ({ x, y, value: grid[y][x] }));
      for (const { x, y } of cells) grid[y][x] = null;
      for (const { x, y, value } of cells) grid[y + drop][x] = value;
      changed = true;
      moved = true;
    }
  }

  return moved ? grid : board;
};

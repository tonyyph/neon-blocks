import { getPieceCells } from '../board';
import {
  BOARD_HEIGHT,
  HIDDEN_ROWS,
  LINE_CLEAR_MS,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
} from '../constants';
import { getDropDistance } from '../ghost';
import { createInitialState, gameReducer } from '../reducer';
import { getVisibleRowSignatures, selectNextPieces } from '../selectors';
import type { ActivePiece, GameAction, GameState } from '../types';
import { FULL, boardFrom } from '../__fixtures__/boards';

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);
const start = (seed = 123) => gameReducer(createInitialState(), { type: 'start', seed });

/** Forces a specific active piece, as if it had just spawned. */
const withPiece = (state: GameState, piece: ActivePiece): GameState => ({
  ...state,
  active: piece,
  lowestY: piece.y,
});

const tickFor = (state: GameState, ms: number, step = 16) => {
  let next = state;
  for (let t = 0; t < ms; t += step) next = gameReducer(next, { type: 'tick', deltaMs: step });
  return next;
};

describe('start', () => {
  it('spawns a piece, fills the queue and resets stats', () => {
    const state = start();
    expect(state.status).toBe('playing');
    expect(state.active).not.toBeNull();
    expect(selectNextPieces(state)).toHaveLength(3);
    expect(state).toMatchObject({ score: 0, lines: 0, level: 1, hold: null, canHold: true });
    expect(state.gameId).toBe(1);
  });

  it('shows the spawned piece in the visible field', () => {
    const { active } = start();
    const rows = getPieceCells(active!).map(({ y }) => y);
    expect(Math.max(...rows)).toBeGreaterThanOrEqual(HIDDEN_ROWS);
  });

  it('deals the first 7 pieces as one full bag', () => {
    let state = start(99);
    const seen = new Set<string>();
    for (let i = 0; i < 7; i += 1) {
      seen.add(state.active!.type);
      state = gameReducer(state, { type: 'hardDrop' });
      state = tickFor(state, LINE_CLEAR_MS + 50);
    }
    expect(seen.size).toBe(7);
  });
});

describe('movement', () => {
  it('moves left and right and emits an event', () => {
    const state = start();
    const moved = gameReducer(state, { type: 'move', dx: -1 });
    expect(moved.active!.x).toBe(state.active!.x - 1);
    expect(moved.events).toEqual([{ type: 'move' }]);
  });

  it('stops at the wall', () => {
    let state = start();
    for (let i = 0; i < 15; i += 1) state = gameReducer(state, { type: 'move', dx: -1 });
    const minX = Math.min(...getPieceCells(state.active!).map(({ x }) => x));
    expect(minX).toBe(0);
  });

  it('rotates', () => {
    const state = withPiece(start(), { type: 'T', rotation: 0, x: 3, y: 5 });
    expect(gameReducer(state, { type: 'rotate', direction: 1 }).active!.rotation).toBe(1);
    expect(gameReducer(state, { type: 'rotate', direction: -1 }).active!.rotation).toBe(3);
  });

  it('falls one row per drop interval', () => {
    const state = start();
    const y = state.active!.y;
    expect(tickFor(state, 992).active!.y).toBe(y);
    expect(tickFor(state, 1008).active!.y).toBe(y + 1);
  });

  it('ignores input while paused and resumes', () => {
    const paused = gameReducer(start(), { type: 'pause' });
    expect(paused.status).toBe('paused');
    expect(run(paused, { type: 'move', dx: 1 }, { type: 'tick', deltaMs: 100 })).toEqual({
      ...paused,
      events: paused.events,
    });
    expect(gameReducer(paused, { type: 'resume' }).status).toBe('playing');
  });
});

describe('drops and scoring', () => {
  it('soft drop moves down one row per step and scores 1 per row', () => {
    const state = tickFor(start(), 600);
    const next = run(state, { type: 'softDrop' }, { type: 'softDrop' });
    expect(next.active!.y).toBe(state.active!.y + 2);
    expect(next.score).toBe(2);
    // Gravity restarts from the new row rather than firing straight away.
    expect(next.gravityMs).toBe(0);
  });

  it('soft drop does nothing on the ground', () => {
    const grounded = withPiece(start(), { type: 'T', rotation: 0, x: 3, y: BOARD_HEIGHT - 2 });
    expect(gameReducer(grounded, { type: 'softDrop' })).toEqual({ ...grounded, events: [] });
  });

  it('gravity alone never scores', () => {
    expect(tickFor(start(), 5000).score).toBe(0);
  });

  it('hard drop locks immediately and scores 2 per cell', () => {
    const state = start();
    const distance = getDropDistance(state.board, state.active!);
    const next = gameReducer(state, { type: 'hardDrop' });
    expect(next.score).toBe(distance * 2);
    expect(next.board.flat().filter(Boolean)).toHaveLength(4);
    expect(next.events).toEqual(
      expect.arrayContaining([{ type: 'hardDrop', cells: distance }, { type: 'lock' }]),
    );
    expect(next.active).not.toBeNull();
  });

  it('clears a line, scores it, flashes, then collapses', () => {
    const board = boardFrom(['#########.']);
    const I: ActivePiece = { type: 'I', rotation: 1, x: 7, y: 5 };
    const state = withPiece({ ...start(), board }, I);
    const dropped = gameReducer(state, { type: 'hardDrop' });
    const distance = BOARD_HEIGHT - 4 - 5;
    expect(dropped.lines).toBe(1);
    expect(dropped.score).toBe(distance * 2 + 100);
    expect(dropped.clearing?.rows).toEqual([BOARD_HEIGHT - 1]);
    expect(dropped.active).toBeNull();
    expect(dropped.events).toContainEqual({ type: 'lineClear', lines: 1 });

    const ignored = gameReducer(dropped, { type: 'move', dx: 1 });
    expect(ignored.active).toBeNull();

    const collapsed = tickFor(dropped, LINE_CLEAR_MS + 20);
    expect(collapsed.clearing).toBeNull();
    expect(collapsed.active).not.toBeNull();
    // The three I cells above the cleared row slid down by one.
    expect(collapsed.board[BOARD_HEIGHT - 1][9]).toBe('I');
    expect(collapsed.board.flat().filter(Boolean)).toHaveLength(3);
  });

  it('scores a Tetris and a back-to-back Tetris with combo', () => {
    const board = boardFrom([
      '#########.',
      '#########.',
      '#########.',
      '#########.',
      '#########.',
      '#########.',
      '#########.',
      '#########.',
    ]);
    const I: ActivePiece = { type: 'I', rotation: 1, x: 7, y: 0 };
    let state = withPiece({ ...start(), board, score: 0 }, I);
    state = gameReducer(state, { type: 'hardDrop' });
    const firstDrop = BOARD_HEIGHT - 4;
    expect(state.score).toBe(firstDrop * 2 + 800);
    expect(state.backToBack).toBe(true);
    expect(state.lastClear).toMatchObject({ lines: 4, backToBack: false, combo: 0 });

    state = withPiece(tickFor(state, LINE_CLEAR_MS + 20), I);
    const before = state.score;
    state = gameReducer(state, { type: 'hardDrop' });
    expect(state.score - before).toBe(firstDrop * 2 + 800 + 400 + 50);
    expect(state.lastClear).toMatchObject({ lines: 4, backToBack: true, combo: 1 });
  });

  it('levels up every 10 lines', () => {
    const board = boardFrom(['#########.']);
    const I: ActivePiece = { type: 'I', rotation: 1, x: 7, y: 5 };
    const state = withPiece({ ...start(), board, lines: 9 }, I);
    const next = gameReducer(state, { type: 'hardDrop' });
    expect(next.lines).toBe(10);
    expect(next.level).toBe(2);
    expect(next.events).toContainEqual({ type: 'levelUp', level: 2 });
  });
});

describe('lock delay', () => {
  it('locks a grounded piece after the lock delay', () => {
    let state = start();
    const T: ActivePiece = { type: 'T', rotation: 0, x: 3, y: BOARD_HEIGHT - 2 };
    state = withPiece(state, T);
    state = tickFor(state, LOCK_DELAY_MS - 50);
    expect(state.active).toEqual(T);
    state = tickFor(state, 100);
    expect(state.board[BOARD_HEIGHT - 1][4]).toBe('T');
    expect(state.active).not.toEqual(T);
  });

  it('moving on the ground resets the delay, but only a limited number of times', () => {
    let state = withPiece(start(), { type: 'T', rotation: 0, x: 3, y: BOARD_HEIGHT - 2 });
    for (let i = 0; i < MAX_LOCK_RESETS; i += 1) {
      state = tickFor(state, LOCK_DELAY_MS - 100);
      state = gameReducer(state, { type: 'move', dx: i % 2 === 0 ? 1 : -1 });
      expect(state.board.flat().filter(Boolean)).toHaveLength(0);
    }
    state = tickFor(state, 32);
    expect(state.board.flat().filter(Boolean)).toHaveLength(4);
  });
});

describe('hold', () => {
  it('stores the current piece and spawns the next when hold is empty', () => {
    const state = start();
    const current = state.active!.type;
    const next = selectNextPieces(state)[0];
    const held = gameReducer(state, { type: 'hold' });
    expect(held.hold).toBe(current);
    expect(held.active!.type).toBe(next);
    expect(held.canHold).toBe(false);
  });

  it('only allows one hold per piece', () => {
    const held = gameReducer(start(), { type: 'hold' });
    expect(gameReducer(held, { type: 'hold' })).toEqual({ ...held, events: [] });
  });

  it('swaps with the held piece after the next lock', () => {
    let state = gameReducer(start(), { type: 'hold' });
    const held = state.hold;
    state = gameReducer(state, { type: 'hardDrop' });
    expect(state.canHold).toBe(true);
    const current = state.active!.type;
    state = gameReducer(state, { type: 'hold' });
    expect(state.active!.type).toBe(held);
    expect(state.hold).toBe(current);
  });
});

describe('game over', () => {
  it('ends the game when a new piece cannot spawn', () => {
    // Only the spawn zone is blocked, so the parked O locks without clearing anything.
    const blocked = boardFrom(
      Array.from({ length: BOARD_HEIGHT }, (_, i) => (i < 2 ? '...####...' : '..........')),
    );
    const state = withPiece(
      { ...start(), board: blocked },
      { type: 'O', rotation: 0, x: 0, y: 10 },
    );
    const next = gameReducer(state, { type: 'hardDrop' });
    expect(next.status).toBe('gameOver');
    expect(next.active).toBeNull();
    expect(next.events).toContainEqual({ type: 'gameOver', outcome: 'topOut' });
    expect(next.outcome).toBe('topOut');
  });

  it('ignores gameplay input after game over, and start begins a fresh game', () => {
    const over: GameState = { ...start(), status: 'gameOver', active: null, score: 999 };
    expect(gameReducer(over, { type: 'hardDrop' })).toBe(over);
    const restarted = gameReducer(over, { type: 'start', seed: 5 });
    expect(restarted.status).toBe('playing');
    expect(restarted.score).toBe(0);
    expect(restarted.gameId).toBe(over.gameId + 1);
    expect(restarted.board.flat().every((c) => c === null)).toBe(true);
  });
});

describe('selectors', () => {
  it('encodes the active piece and its ghost into visible rows', () => {
    const state = withPiece(start(), { type: 'T', rotation: 0, x: 3, y: 2 });
    const rows = getVisibleRowSignatures(state.board, state.active, true);
    expect(rows).toHaveLength(20);
    expect(rows[0]).toBe('....T.....');
    expect(rows[1]).toBe('...TTT....');
    expect(rows[18]).toBe('....t.....');
    expect(rows[19]).toBe('...ttt....');
    expect(getVisibleRowSignatures(state.board, state.active, false)[19]).toBe('..........');
  });

  it('keeps full rows intact in the fixture helper', () => {
    expect(boardFrom([FULL])[BOARD_HEIGHT - 1].every(Boolean)).toBe(true);
  });
});

import { createEmptyBoard, findFullRows } from '../board';
import { settleCascade } from '../cascade';
import { BOARD_HEIGHT, LINE_CLEAR_MS } from '../constants';
import { addGarbageRows, countGarbageRows } from '../garbage';
import { MODES, dailyMutator, dailySeed, previousDateKey, toDateKey } from '../modes';
import { createInitialState, gameReducer } from '../reducer';
import { getVisibleRowSignatures } from '../selectors';
import {
  type ActivePiece,
  type GameAction,
  type GameEvent,
  type GameMode,
  type GameState,
  GARBAGE,
  ZONE_LINE,
} from '../types';
import {
  ZONE_FULL_DURATION_MS,
  bankZoneRows,
  getZoneName,
  getZoneScore,
  isZoneRow,
  releaseZoneRows,
} from '../zone';
import { FULL, boardFrom } from '../__fixtures__/boards';
import { createRandom } from '../../utils/random';

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);
const start = (mode: GameMode, seed = 42, dateKey?: string) =>
  gameReducer(createInitialState(), { type: 'start', seed, mode, dateKey });
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
/** Like tickFor, but also returns every event raised along the way. */
const tickCollect = (state: GameState, ms: number, step = 16) => {
  let next = state;
  const events: GameEvent[] = [];
  for (let t = 0; t < ms; t += step) {
    next = gameReducer(next, { type: 'tick', deltaMs: step });
    events.push(...next.events);
  }
  return { state: next, events };
};
/** Vertical I dropped into the right-hand well of a board full of `#########.` rows. */
const I_WELL: ActivePiece = { type: 'I', rotation: 1, x: 7, y: 0 };
const wellRows = (n: number) => Array.from({ length: n }, () => '#########.');

describe('Sprint', () => {
  it('ends as completed once 40 lines are cleared', () => {
    const state = withPiece(
      { ...start('sprint'), lines: 36, board: boardFrom(wellRows(4)) },
      I_WELL,
    );
    const { state: cleared, events } = tickCollect(
      gameReducer(state, { type: 'hardDrop' }),
      LINE_CLEAR_MS + 32,
    );
    expect(cleared.lines).toBe(40);
    expect(cleared.status).toBe('gameOver');
    expect(cleared.outcome).toBe('completed');
    expect(events).toContainEqual({ type: 'gameOver', outcome: 'completed' });
  });

  it('keeps going below the goal', () => {
    const state = withPiece(
      { ...start('sprint'), lines: 20, board: boardFrom(wellRows(4)) },
      I_WELL,
    );
    expect(tickFor(gameReducer(state, { type: 'hardDrop' }), LINE_CLEAR_MS + 32).status).toBe(
      'playing',
    );
  });

  it('tracks play time', () => {
    expect(tickFor(start('sprint'), 480).elapsedMs).toBeGreaterThanOrEqual(480);
  });
});

describe('Ultra and Daily clocks', () => {
  it('Ultra ends with timeUp at two minutes', () => {
    const state = { ...start('ultra'), elapsedMs: MODES.ultra.timeLimitMs! - 10 };
    const next = gameReducer(state, { type: 'tick', deltaMs: 16 });
    expect(next.outcome).toBe('timeUp');
    expect(next.elapsedMs).toBe(MODES.ultra.timeLimitMs);
  });

  it('Daily uses the date for its seed and twist, the same for everyone', () => {
    const a = start('daily', dailySeed('2026-10-01'), '2026-10-01');
    const b = start('daily', dailySeed('2026-10-01'), '2026-10-01');
    expect(a.queue).toEqual(b.queue);
    expect(a.active?.type).toBe(b.active?.type);
    expect(a.mutator).toBe(dailyMutator('2026-10-01'));
    expect(a.dateKey).toBe('2026-10-01');
    expect(dailySeed('2026-10-01')).not.toBe(dailySeed('2026-10-02'));
  });

  it('formats and steps date keys across month boundaries', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(previousDateKey('2026-03-01')).toBe('2026-02-28');
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31');
  });
});

describe('Dig', () => {
  it('starts with ten garbage rows, each with exactly one hole', () => {
    const state = start('dig');
    expect(state.garbageLeft).toBe(10);
    const rows = state.board.slice(BOARD_HEIGHT - 10);
    rows.forEach((row) => {
      expect(row.filter((c) => c === null)).toHaveLength(1);
      expect(row.filter((c) => c === GARBAGE)).toHaveLength(9);
    });
  });

  it('never stacks two holes in the same column', () => {
    const board = addGarbageRows(createEmptyBoard(), 20, createRandom(3).next);
    const holes = board.slice(2).map((row) => row.indexOf(null));
    for (let i = 1; i < holes.length; i += 1) expect(holes[i]).not.toBe(holes[i - 1]);
  });

  it('completes when the last garbage row is cleared', () => {
    const lastRow = Array.from({ length: 10 }, (_, x) => (x === 9 ? null : GARBAGE));
    const board = createEmptyBoard().map((row) => [...row]);
    board[BOARD_HEIGHT - 1] = lastRow;
    const piece: ActivePiece = { type: 'I', rotation: 1, x: 7, y: 5 };
    const state = withPiece({ ...start('dig'), board, garbageLeft: 1 }, piece);
    const next = tickFor(gameReducer(state, { type: 'hardDrop' }), LINE_CLEAR_MS + 32);
    expect(countGarbageRows(next.board)).toBe(0);
    expect(next.outcome).toBe('completed');
  });
});

describe('Cascade', () => {
  it('drops floating groups as rigid shapes', () => {
    const board = boardFrom(['..##......', '..........', '..........', '#.........']);
    const settled = settleCascade(board);
    expect(settled[BOARD_HEIGHT - 1].slice(0, 4)).toEqual(['Z', null, 'Z', 'Z']);
    expect(settled[BOARD_HEIGHT - 4].every((c) => c === null)).toBe(true);
  });

  it('leaves a supported board untouched', () => {
    const board = boardFrom(['#.........', '##........']);
    expect(settleCascade(board)).toBe(board);
  });

  it('a group resting on another group stays put', () => {
    const board = boardFrom(['.##.......', '.#........', '.#........']);
    expect(settleCascade(board)).toBe(board);
  });
});

describe('Cascade chain scoring', () => {
  it('scores the second link of a chain at double value', () => {
    // The full middle row is mid-clear. Once it goes, the lone block above falls into the gap in
    // the bottom row, completing it: a second link worth 100 x level x 2.
    const clearingState: GameState = {
      ...start('cascade'),
      active: null,
      chain: 1,
      board: boardFrom(['#.........', '##########', '.#########']),
      clearing: { rows: [BOARD_HEIGHT - 2], elapsedMs: 0 },
    };
    const { state: next, events } = tickCollect(clearingState, LINE_CLEAR_MS + 32);
    expect(next.chain).toBe(2);
    expect(next.maxChain).toBe(2);
    expect(next.lastClear).toMatchObject({ chain: 2, lines: 1, points: 200 });
    expect(events).toContainEqual({ type: 'chain', chain: 2 });
    const done = tickFor(next, LINE_CLEAR_MS + 32);
    expect(done.board.flat().filter(Boolean)).toHaveLength(0);
    expect(done.chain).toBe(0);
    expect(done.active).not.toBeNull();
  });
});

describe('Zone', () => {
  it('banks rows at the bottom and releases them', () => {
    const board = boardFrom(['#.........', FULL]);
    const banked = bankZoneRows(board, [BOARD_HEIGHT - 1]);
    expect(isZoneRow(banked[BOARD_HEIGHT - 1])).toBe(true);
    expect(banked[BOARD_HEIGHT - 2][0]).toBe('Z');
    expect(findFullRows(banked)).toEqual([]);
    const released = releaseZoneRows(banked);
    expect(released[BOARD_HEIGHT - 1][0]).toBe('Z');
    expect(released.flat().filter((c) => c === ZONE_LINE)).toHaveLength(0);
  });

  it('scores steeply and names big zones', () => {
    expect(getZoneScore(4, 1)).toBe(1200);
    expect(getZoneScore(16, 2)).toBe(38400);
    expect(getZoneName(7)).toBeNull();
    expect(getZoneName(9)).toBe('Octoris');
    expect(getZoneName(16)).toBe('Decahexatris');
  });

  it('needs half a meter, freezes gravity, banks clears and bursts at the end', () => {
    const empty = start('marathon');
    expect(gameReducer(empty, { type: 'activateZone' }).zone.active).toBe(false);

    const charged = { ...empty, zone: { ...empty.zone, meter: 1 } };
    const zoned = gameReducer(charged, { type: 'activateZone' });
    expect(zoned.zone.active).toBe(true);
    expect(zoned.zone.remainingMs).toBe(ZONE_FULL_DURATION_MS);
    expect(zoned.events).toContainEqual({ type: 'zoneStart' });

    const y = zoned.active!.y;
    expect(tickFor(zoned, 3000).active!.y).toBe(y);

    const filled = withPiece({ ...zoned, board: boardFrom(wellRows(4)) }, I_WELL);
    const banked = gameReducer(filled, { type: 'hardDrop' });
    expect(banked.zone.lines).toBe(4);
    expect(banked.clearing).toBeNull();
    expect(banked.board.slice(BOARD_HEIGHT - 4).every(isZoneRow)).toBe(true);

    const before = banked.score;
    const ended = gameReducer(
      { ...banked, zone: { ...banked.zone, remainingMs: 10 } },
      {
        type: 'tick',
        deltaMs: 16,
      },
    );
    expect(ended.zone.active).toBe(false);
    expect(ended.zone.meter).toBe(0);
    expect(ended.score - before).toBe(getZoneScore(4, banked.level));
    expect(ended.maxZoneLines).toBe(4);
    expect(ended.lastClear).toMatchObject({ zone: true, lines: 4 });
    expect(ended.board.flat().filter((c) => c === ZONE_LINE)).toHaveLength(0);
  });

  it('charges the meter from clears, but not in modes without Zone', () => {
    const play = (mode: GameMode) =>
      gameReducer(withPiece({ ...start(mode), board: boardFrom(wellRows(4)) }, I_WELL), {
        type: 'hardDrop',
      });
    expect(play('marathon').zone.meter).toBe(4 / 16);
    expect(play('sprint').zone.meter).toBe(0);
    expect(
      gameReducer(
        { ...start('sprint'), zone: { meter: 1, active: false, remainingMs: 0, lines: 0 } },
        { type: 'activateZone' },
      ).zone.active,
    ).toBe(false);
  });
});

describe('Mutators', () => {
  it('rolls a new mutator on every level up', () => {
    const state = withPiece(
      { ...start('mutators'), lines: 9, board: boardFrom(wellRows(1)) },
      {
        ...I_WELL,
        y: 5,
      },
    );
    const next = gameReducer(state, { type: 'hardDrop' });
    expect(next.level).toBe(2);
    expect(next.mutator).not.toBeNull();
    expect(next.events).toContainEqual({ type: 'mutator', mutator: next.mutator });
  });

  it('never repeats the same mutator twice in a row', () => {
    let state: GameState = { ...start('mutators'), mutator: 'fog' };
    for (let i = 0; i < 20; i += 1) {
      const leveled = gameReducer(
        withPiece(
          { ...state, lines: state.level * 10 - 1, board: boardFrom(wellRows(1)) },
          {
            ...I_WELL,
            y: 5,
          },
        ),
        { type: 'hardDrop' },
      );
      expect(leveled.mutator).not.toBe(state.mutator);
      state = tickFor(leveled, LINE_CLEAR_MS + 32);
    }
  });

  it('Mirror swaps left and right', () => {
    const state = { ...start('mutators'), mutator: 'mirror' as const };
    expect(gameReducer(state, { type: 'move', dx: -1 }).active!.x).toBe(state.active!.x + 1);
  });

  it('Turbo doubles gravity', () => {
    const normal = start('mutators');
    const turbo = { ...normal, mutator: 'turbo' as const };
    expect(tickFor(turbo, 1008).active!.y - turbo.active!.y).toBe(2);
    expect(tickFor(normal, 1008).active!.y - normal.active!.y).toBe(1);
  });

  it('Fog hides the bottom rows and Ghosts fades locked blocks, but never the active piece', () => {
    const board = boardFrom(['###.......']);
    const piece: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 2 };
    const fog = getVisibleRowSignatures(board, piece, false, 'fog');
    expect(fog[19]).toBe('~~~~~~~~~~');
    expect(fog[0]).toBe('....T.....');
    const faded = getVisibleRowSignatures(board, piece, false, 'invisible');
    expect(faded[19]).toBe('___.......');
  });
});

describe('game stats', () => {
  it('counts pieces, tetrises and back-to-backs', () => {
    let state = withPiece({ ...start('marathon'), board: boardFrom(wellRows(8)) }, I_WELL);
    state = gameReducer(state, { type: 'hardDrop' });
    state = withPiece(tickFor(state, LINE_CLEAR_MS + 32), I_WELL);
    state = gameReducer(state, { type: 'hardDrop' });
    expect(state.piecesPlaced).toBe(2);
    expect(state.tetrises).toBe(2);
    expect(state.backToBacks).toBe(1);
    expect(state.maxCombo).toBe(1);
    expect(run(state).score).toBe(state.score);
  });
});

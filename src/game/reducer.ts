import { createRandom } from '../utils/random';
import { clamp } from '../utils/clamp';
import { clearRows, createEmptyBoard, findFullRows, getPieceCells, mergePiece } from './board';
import { collides, isGrounded, tryMove } from './collision';
import {
  HIDDEN_ROWS,
  LINE_CLEAR_MS,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  MAX_TICK_MS,
  NEXT_QUEUE_SIZE,
} from './constants';
import { getGhostPiece } from './ghost';
import { getDropInterval, getLevel } from './level';
import { getSpawnX } from './pieces';
import { BAG_SIZE, fillQueue } from './randomBag';
import { tryRotate } from './rotation';
import { HARD_DROP_POINTS_PER_CELL, SOFT_DROP_POINTS_PER_CELL, scoreClear } from './scoring';
import type { ActivePiece, GameAction, GameEvent, GameState, PieceType } from './types';

const NO_EVENTS: readonly GameEvent[] = [];

/** Keep at least one full bag beyond the visible preview so the queue never runs dry. */
const MIN_QUEUE_LENGTH = NEXT_QUEUE_SIZE + BAG_SIZE;

export const createInitialState = (seed = 1, gameId = 0): GameState => ({
  status: 'idle',
  gameId,
  board: createEmptyBoard(),
  active: null,
  queue: [],
  hold: null,
  canHold: true,
  score: 0,
  lines: 0,
  level: 1,
  combo: -1,
  backToBack: false,
  gravityMs: 0,
  lockMs: 0,
  lockResets: 0,
  lowestY: 0,
  clearing: null,
  lastClear: null,
  seed,
  events: NO_EVENTS,
});

const withEvents = (state: GameState, ...events: GameEvent[]): GameState => ({
  ...state,
  events: [...state.events, ...events],
});

const gameOver = (state: GameState): GameState =>
  withEvents(
    { ...state, status: 'gameOver', active: null },
    {
      type: 'gameOver',
    },
  );

/** Places a piece at the top of the field, or ends the game if it has no room. */
const spawnPiece = (state: GameState, type: PieceType): GameState => {
  const spawned: ActivePiece = { type, rotation: 0, x: getSpawnX(type), y: 0 };
  if (collides(state.board, spawned)) return gameOver(state);
  // Step one row down straight away so the piece shows in the visible field, as the guideline does.
  const active = tryMove(state.board, spawned, 0, 1) ?? spawned;
  return {
    ...state,
    active,
    gravityMs: 0,
    lockMs: 0,
    lockResets: 0,
    lowestY: active.y,
  };
};

const spawnNext = (state: GameState): GameState => {
  const random = createRandom(state.seed);
  const [next, ...rest] = fillQueue(state.queue, MIN_QUEUE_LENGTH + 1, random.next);
  return spawnPiece(
    { ...state, queue: fillQueue(rest, MIN_QUEUE_LENGTH, random.next), seed: random.seed },
    next,
  );
};

/** Writes the active piece into the board, scores any clears and moves on to the next piece. */
const lockPiece = (state: GameState): GameState => {
  const { active } = state;
  if (!active) return state;

  const board = mergePiece(state.board, active);
  const fullRows = findFullRows(board);
  const lockedAboveField = getPieceCells(active).every(({ y }) => y < HIDDEN_ROWS);
  const base: GameState = withEvents(
    { ...state, board, active: null, canHold: true },
    { type: 'lock' },
  );

  if (fullRows.length === 0) {
    const next = { ...base, combo: -1 };
    return lockedAboveField ? gameOver(next) : spawnNext(next);
  }

  const combo = state.combo + 1;
  const { points, backToBack } = scoreClear(fullRows.length, state.level, combo, state.backToBack);
  const lines = state.lines + fullRows.length;
  const level = getLevel(lines);
  const events: GameEvent[] = [{ type: 'lineClear', lines: fullRows.length }];
  if (level > state.level) events.push({ type: 'levelUp', level });

  return withEvents(
    {
      ...base,
      score: state.score + points,
      lines,
      level,
      combo,
      backToBack: fullRows.length === 4,
      clearing: { rows: fullRows, elapsedMs: 0 },
      lastClear: {
        id: (state.lastClear?.id ?? 0) + 1,
        lines: fullRows.length,
        points,
        backToBack,
        combo,
      },
    },
    ...events,
  );
};

/** After a successful move or rotation on the ground, restart the lock delay while resets remain. */
const afterShift = (state: GameState, active: ActivePiece): GameState => {
  const reachedNewLow = active.y > state.lowestY;
  const grounded = isGrounded(state.board, active);
  const canReset = reachedNewLow || state.lockResets < MAX_LOCK_RESETS;
  return {
    ...state,
    active,
    lowestY: Math.max(state.lowestY, active.y),
    lockResets: reachedNewLow ? 0 : grounded ? state.lockResets + 1 : state.lockResets,
    lockMs: canReset ? 0 : state.lockMs,
  };
};

const stepGravity = (state: GameState, deltaMs: number): GameState => {
  let { active, gravityMs, lowestY, lockResets } = state;
  if (!active) return state;

  const interval = getDropInterval(state.level);

  gravityMs += deltaMs;
  while (gravityMs >= interval) {
    const moved = tryMove(state.board, active, 0, 1);
    if (!moved) {
      gravityMs = 0;
      break;
    }
    active = moved;
    gravityMs -= interval;
    if (moved.y > lowestY) {
      lowestY = moved.y;
      lockResets = 0;
    }
  }

  const grounded = isGrounded(state.board, active);
  const next: GameState = {
    ...state,
    active,
    gravityMs,
    lowestY,
    lockResets,
    lockMs: grounded ? state.lockMs + deltaMs : 0,
  };
  const outOfResets = grounded && lockResets >= MAX_LOCK_RESETS;
  return grounded && (next.lockMs >= LOCK_DELAY_MS || outOfResets) ? lockPiece(next) : next;
};

const stepClearing = (state: GameState, deltaMs: number): GameState => {
  if (!state.clearing) return state;
  const elapsedMs = state.clearing.elapsedMs + deltaMs;
  if (elapsedMs < LINE_CLEAR_MS) return { ...state, clearing: { ...state.clearing, elapsedMs } };
  return spawnNext({
    ...state,
    board: clearRows(state.board, state.clearing.rows),
    clearing: null,
  });
};

const tick = (state: GameState, deltaMs: number): GameState => {
  const dt = clamp(deltaMs, 0, MAX_TICK_MS);
  return state.clearing ? stepClearing(state, dt) : stepGravity(state, dt);
};

const hold = (state: GameState): GameState => {
  if (!state.active || !state.canHold) return state;
  const current = state.active.type;
  const next = withEvents(
    { ...state, active: null, hold: current, canHold: false },
    { type: 'hold' },
  );
  return state.hold ? spawnPiece(next, state.hold) : spawnNext(next);
};

const hardDrop = (state: GameState): GameState => {
  if (!state.active) return state;
  const landed = getGhostPiece(state.board, state.active);
  const cells = landed.y - state.active.y;
  return lockPiece(
    withEvents(
      { ...state, active: landed, score: state.score + cells * HARD_DROP_POINTS_PER_CELL },
      { type: 'hardDrop', cells },
    ),
  );
};

/** Moves the piece down one row by hand, for +1 point. Gravity restarts from the new row. */
const softDrop = (state: GameState, active: ActivePiece): GameState => {
  const moved = tryMove(state.board, active, 0, 1);
  if (!moved) return state;
  return afterShift(
    { ...state, gravityMs: 0, score: state.score + SOFT_DROP_POINTS_PER_CELL },
    moved,
  );
};

/** Handles an action while a piece is under the player's control. */
const playingReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'tick':
      return tick(state, action.deltaMs);
    case 'pause':
      return { ...state, status: 'paused' };
    default:
      break;
  }

  // Everything below needs a live piece; during the line-clear flash there is none.
  if (!state.active) return state;

  switch (action.type) {
    case 'move': {
      const moved = tryMove(state.board, state.active, action.dx, 0);
      return moved ? withEvents(afterShift(state, moved), { type: 'move' }) : state;
    }
    case 'rotate': {
      const rotated = tryRotate(state.board, state.active, action.direction);
      return rotated ? withEvents(afterShift(state, rotated), { type: 'rotate' }) : state;
    }
    case 'softDrop':
      return softDrop(state, state.active);
    case 'hardDrop':
      return hardDrop(state);
    case 'hold':
      return hold(state);
    default:
      return state;
  }
};

const startGame = (state: GameState, seed: number): GameState =>
  spawnNext({ ...createInitialState(seed, state.gameId + 1), status: 'playing' });

export const gameReducer = (previous: GameState, action: GameAction): GameState => {
  // Events describe only what the latest action caused.
  const state = previous.events.length ? { ...previous, events: NO_EVENTS } : previous;

  if (action.type === 'start') return startGame(state, action.seed);
  if (action.type === 'quit') return createInitialState(state.seed, state.gameId);

  switch (state.status) {
    case 'playing':
      return playingReducer(state, action);
    case 'paused':
      return action.type === 'resume' ? { ...state, status: 'playing', gravityMs: 0 } : state;
    default:
      return state;
  }
};

import { clamp } from '../utils/clamp';
import { createRandom } from '../utils/random';
import { clearRows, createEmptyBoard, findFullRows, getPieceCells, mergePiece } from './board';
import { settleCascade } from './cascade';
import { collides, isGrounded, tryMove } from './collision';
import {
  HIDDEN_ROWS,
  LINE_CLEAR_MS,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  MAX_TICK_MS,
  NEXT_QUEUE_SIZE,
} from './constants';
import { addGarbageRows, countGarbageRows } from './garbage';
import { getGhostPiece } from './ghost';
import { getDropInterval, getLevel } from './level';
import { MODES, MUTATORS, dailyMutator } from './modes';
import { getSpawnX } from './pieces';
import { BAG_SIZE, fillQueue } from './randomBag';
import { tryRotate } from './rotation';
import { HARD_DROP_POINTS_PER_CELL, SOFT_DROP_POINTS_PER_CELL, scoreClear } from './scoring';
import type {
  ActivePiece,
  ClearSummary,
  GameAction,
  GameEvent,
  GameMode,
  GameOutcome,
  GameState,
  Mutator,
  PieceType,
  Scenario,
  ZoneState,
} from './types';
import {
  ZONE_FULL_DURATION_MS,
  ZONE_LINES_TO_FILL,
  ZONE_MIN_METER,
  bankZoneRows,
  getZoneScore,
  releaseZoneRows,
} from './zone';

const NO_EVENTS: readonly GameEvent[] = [];

/** Keep at least one full bag beyond the visible preview so the queue never runs dry. */
const MIN_QUEUE_LENGTH = NEXT_QUEUE_SIZE + BAG_SIZE;

const IDLE_ZONE: ZoneState = { meter: 0, active: false, remainingMs: 0, lines: 0 };

/** Turbo halves the drop interval, never below this. */
const TURBO_MIN_INTERVAL_MS = 50;

export const createInitialState = (
  seed = 1,
  gameId = 0,
  mode: GameMode = 'marathon',
  dateKey: string | null = null,
): GameState => ({
  status: 'idle',
  mode,
  gameId,
  dateKey,
  outcome: null,
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
  elapsedMs: 0,
  piecesPlaced: 0,
  tetrises: 0,
  backToBacks: 0,
  maxCombo: 0,
  chain: 0,
  maxChain: 0,
  garbageLeft: 0,
  mutator: null,
  zone: IDLE_ZONE,
  maxZoneLines: 0,
  seed,
  events: NO_EVENTS,
});

const withEvents = (state: GameState, ...events: GameEvent[]): GameState => ({
  ...state,
  events: [...state.events, ...events],
});

const finish = (state: GameState, outcome: GameOutcome): GameState =>
  withEvents(
    { ...state, status: 'gameOver', outcome, active: null, clearing: null },
    { type: 'gameOver', outcome },
  );

/** Places a piece at the top of the field, or ends the game if it has no room. */
const spawnPiece = (state: GameState, type: PieceType): GameState => {
  const spawned: ActivePiece = { type, rotation: 0, x: getSpawnX(type), y: 0 };
  if (collides(state.board, spawned)) return finish(state, 'topOut');
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

/** A different mutator from the current one, drawn from the game's own seed. */
const rollMutator = (state: GameState): { mutator: Mutator; seed: number } => {
  const random = createRandom(state.seed);
  const pool = MUTATORS.filter((m) => m !== state.mutator);
  return { mutator: pool[Math.floor(random.next() * pool.length)], seed: random.seed };
};

/** Bookkeeping when the level rises: Mutators mode rolls a new twist. */
const onLevelUp = (state: GameState, level: number): GameState => {
  const next = withEvents({ ...state, level }, { type: 'levelUp', level });
  if (!MODES[state.mode].mutators) return next;
  const { mutator, seed } = rollMutator(next);
  return withEvents({ ...next, mutator, seed }, { type: 'mutator', mutator });
};

const nextClearId = (state: GameState) => (state.lastClear?.id ?? 0) + 1;

/** During Zone, full rows bank at the bottom instead of clearing, and play continues at once. */
const bankZoneClear = (state: GameState, rows: number[]): GameState => {
  const lines = state.lines + rows.length;
  const zone = { ...state.zone, lines: state.zone.lines + rows.length };
  const next = withEvents(
    { ...state, board: bankZoneRows(state.board, rows), lines, zone },
    { type: 'lineClear', lines: rows.length },
  );
  const level = getLevel(lines);
  return spawnNext(level > state.level ? onLevelUp(next, level) : next);
};

/** Writes the active piece into the board, scores any clears and moves on to the next piece. */
const lockPiece = (state: GameState): GameState => {
  const { active } = state;
  if (!active) return state;

  const board = mergePiece(state.board, active);
  const fullRows = findFullRows(board);
  const lockedAboveField = getPieceCells(active).every(({ y }) => y < HIDDEN_ROWS);
  const base: GameState = withEvents(
    { ...state, board, active: null, canHold: true, piecesPlaced: state.piecesPlaced + 1 },
    { type: 'lock' },
  );

  if (fullRows.length === 0) {
    const next = { ...base, combo: -1 };
    return lockedAboveField ? finish(next, 'topOut') : spawnNext(next);
  }

  if (state.zone.active) return bankZoneClear(base, fullRows);

  const config = MODES[state.mode];
  const cleared = fullRows.length;
  const combo = state.combo + 1;
  const { points, backToBack } = scoreClear(cleared, state.level, combo, state.backToBack);
  const lines = state.lines + cleared;
  const meter = config.zone ? Math.min(1, state.zone.meter + cleared / ZONE_LINES_TO_FILL) : 0;

  let next: GameState = withEvents(
    {
      ...base,
      score: state.score + points,
      lines,
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      backToBack: cleared === 4,
      tetrises: state.tetrises + (cleared === 4 ? 1 : 0),
      backToBacks: state.backToBacks + (backToBack ? 1 : 0),
      chain: 1,
      maxChain: config.cascade ? Math.max(state.maxChain, 1) : state.maxChain,
      zone: { ...state.zone, meter },
      clearing: { rows: fullRows, elapsedMs: 0 },
      lastClear: {
        id: nextClearId(state),
        lines: cleared,
        points,
        backToBack,
        combo,
        chain: 1,
        zone: false,
      },
    },
    { type: 'lineClear', lines: cleared },
  );
  const level = getLevel(lines);
  if (level > state.level) next = onLevelUp(next, level);
  return next;
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

const dropInterval = (state: GameState): number => {
  const base = getDropInterval(state.level);
  return state.mutator === 'turbo' ? Math.max(TURBO_MIN_INTERVAL_MS, base / 2) : base;
};

const stepGravity = (state: GameState, deltaMs: number): GameState => {
  let { active, gravityMs, lowestY, lockResets } = state;
  if (!active) return state;

  // Zone (and the tutorial) freeze gravity; the lock delay below still applies to a grounded piece.
  if (!state.zone.active && MODES[state.mode].gravity) {
    const interval = dropInterval(state);
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

/** Cascade: after rows clear, loose blocks fall; any rows they complete clear as the next link. */
const continueChain = (state: GameState): GameState | null => {
  const settled = settleCascade(state.board);
  const rows = findFullRows(settled);
  if (rows.length === 0) return settled === state.board ? null : { ...state, board: settled };

  const chain = state.chain + 1;
  const points = scoreClear(rows.length, state.level, 0, false).points * chain;
  const lines = state.lines + rows.length;
  let next: GameState = withEvents(
    {
      ...state,
      board: settled,
      score: state.score + points,
      lines,
      chain,
      maxChain: Math.max(state.maxChain, chain),
      clearing: { rows, elapsedMs: 0 },
      lastClear: {
        id: nextClearId(state),
        lines: rows.length,
        points,
        backToBack: false,
        combo: 0,
        chain,
        zone: false,
      },
    },
    { type: 'lineClear', lines: rows.length },
    { type: 'chain', chain },
  );
  const level = getLevel(lines);
  if (level > state.level) next = onLevelUp(next, level);
  return next;
};

/** Ends the game if the mode's goal has been reached after a clear. */
const goalReached = (state: GameState): boolean => {
  const config = MODES[state.mode];
  if (config.lineGoal !== null && state.lines >= config.lineGoal) return true;
  return config.garbageRows > 0 && state.garbageLeft === 0;
};

const stepClearing = (state: GameState, deltaMs: number): GameState => {
  if (!state.clearing) return state;
  const elapsedMs = state.clearing.elapsedMs + deltaMs;
  if (elapsedMs < LINE_CLEAR_MS) return { ...state, clearing: { ...state.clearing, elapsedMs } };

  const board = clearRows(state.board, state.clearing.rows);
  let next: GameState = {
    ...state,
    board,
    clearing: null,
    garbageLeft: MODES[state.mode].garbageRows ? countGarbageRows(board) : 0,
  };

  if (MODES[state.mode].cascade) {
    const chained = continueChain(next);
    if (chained?.clearing) return chained;
    if (chained) next = chained;
  }

  if (goalReached(next)) return finish(next, 'completed');
  return spawnNext({ ...next, chain: 0 });
};

const startZone = (state: GameState): GameState => {
  if (!MODES[state.mode].zone || state.zone.active || state.zone.meter < ZONE_MIN_METER) {
    return state;
  }
  return withEvents(
    {
      ...state,
      zone: {
        meter: state.zone.meter,
        active: true,
        remainingMs: state.zone.meter * ZONE_FULL_DURATION_MS,
        lines: 0,
      },
    },
    { type: 'zoneStart' },
  );
};

/** Zone runs out: the banked lines detonate together for one big score. */
const endZone = (state: GameState): GameState => {
  const banked = state.zone.lines;
  const zone: ZoneState = { ...IDLE_ZONE };
  if (banked === 0) return withEvents({ ...state, zone }, { type: 'zoneEnd', lines: 0 });

  const points = getZoneScore(banked, state.level);
  const summary: ClearSummary = {
    id: nextClearId(state),
    lines: banked,
    points,
    backToBack: false,
    combo: 0,
    chain: 1,
    zone: true,
  };
  return withEvents(
    {
      ...state,
      board: releaseZoneRows(state.board),
      score: state.score + points,
      zone,
      maxZoneLines: Math.max(state.maxZoneLines, banked),
      lastClear: summary,
    },
    { type: 'zoneEnd', lines: banked },
  );
};

const tick = (state: GameState, deltaMs: number): GameState => {
  const dt = clamp(deltaMs, 0, MAX_TICK_MS);
  let next: GameState = { ...state, elapsedMs: state.elapsedMs + dt };

  const limit = MODES[state.mode].timeLimitMs;
  if (limit !== null && next.elapsedMs >= limit) {
    return finish({ ...(next.zone.active ? endZone(next) : next), elapsedMs: limit }, 'timeUp');
  }

  if (next.zone.active) {
    const remainingMs = next.zone.remainingMs - dt;
    next = remainingMs <= 0 ? endZone(next) : { ...next, zone: { ...next.zone, remainingMs } };
  }

  return next.clearing ? stepClearing(next, dt) : stepGravity(next, dt);
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
  return withEvents(
    afterShift({ ...state, gravityMs: 0, score: state.score + SOFT_DROP_POINTS_PER_CELL }, moved),
    { type: 'softDrop' },
  );
};

/** Handles an action while a piece is under the player's control. */
const playingReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'tick':
      return tick(state, action.deltaMs);
    case 'pause':
      return { ...state, status: 'paused' };
    case 'activateZone':
      return startZone(state);
    default:
      break;
  }

  // Everything below needs a live piece; during the line-clear flash there is none.
  if (!state.active) return state;

  switch (action.type) {
    case 'move': {
      // The Mirror mutator swaps left and right.
      const dx = state.mutator === 'mirror' ? -action.dx : action.dx;
      const moved = tryMove(state.board, state.active, dx, 0);
      return moved ? withEvents(afterShift(state, moved), { type: 'move', dx }) : state;
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

const startGame = (
  state: GameState,
  seed: number,
  mode: GameMode,
  dateKey: string | null,
  scenario: Scenario | undefined,
): GameState => {
  const config = MODES[mode];
  let fresh = createInitialState(seed, state.gameId + 1, mode, mode === 'daily' ? dateKey : null);
  fresh = { ...fresh, status: 'playing' };

  if (config.garbageRows > 0) {
    const random = createRandom(fresh.seed);
    const board = addGarbageRows(fresh.board, config.garbageRows, random.next);
    fresh = { ...fresh, board, seed: random.seed, garbageLeft: countGarbageRows(board) };
  }
  if (mode === 'daily' && dateKey) fresh = { ...fresh, mutator: dailyMutator(dateKey) };
  if (scenario) {
    fresh = {
      ...fresh,
      board: scenario.board ?? fresh.board,
      queue: scenario.pieces ?? fresh.queue,
      zone: { ...fresh.zone, meter: scenario.zoneMeter ?? 0 },
    };
  }
  return spawnNext(fresh);
};

export const gameReducer = (previous: GameState, action: GameAction): GameState => {
  // Events describe only what the latest action caused.
  const state = previous.events.length ? { ...previous, events: NO_EVENTS } : previous;

  if (action.type === 'start') {
    return startGame(
      state,
      action.seed,
      action.mode ?? 'marathon',
      action.dateKey ?? null,
      action.scenario,
    );
  }
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

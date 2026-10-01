import { LINE_CLEAR_MS } from '../../game/constants';
import { createInitialState, gameReducer } from '../../game/reducer';
import type { GameAction, GameState } from '../../game/types';
import { EMPTY_PROGRESS, type StepProgress, TUTORIAL_STEPS, applyEvent } from '../steps';

const stepById = (id: string) => TUTORIAL_STEPS.find((step) => step.id === id)!;

const begin = (id: string): GameState =>
  gameReducer(createInitialState(), {
    type: 'start',
    seed: 1,
    mode: 'tutorial',
    scenario: stepById(id).scenario,
  });

/** Plays actions and folds every event they raise into step progress. */
const play = (state: GameState, actions: GameAction[]) => {
  let progress: StepProgress = EMPTY_PROGRESS;
  let next = state;
  for (const action of actions) {
    next = gameReducer(next, action);
    progress = next.events.reduce(applyEvent, progress);
  }
  return { state: next, progress };
};

const ticks = (ms: number): GameAction[] =>
  Array.from({ length: Math.ceil(ms / 16) }, () => ({ type: 'tick', deltaMs: 16 }));

describe('tutorial steps', () => {
  it('move needs one step each way', () => {
    const step = stepById('move');
    expect(step.done(play(begin('move'), [{ type: 'move', dx: -1 }]).progress)).toBe(false);
    expect(
      step.done(
        play(begin('move'), [
          { type: 'move', dx: -1 },
          { type: 'move', dx: 1 },
        ]).progress,
      ),
    ).toBe(true);
  });

  it('rotate needs two turns, soft drop three rows, hard drop and hold one each', () => {
    const rotate = play(begin('rotate'), [
      { type: 'rotate', direction: 1 },
      { type: 'rotate', direction: -1 },
    ]);
    expect(stepById('rotate').done(rotate.progress)).toBe(true);

    const soft = play(begin('softDrop'), [
      { type: 'softDrop' },
      { type: 'softDrop' },
      { type: 'softDrop' },
    ]);
    expect(stepById('softDrop').done(soft.progress)).toBe(true);

    expect(
      stepById('hardDrop').done(play(begin('hardDrop'), [{ type: 'hardDrop' }]).progress),
    ).toBe(true);
    expect(stepById('hold').done(play(begin('hold'), [{ type: 'hold' }]).progress)).toBe(true);
  });

  it('the clear step is solvable: rotate the I upright, push it right, drop it', () => {
    const { state, progress } = play(begin('clear'), [
      { type: 'rotate', direction: 1 },
      { type: 'move', dx: 1 },
      { type: 'move', dx: 1 },
      { type: 'move', dx: 1 },
      { type: 'move', dx: 1 },
      { type: 'move', dx: 1 },
      { type: 'hardDrop' },
      ...ticks(LINE_CLEAR_MS + 32),
    ]);
    expect(stepById('clear').done(progress)).toBe(true);
    expect(progress.linesCleared).toBe(4);
    expect(state.board.flat().filter(Boolean)).toHaveLength(0);
  });

  it('the zone step starts charged, so one tap completes it', () => {
    const { progress } = play(begin('zone'), [{ type: 'activateZone' }]);
    expect(stepById('zone').done(progress)).toBe(true);
  });

  it('a step is never complete before the player does anything', () => {
    for (const step of TUTORIAL_STEPS) expect(step.done(EMPTY_PROGRESS)).toBe(false);
  });
});

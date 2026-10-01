import { createEmptyBoard } from '../game/board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../game/constants';
import type { Board, Cell, GameEvent, Scenario } from '../game/types';

export type TutorialStepId =
  'move' | 'rotate' | 'softDrop' | 'hardDrop' | 'hold' | 'clear' | 'zone';

/** The gesture the coach card animates for a step. */
export type Demo = 'swipeSideways' | 'tap' | 'dragDown' | 'flickDown' | 'swipeUp' | 'zoneButton';

/** What the player has done so far in the current step, counted from game events. */
export interface StepProgress {
  movedLeft: number;
  movedRight: number;
  rotations: number;
  softDrops: number;
  hardDrops: number;
  holds: number;
  linesCleared: number;
  zoneStarted: boolean;
}

export interface TutorialStep {
  id: TutorialStepId;
  demo: Demo;
  scenario: Scenario;
  /** True once the player has shown they can do the thing this step teaches. */
  done: (progress: StepProgress) => boolean;
}

export const EMPTY_PROGRESS: StepProgress = {
  movedLeft: 0,
  movedRight: 0,
  rotations: 0,
  softDrops: 0,
  hardDrops: 0,
  holds: 0,
  linesCleared: 0,
  zoneStarted: false,
};

/** Four rows full except the rightmost column: one vertical I clears them all at once. */
const tetrisWell = (): Board => {
  const board = createEmptyBoard().map((row) => [...row]);
  for (let i = 1; i <= 4; i += 1) {
    board[BOARD_HEIGHT - i] = Array.from({ length: BOARD_WIDTH }, (_, x): Cell =>
      x === BOARD_WIDTH - 1 ? null : 'G',
    );
  }
  return board;
};

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 'move',
    demo: 'swipeSideways',
    scenario: { pieces: ['T', 'T', 'T'] },
    done: (p) => p.movedLeft > 0 && p.movedRight > 0,
  },
  {
    id: 'rotate',
    demo: 'tap',
    scenario: { pieces: ['T', 'L', 'J'] },
    done: (p) => p.rotations >= 2,
  },
  {
    id: 'softDrop',
    demo: 'dragDown',
    scenario: { pieces: ['L', 'J', 'L'] },
    done: (p) => p.softDrops >= 3,
  },
  {
    id: 'hardDrop',
    demo: 'flickDown',
    scenario: { pieces: ['O', 'S', 'Z'] },
    done: (p) => p.hardDrops >= 1,
  },
  {
    id: 'hold',
    demo: 'swipeUp',
    scenario: { pieces: ['Z', 'I', 'T'] },
    done: (p) => p.holds >= 1,
  },
  {
    id: 'clear',
    demo: 'flickDown',
    scenario: { board: tetrisWell(), pieces: ['I', 'O', 'T'] },
    done: (p) => p.linesCleared > 0,
  },
  {
    id: 'zone',
    demo: 'zoneButton',
    scenario: { pieces: ['T', 'S', 'O'], zoneMeter: 1 },
    done: (p) => p.zoneStarted,
  },
];

/** Folds one game event into the step's progress. */
export const applyEvent = (progress: StepProgress, event: GameEvent): StepProgress => {
  switch (event.type) {
    case 'move':
      return event.dx < 0
        ? { ...progress, movedLeft: progress.movedLeft + 1 }
        : { ...progress, movedRight: progress.movedRight + 1 };
    case 'rotate':
      return { ...progress, rotations: progress.rotations + 1 };
    case 'softDrop':
      return { ...progress, softDrops: progress.softDrops + 1 };
    case 'hardDrop':
      return { ...progress, hardDrops: progress.hardDrops + 1 };
    case 'hold':
      return { ...progress, holds: progress.holds + 1 };
    case 'lineClear':
      return { ...progress, linesCleared: progress.linesCleared + event.lines };
    case 'zoneStart':
      return { ...progress, zoneStarted: true };
    default:
      return progress;
  }
};

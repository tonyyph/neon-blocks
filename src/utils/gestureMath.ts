/**
 * Pure helpers behind the touch controls, kept apart from the gesture handler so they can be
 * unit tested.
 */

/** Which way a drag committed to. Every drag commits to exactly one axis. */
export type DragAxis = 'horizontal' | 'down' | 'up';

/** Finger travel (px) before a drag commits to an axis; below this it can still become a tap. */
export const AXIS_LOCK_DISTANCE = 10;

/**
 * Release speed (px/s) that turns a downward drag into a hard drop. A slow drag stays a soft drop.
 * Tune on real devices: simulator mouse drags report far lower speeds than a finger flick.
 */
export const FLICK_VELOCITY = 1000;

/** Hard drop and hold both need at least this much travel, so a twitch never triggers them. */
export const FLICK_MIN_CELLS = 1.5;

export const pickAxis = (dx: number, dy: number): DragAxis | null => {
  if (Math.hypot(dx, dy) < AXIS_LOCK_DISTANCE) return null;
  // Vertical must clearly dominate: sideways drags are the most common input and should never
  // soft-drop by accident.
  if (Math.abs(dy) > Math.abs(dx) * 1.2) return dy > 0 ? 'down' : 'up';
  return 'horizontal';
};

/** Whole steps covered by `delta` px at `step` px per step, truncated toward zero. */
export const consumeSteps = (delta: number, step: number): number => Math.trunc(delta / step) || 0; // `|| 0` folds -0 into 0

export type ReleaseAction = 'hardDrop' | 'hold' | null;

export const classifyRelease = (
  axis: DragAxis | null,
  translationY: number,
  velocityY: number,
  cellSize: number,
): ReleaseAction => {
  const minTravel = cellSize * FLICK_MIN_CELLS;
  if (axis === 'down' && velocityY > FLICK_VELOCITY && translationY > minTravel) return 'hardDrop';
  // Upward drags mean nothing else, so any clear swipe up holds, however slow.
  if (axis === 'up' && translationY < -minTravel) return 'hold';
  return null;
};

/** Taps on the left half rotate counter-clockwise, the right half clockwise. */
export const rotationForTap = (x: number, width: number): 1 | -1 => (x < width / 2 ? -1 : 1);

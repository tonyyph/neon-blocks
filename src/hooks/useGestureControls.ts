import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';

import { dispatchGame } from '../store/gameStore';
import {
  AXIS_LOCK_DISTANCE,
  type DragAxis,
  classifyRelease,
  consumeSteps,
  pickAxis,
  rotationForTap,
} from '../utils/gestureMath';
import { haptics } from './useHaptics';

interface DragState {
  axis: DragAxis | null;
  /** Finger travel already turned into moves, so each cell of travel moves the piece once. */
  consumedX: number;
  consumedY: number;
}

/**
 * Touch controls for the play area:
 * - drag left/right: move one column per cell of finger travel
 * - drag down: soft drop one row per cell of travel; flick down: hard drop
 * - swipe up: hold
 * - tap: rotate (left half counter-clockwise, right half clockwise)
 *
 * Callbacks run on the JS thread (`runOnJS`) because they only dispatch to the game store.
 */
export const useGestureControls = (cellSize: number, areaWidth: number) => {
  return useMemo(() => {
    const step = Math.max(cellSize, 14);
    // Lives as long as this gesture object; only the gesture callbacks touch it.
    const drag: DragState = { axis: null, consumedX: 0, consumedY: 0 };

    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(AXIS_LOCK_DISTANCE)
      .onStart(() => {
        drag.axis = null;
        drag.consumedX = 0;
        drag.consumedY = 0;
      })
      .onUpdate(({ translationX, translationY }) => {
        drag.axis ??= pickAxis(translationX, translationY);

        if (drag.axis === 'horizontal') {
          const steps = consumeSteps(translationX - drag.consumedX, step);
          if (!steps) return;
          drag.consumedX += steps * step;
          const dx = steps > 0 ? 1 : -1;
          for (let i = 0; i < Math.abs(steps); i += 1) dispatchGame({ type: 'move', dx });
          haptics.tap();
        } else if (drag.axis === 'down') {
          const steps = consumeSteps(translationY - drag.consumedY, step);
          if (steps <= 0) return;
          drag.consumedY += steps * step;
          for (let i = 0; i < steps; i += 1) dispatchGame({ type: 'softDrop' });
        }
      })
      .onEnd(({ translationY, velocityY }) => {
        const release = classifyRelease(drag.axis, translationY, velocityY, cellSize);
        if (release === 'hardDrop') dispatchGame({ type: 'hardDrop' });
        if (release === 'hold') {
          dispatchGame({ type: 'hold' });
          haptics.tap();
        }
      });

    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDistance(AXIS_LOCK_DISTANCE)
      .onEnd(({ x }, success) => {
        if (!success) return;
        dispatchGame({ type: 'rotate', direction: rotationForTap(x, areaWidth) });
        haptics.tap();
      });

    return Gesture.Race(pan, tap);
  }, [cellSize, areaWidth]);
};

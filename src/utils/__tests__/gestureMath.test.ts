import {
  AXIS_LOCK_DISTANCE,
  FLICK_VELOCITY,
  classifyRelease,
  consumeSteps,
  pickAxis,
  rotationForTap,
} from '../gestureMath';

describe('pickAxis', () => {
  it('stays undecided until the finger has moved far enough', () => {
    expect(pickAxis(3, 4)).toBeNull();
    expect(pickAxis(AXIS_LOCK_DISTANCE, 0)).toBe('horizontal');
  });

  it('locks vertical only when it clearly dominates', () => {
    expect(pickAxis(2, 20)).toBe('down');
    expect(pickAxis(2, -20)).toBe('up');
    // A diagonal drag is treated as horizontal so it never soft-drops by accident.
    expect(pickAxis(12, 12)).toBe('horizontal');
    expect(pickAxis(-15, 10)).toBe('horizontal');
  });
});

describe('consumeSteps', () => {
  it('counts whole steps in either direction', () => {
    expect(consumeSteps(19, 20)).toBe(0);
    expect(consumeSteps(41, 20)).toBe(2);
    expect(consumeSteps(-41, 20)).toBe(-2);
    expect(consumeSteps(-5, 20)).toBe(0);
  });
});

describe('classifyRelease', () => {
  const fast = FLICK_VELOCITY + 1;

  it('hard-drops on a fast downward flick', () => {
    expect(classifyRelease('down', 60, fast, 20)).toBe('hardDrop');
  });

  it('holds on any clear upward swipe, fast or slow', () => {
    expect(classifyRelease('up', -60, -fast, 20)).toBe('hold');
    expect(classifyRelease('up', -60, -200, 20)).toBe('hold');
    expect(classifyRelease('up', -20, -fast, 20)).toBeNull();
  });

  it('ignores slow drags, short twitches and horizontal drags', () => {
    expect(classifyRelease('down', 200, 300, 20)).toBeNull();
    expect(classifyRelease('down', 10, fast, 20)).toBeNull();
    expect(classifyRelease('horizontal', 60, fast, 20)).toBeNull();
    expect(classifyRelease(null, 60, fast, 20)).toBeNull();
  });
});

describe('rotationForTap', () => {
  it('rotates counter-clockwise on the left half and clockwise on the right', () => {
    expect(rotationForTap(10, 300)).toBe(-1);
    expect(rotationForTap(200, 300)).toBe(1);
  });
});

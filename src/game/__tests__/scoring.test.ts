import { getDropInterval, getLevel } from '../level';
import { createBag, fillQueue } from '../randomBag';
import { getBackToBackBonus, getComboBonus, getLineClearScore, scoreClear } from '../scoring';
import { PIECE_TYPES } from '../pieces';
import { createRandom } from '../../utils/random';

describe('scoring', () => {
  it('scores 1–4 lines at 100/300/500/800 x level', () => {
    expect(getLineClearScore(1, 1)).toBe(100);
    expect(getLineClearScore(2, 1)).toBe(300);
    expect(getLineClearScore(3, 1)).toBe(500);
    expect(getLineClearScore(4, 1)).toBe(800);
    expect(getLineClearScore(4, 3)).toBe(2400);
    expect(getLineClearScore(0, 5)).toBe(0);
  });

  it('adds half again for a back-to-back Tetris only', () => {
    expect(getBackToBackBonus(4, 2, true)).toBe(800);
    expect(getBackToBackBonus(4, 2, false)).toBe(0);
    expect(getBackToBackBonus(3, 2, true)).toBe(0);
  });

  it('adds 50 x combo x level from the second consecutive clear', () => {
    expect(getComboBonus(0, 1)).toBe(0);
    expect(getComboBonus(1, 1)).toBe(50);
    expect(getComboBonus(3, 2)).toBe(300);
  });

  it('combines bonuses', () => {
    expect(scoreClear(4, 1, 1, true)).toEqual({ points: 800 + 400 + 50, backToBack: true });
    expect(scoreClear(1, 2, 0, true)).toEqual({ points: 200, backToBack: false });
  });
});

describe('level', () => {
  it('starts at 1 and rises every 10 lines', () => {
    expect(getLevel(0)).toBe(1);
    expect(getLevel(9)).toBe(1);
    expect(getLevel(10)).toBe(2);
    expect(getLevel(25)).toBe(3);
  });

  it('speeds up by 80ms a level down to a 100ms floor', () => {
    expect(getDropInterval(1)).toBe(1000);
    expect(getDropInterval(2)).toBe(920);
    expect(getDropInterval(12)).toBe(120);
    expect(getDropInterval(13)).toBe(100);
    expect(getDropInterval(40)).toBe(100);
  });
});

describe('7-bag randomizer', () => {
  it('each bag holds all 7 pieces once', () => {
    const random = createRandom(42);
    for (let i = 0; i < 50; i += 1) {
      expect([...createBag(random.next)].sort()).toEqual([...PIECE_TYPES].sort());
    }
  });

  it('every aligned run of 7 in the queue is a full bag', () => {
    const random = createRandom(7);
    const queue = fillQueue([], 70, random.next);
    expect(queue.length).toBeGreaterThanOrEqual(70);
    for (let i = 0; i + 7 <= queue.length; i += 7) {
      expect(new Set(queue.slice(i, i + 7)).size).toBe(7);
    }
  });

  it('only adds whole bags and keeps existing pieces in order', () => {
    const random = createRandom(3);
    const queue = fillQueue(['T', 'O'], 8, random.next);
    expect(queue.slice(0, 2)).toEqual(['T', 'O']);
    expect(queue).toHaveLength(9);
  });

  it('is deterministic for a seed and varies between seeds', () => {
    const a = fillQueue([], 21, createRandom(1).next);
    const b = fillQueue([], 21, createRandom(1).next);
    const c = fillQueue([], 21, createRandom(2).next);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});

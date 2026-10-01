import { en } from '../en';
import { vi } from '../vi';

/** Words kept the same in Vietnamese on purpose: names and terms players already use. */
const SAME_ON_PURPOSE = new Set([
  'Marathon',
  'Zone',
  'Tetris',
  'Cyberpunk',
  'Outrun',
  'Kintsugi',
  'Octoris',
  'Decahexatris',
  'Combo ×3',
  '',
  '100',
  '300',
  '500',
  '800',
  'Menu',
  'Neon Blocks 3',
]);

/** Calls string functions with sample arguments so their output can be compared too. */
const SAMPLE_ARGS: unknown[] = [3, 'X', true];

const walk = (a: unknown, b: unknown, path: string, out: string[]) => {
  if (typeof a === 'function' && typeof b === 'function') {
    const args = SAMPLE_ARGS.slice(0, a.length);
    const left = a(...args);
    const right = b(...args);
    if (left === right && !SAME_ON_PURPOSE.has(left)) out.push(`${path}() = ${left}`);
    return;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    if (a === b && !SAME_ON_PURPOSE.has(a)) out.push(`${path} = ${a}`);
    return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const key of Object.keys(a)) {
      walk(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        `${path}.${key}`,
        out,
      );
    }
  }
};

describe('Vietnamese translation', () => {
  it('translates every string (except names kept on purpose)', () => {
    const untranslated: string[] = [];
    walk(en, vi, 't', untranslated);
    expect(untranslated).toEqual([]);
  });

  it('has the same number of How to play entries and score rows', () => {
    expect(vi.howToPlay.items).toHaveLength(en.howToPlay.items.length);
    expect(vi.howToPlay.points).toHaveLength(en.howToPlay.points.length);
    expect(vi.game.clears).toHaveLength(en.game.clears.length);
  });

  it('formats numbers the Vietnamese way', () => {
    expect((12345).toLocaleString(vi.locale)).toBe('12.345');
  });
});

import fs from 'fs';
import path from 'path';

import {
  FONT_ASSETS,
  type FontFamily,
  LINE_BOX,
  VIETNAMESE_COMPANION,
  VIETNAMESE_LETTERS,
  resolveFont,
} from '../fonts';
import { SCALE_FOR_TESTS, getTextStyle } from '../typography';
import { THEMES, THEME_ORDER } from '../themes';

/** hhea ascent + descent over units per em, read straight from the font file. */
const measureLineBox = (file: string): number => {
  const b = fs.readFileSync(file);
  const tables: Record<string, number> = {};
  for (let i = 0; i < b.readUInt16BE(4); i += 1) {
    const o = 12 + i * 16;
    tables[b.toString('ascii', o, o + 4)] = b.readUInt32BE(o + 8);
  }
  const upm = b.readUInt16BE(tables.head + 18);
  return (b.readInt16BE(tables.hhea + 4) - b.readInt16BE(tables.hhea + 6)) / upm;
};

/** Every code point the font's cmap maps (formats 4 and 12). */
const codePoints = (file: string): Set<number> => {
  const b = fs.readFileSync(file);
  let cmap = 0;
  for (let i = 0; i < b.readUInt16BE(4); i += 1) {
    const o = 12 + i * 16;
    if (b.toString('ascii', o, o + 4) === 'cmap') cmap = b.readUInt32BE(o + 8);
  }
  const points = new Set<number>();
  for (let i = 0; i < b.readUInt16BE(cmap + 2); i += 1) {
    const sub = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = b.readUInt16BE(sub);
    if (format === 4) {
      const segments = b.readUInt16BE(sub + 6) / 2;
      const ends = sub + 14;
      const starts = ends + segments * 2 + 2;
      for (let k = 0; k < segments; k += 1) {
        const end = b.readUInt16BE(ends + k * 2);
        for (let c = b.readUInt16BE(starts + k * 2); c <= end && c !== 0xffff; c += 1)
          points.add(c);
      }
    } else if (format === 12) {
      for (let k = 0; k < b.readUInt32BE(sub + 12); k += 1) {
        const end = b.readUInt32BE(sub + 20 + k * 12);
        for (let c = b.readUInt32BE(sub + 16 + k * 12); c <= end; c += 1) points.add(c);
      }
    }
  }
  return points;
};

const coversVietnamese = (family: FontFamily): boolean => {
  const points = codePoints(fileFor(family));
  const letters = VIETNAMESE_LETTERS + VIETNAMESE_LETTERS.toUpperCase();
  return [...letters].every((letter) => points.has(letter.codePointAt(0)!));
};

/** `Baloo2_800ExtraBold` lives at @expo-google-fonts/baloo-2/800ExtraBold/Baloo2_800ExtraBold.ttf. */
const fileFor = (family: FontFamily): string => {
  const root = path.join(__dirname, '../../../node_modules/@expo-google-fonts');
  const weight = family.slice(family.indexOf('_') + 1);
  for (const pkg of fs.readdirSync(root)) {
    const candidate = path.join(root, pkg, weight, `${family}.ttf`);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`No font file for ${family}`);
};

describe('font line boxes', () => {
  it.each(Object.keys(FONT_ASSETS) as FontFamily[])('%s is not under-measured', (family) => {
    expect(LINE_BOX[family]).toBeGreaterThanOrEqual(measureLineBox(fileFor(family)) - 0.001);
  });

  it('no theme sets text tighter than its font', () => {
    for (const id of THEME_ORDER) {
      for (const variant of SCALE_FOR_TESTS) {
        const style = getTextStyle(variant, THEMES[id]);
        const family = style.fontFamily as FontFamily;
        expect(style.lineHeight!).toBeGreaterThanOrEqual(style.fontSize! * LINE_BOX[family] - 0.5);
      }
    }
  });
});

describe('Vietnamese coverage', () => {
  it.each(Object.keys(FONT_ASSETS) as FontFamily[])(
    '%s draws Vietnamese itself or through a companion that can',
    (family) => {
      const companion = VIETNAMESE_COMPANION[family];
      if (companion) {
        expect(coversVietnamese(family)).toBe(false);
        expect(coversVietnamese(companion)).toBe(true);
      } else {
        expect(coversVietnamese(family)).toBe(true);
      }
    },
  );

  it('switches font only for strings that need it', () => {
    expect(resolveFont('Orbitron_900Black', 'NEON BLOCKS')).toBe('Orbitron_900Black');
    expect(resolveFont('Orbitron_900Black', 'Tạm dừng')).toBe('Tektur_800ExtraBold');
    expect(resolveFont('Orbitron_900Black', 'ĐIỂM')).toBe('Tektur_800ExtraBold');
    expect(resolveFont('ChakraPetch_500Medium', 'Tạm dừng')).toBe('ChakraPetch_500Medium');
  });
});

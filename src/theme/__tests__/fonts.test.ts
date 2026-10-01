import fs from 'fs';
import path from 'path';

import { FONT_ASSETS, type FontFamily, LINE_BOX } from '../fonts';
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

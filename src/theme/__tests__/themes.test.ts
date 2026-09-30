import { PIECE_TYPES } from '../../game/pieces';
import { THEMES, THEME_ORDER } from '../themes';

/** WCAG relative luminance of a #RRGGBB colour. */
const luminance = (hex: string) => {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe.each(THEME_ORDER.map((id) => [id, THEMES[id]] as const))('%s theme', (_, theme) => {
  const { colors } = theme;

  it('keeps body text readable (WCAG AA 4.5:1) on background and surfaces', () => {
    for (const surface of [colors.background, colors.surface, colors.surfaceRaised]) {
      expect(contrast(colors.text, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps secondary text at least 4.5:1 and faint text at least 2.5:1 on the background', () => {
    expect(contrast(colors.textDim, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.textFaint, colors.background)).toBeGreaterThanOrEqual(2.5);
  });

  it('keeps primary-button text readable', () => {
    expect(contrast(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('makes every piece stand out from the empty well (3:1)', () => {
    for (const type of PIECE_TYPES) {
      expect(contrast(theme.pieces[type], colors.well)).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives all seven pieces distinct colours', () => {
    expect(new Set(Object.values(theme.pieces)).size).toBe(7);
  });
});

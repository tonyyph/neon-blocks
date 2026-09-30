import type { TextStyle } from 'react-native';

import type { Theme } from './themes';

type FontRole = keyof Theme['fonts'];

interface Step {
  size: number;
  /** Orbitron's tall caps clip at tight leading, so line heights stay generous. */
  lineHeight: number;
  role: FontRole;
  letterSpacing: number;
  uppercase?: boolean;
}

const SCALE = {
  display: { size: 46, lineHeight: 58, role: 'display', letterSpacing: 4 },
  title: { size: 26, lineHeight: 34, role: 'display', letterSpacing: 2 },
  heading: { size: 19, lineHeight: 26, role: 'heading', letterSpacing: 0.5 },
  body: { size: 16, lineHeight: 22, role: 'body', letterSpacing: 0.2 },
  caption: { size: 13, lineHeight: 18, role: 'body', letterSpacing: 0.2 },
  label: { size: 11, lineHeight: 15, role: 'label', letterSpacing: 2, uppercase: true },
  stat: { size: 20, lineHeight: 26, role: 'number', letterSpacing: 1 },
  score: { size: 30, lineHeight: 38, role: 'number', letterSpacing: 2 },
} satisfies Record<string, Step>;

export type TypographyVariant = keyof typeof SCALE;

/** Custom fonts carry their own weight, so no fontWeight is set (Android would fake-bold it). */
export const getTextStyle = (variant: TypographyVariant, theme: Theme): TextStyle => {
  const step: Step = SCALE[variant];
  return {
    fontFamily: theme.fonts[step.role],
    fontSize: step.size,
    lineHeight: step.lineHeight,
    letterSpacing: step.letterSpacing,
    textTransform: step.uppercase ? 'uppercase' : 'none',
  };
};

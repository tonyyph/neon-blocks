const toRgb = (hex: string): [number, number, number] => {
  const value = parseInt(hex.slice(1, 7), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const toHex = (rgb: number[]) =>
  `#${rgb
    .map((c) =>
      Math.round(Math.max(0, Math.min(255, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

/** `#RRGGBB` plus an alpha in 0..1, as `#RRGGBBAA`. */
export const withAlpha = (hex: string, alpha: number): string =>
  `${hex.slice(0, 7)}${Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')}`;

/** Blends `hex` toward `target` by `amount` (0 = unchanged, 1 = target). */
export const mix = (hex: string, target: string, amount: number): string => {
  const a = toRgb(hex);
  const b = toRgb(target);
  return toHex(a.map((c, i) => c + (b[i] - c) * amount));
};

export const lighten = (hex: string, amount: number) => mix(hex, '#FFFFFF', amount);
export const darken = (hex: string, amount: number) => mix(hex, '#000000', amount);

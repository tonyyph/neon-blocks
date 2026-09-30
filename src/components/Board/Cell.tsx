import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { PieceType } from '../../game/types';
import type { Theme } from '../../theme/themes';
import { GhostCell } from './GhostCell';

interface BlockProps {
  type: PieceType;
  size: number;
  theme: Theme;
}

/**
 * One block in the active theme's style. Shared by the board, previews, logo and theme cards.
 * Kept to at most three views: a full board is 200 of these.
 */
export const Block = memo(({ type, size, theme }: BlockProps) => {
  const shade = theme.shades[type];
  const pad = Math.max(1, Math.round(size * 0.05));
  const outer = { width: size, height: size, padding: pad };

  switch (theme.blockStyle) {
    case 'tube':
      return (
        <View style={outer}>
          <View
            style={[
              styles.fill,
              {
                borderWidth: Math.max(1.5, size * 0.1),
                borderColor: shade.fill,
                backgroundColor: shade.tint,
              },
            ]}
          >
            <View style={[styles.core, { backgroundColor: shade.light }]} />
          </View>
        </View>
      );
    case 'bevel': {
      const edge = Math.max(2, Math.round(size * 0.14));
      return (
        <View style={outer}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: shade.fill,
                borderWidth: edge,
                borderTopColor: shade.light,
                borderLeftColor: shade.light,
                borderRightColor: shade.dark,
                borderBottomColor: shade.dark,
              },
            ]}
          />
        </View>
      );
    }
    case 'chip':
      return (
        <View style={outer}>
          <View style={[styles.fill, { backgroundColor: shade.fill }]}>
            <View style={[styles.die, { borderColor: shade.dark }]} />
          </View>
        </View>
      );
    default: {
      const inner = size - pad * 2;
      return (
        <View style={outer}>
          <View
            style={[
              styles.fill,
              styles.clip,
              { backgroundColor: shade.fill, borderRadius: Math.max(2, inner * 0.22) },
            ]}
          >
            <View
              style={[
                styles.gloss,
                {
                  backgroundColor: shade.light,
                  top: inner * 0.12,
                  height: Math.max(2, inner * 0.2),
                  borderRadius: inner * 0.1,
                },
              ]}
            />
          </View>
        </View>
      );
    }
  }
});
Block.displayName = 'Block';

interface CellProps {
  /** One character of a row signature: `.` empty, `T` block, `t` ghost. See selectors.ts. */
  glyph: string;
  size: number;
  theme: Theme;
}

export const Cell = memo(({ glyph, size, theme }: CellProps) => {
  if (glyph === '.') {
    return (
      <View style={[styles.empty, { width: size, height: size, borderColor: theme.colors.grid }]} />
    );
  }
  const type = glyph.toUpperCase() as PieceType;
  return glyph === type ? (
    <Block type={type} size={size} theme={theme} />
  ) : (
    <GhostCell type={type} size={size} theme={theme} />
  );
});
Cell.displayName = 'Cell';

const styles = StyleSheet.create({
  empty: { borderWidth: StyleSheet.hairlineWidth },
  fill: { flex: 1 },
  clip: { overflow: 'hidden' },
  core: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '30%',
    bottom: '30%',
    opacity: 0.6,
  },
  die: {
    position: 'absolute',
    left: '24%',
    right: '24%',
    top: '24%',
    bottom: '24%',
    borderWidth: 1.5,
  },
  gloss: {
    position: 'absolute',
    left: '14%',
    right: '14%',
    opacity: 0.5,
  },
});

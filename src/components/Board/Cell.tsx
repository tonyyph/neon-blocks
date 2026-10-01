import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { FADED_CELL, FOG_CELL } from '../../game/selectors';
import type { PieceType } from '../../game/types';
import { withAlpha } from '../../theme/colorUtils';
import type { BlockKind, Theme } from '../../theme/themes';
import { GhostCell } from './GhostCell';

interface BlockProps {
  type: BlockKind;
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
    case 'blueprint':
      // A technical drawing: outline, pale wash, one hatch stroke corner to corner.
      return (
        <View style={outer}>
          <View
            style={[
              styles.fill,
              styles.clip,
              {
                borderWidth: Math.max(1, size * 0.07),
                borderColor: shade.fill,
                backgroundColor: shade.tint,
              },
            ]}
          >
            <View style={[styles.hatch, { backgroundColor: shade.fill, width: size * 1.5 }]} />
          </View>
        </View>
      );
    case 'jelly': {
      const inner = size - pad * 2;
      return (
        <View style={outer}>
          <View
            style={[
              styles.fill,
              styles.clip,
              {
                backgroundColor: shade.fill,
                borderRadius: inner * 0.34,
                borderBottomWidth: Math.max(2, inner * 0.14),
                borderBottomColor: shade.dark,
              },
            ]}
          >
            <View
              style={[
                styles.shine,
                {
                  backgroundColor: shade.light,
                  width: inner * 0.3,
                  height: inner * 0.22,
                  borderRadius: inner * 0.15,
                },
              ]}
            />
          </View>
        </View>
      );
    }
    case 'lacquer':
      // Lacquer tile with a gold rim and a single gold kintsugi seam.
      return (
        <View style={outer}>
          <View
            style={[
              styles.fill,
              styles.clip,
              { backgroundColor: shade.fill, borderWidth: 1, borderColor: theme.colors.primary },
            ]}
          >
            <View
              style={[styles.seam, { backgroundColor: theme.colors.primary, width: size * 1.4 }]}
            />
          </View>
        </View>
      );
    case 'glass': {
      // Coloured glass in thick lead came, lit from the top left.
      const lead = Math.max(2, Math.round(size * 0.12));
      return (
        <View style={{ width: size, height: size }}>
          <View
            style={[
              styles.fill,
              styles.clip,
              { backgroundColor: shade.fill, borderWidth: lead, borderColor: theme.colors.well },
            ]}
          >
            <View style={[styles.light, { backgroundColor: shade.light }]} />
          </View>
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
  if (glyph === FOG_CELL) {
    return (
      <View style={{ width: size, height: size, backgroundColor: theme.colors.surfaceRaised }} />
    );
  }
  if (glyph === FADED_CELL) {
    return (
      <View
        style={[
          styles.empty,
          { width: size, height: size, borderColor: withAlpha(theme.colors.textDim, 0.35) },
        ]}
      />
    );
  }
  if (glyph === 'G' || glyph === 'X') return <Block type={glyph} size={size} theme={theme} />;
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
  hatch: {
    position: 'absolute',
    height: 1,
    left: '-25%',
    top: '50%',
    opacity: 0.55,
    transform: [{ rotate: '-45deg' }],
  },
  shine: { position: 'absolute', left: '16%', top: '14%', opacity: 0.75 },
  seam: {
    position: 'absolute',
    height: 1.2,
    left: '-20%',
    top: '42%',
    opacity: 0.9,
    transform: [{ rotate: '-28deg' }],
  },
  light: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '55%',
    height: '55%',
    opacity: 0.35,
    borderBottomRightRadius: 99,
  },
  gloss: {
    position: 'absolute',
    left: '14%',
    right: '14%',
    opacity: 0.5,
  },
});

import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { PieceType } from '../../game/types';
import type { Theme } from '../../theme/themes';

interface Props {
  type: PieceType;
  size: number;
  theme: Theme;
}

/** Outline of where the active piece will land. Purely visual; it has no collision. */
export const GhostCell = memo(({ type, size, theme }: Props) => {
  const shade = theme.shades[type];
  return (
    <View style={{ width: size, height: size, padding: Math.max(2, size * 0.1) }}>
      <View
        style={[
          styles.ghost,
          {
            borderColor: shade.fill,
            backgroundColor: shade.tint,
            // Terminal and Blueprint draw the ghost as a dashed wireframe.
            borderStyle:
              theme.blockStyle === 'chip' || theme.blockStyle === 'blueprint' ? 'dashed' : 'solid',
            borderRadius:
              theme.blockStyle === 'gloss'
                ? size * 0.18
                : theme.blockStyle === 'jelly'
                  ? size * 0.3
                  : 0,
          },
        ]}
      />
    </View>
  );
});
GhostCell.displayName = 'GhostCell';

const styles = StyleSheet.create({
  ghost: {
    flex: 1,
    borderWidth: 1.5,
    opacity: 0.55,
  },
});

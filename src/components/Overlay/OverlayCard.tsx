import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { withAlpha } from '../../theme/colorUtils';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Chamfer, CornerBrackets } from '../ui/Chamfer';

interface Props {
  accent: string;
  children: ReactNode;
}

/** Dimmed full-screen scrim with a centred HUD card that fades and scales in. */
export const OverlayCard = ({ accent, children }: Props) => {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(120)}
      style={[styles.scrim, { backgroundColor: colors.scrim }]}
    >
      <Animated.View entering={ZoomIn.duration(220)} style={styles.wrap}>
        <Chamfer
          cut={22}
          fill={withAlpha(colors.surface, 0.97)}
          stroke={accent}
          strokeWidth={1.5}
          style={styles.card}
        >
          {children}
        </Chamfer>
        <CornerBrackets color={accent} size={18} thickness={2} inset={-5} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  wrap: { width: '100%', maxWidth: 380 },
  card: {
    padding: spacing.xl,
    gap: spacing.md,
  },
});

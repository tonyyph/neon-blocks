import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { ClearSummary } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { withAlpha } from '../../theme/colorUtils';
import { useTheme } from '../../theme/useTheme';
import { GlitchText } from '../ui/GlitchText';
import { Text } from '../ui/Text';

const CLEAR_NAMES = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS'];
const DURATION_MS = 1100;

const Callout = ({ summary }: { summary: ClearSummary }) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withTiming(1, { duration: DURATION_MS }));
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 0.7, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [8, -18]) },
      { scale: interpolate(progress.value, [0, 0.12, 1], [0.85, 1, 1]) },
    ],
  }));

  const isTetris = summary.lines === 4;
  return (
    <Animated.View
      style={[
        styles.callout,
        { backgroundColor: withAlpha(colors.background, 0.72), borderColor: colors.line },
        style,
      ]}
    >
      {isTetris ? (
        <GlitchText variant="title" color={colors.primary} jitter={false}>
          {CLEAR_NAMES[4]}
        </GlitchText>
      ) : (
        <Text variant="heading" color={colors.text}>
          {CLEAR_NAMES[summary.lines]}
        </Text>
      )}
      {summary.backToBack ? (
        <Text variant="label" color={colors.secondary}>
          Back-to-back
        </Text>
      ) : null}
      {summary.combo > 0 ? (
        <Text variant="label" color={colors.success}>
          {`Combo ×${summary.combo}`}
        </Text>
      ) : null}
      <Text variant="caption" color={colors.textDim}>
        {`+${summary.points.toLocaleString()}`}
      </Text>
    </Animated.View>
  );
};

/** Floating label announcing each line clear. Remounts per clear so the animation restarts. */
export const ClearCallout = () => {
  const lastClear = useGameStore((store) => store.game.lastClear);
  return (
    <View pointerEvents="none" style={styles.layer}>
      {lastClear ? <Callout key={lastClear.id} summary={lastClear} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
  },
});

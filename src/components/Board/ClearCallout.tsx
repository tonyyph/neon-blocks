import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { ClearSummary } from '../../game/types';
import { getZoneName } from '../../game/zone';
import { formatNumber, useT } from '../../i18n';
import { useGameStore } from '../../store/gameStore';
import { withAlpha } from '../../theme/colorUtils';
import { useTheme } from '../../theme/useTheme';
import { GlitchText } from '../ui/GlitchText';
import { Text } from '../ui/Text';

const DURATION_MS = 1100;

const Callout = ({ summary }: { summary: ClearSummary }) => {
  const { colors } = useTheme();
  const t = useT();
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

  const isTetris = summary.lines === 4 && !summary.zone;
  const headline = summary.zone
    ? (getZoneName(summary.lines) ?? t.game.zoneLines(summary.lines))
    : t.game.clears[summary.lines];
  const big = isTetris || summary.zone;
  return (
    <Animated.View
      style={[
        styles.callout,
        { backgroundColor: withAlpha(colors.background, 0.72), borderColor: colors.line },
        style,
      ]}
    >
      {summary.zone ? (
        <Text variant="label" color={colors.secondary}>
          {t.game.zone}
        </Text>
      ) : null}
      {big ? (
        <GlitchText variant="title" color={colors.primary} jitter={false}>
          {headline}
        </GlitchText>
      ) : (
        <Text variant="heading" color={colors.text}>
          {headline}
        </Text>
      )}
      {summary.chain > 1 ? (
        <Text variant="label" color={colors.danger}>
          {t.game.chain(summary.chain)}
        </Text>
      ) : null}
      {summary.backToBack ? (
        <Text variant="label" color={colors.secondary}>
          {t.game.backToBack}
        </Text>
      ) : null}
      {summary.combo > 0 ? (
        <Text variant="label" color={colors.success}>
          {t.game.combo(summary.combo)}
        </Text>
      ) : null}
      <Text variant="caption" color={colors.textDim}>
        {`+${formatNumber(summary.points, t)}`}
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

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useT } from '../../i18n';
import { withAlpha } from '../../theme/colorUtils';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import type { Demo } from '../../tutorial/steps';
import { Chamfer } from '../ui/Chamfer';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { Text } from '../ui/Text';

const DEMO_ICON: Record<Demo, IconName> = {
  swipeSideways: 'gesture-swipe-horizontal',
  tap: 'gesture-tap',
  dragDown: 'gesture-swipe-down',
  flickDown: 'gesture-swipe-down',
  swipeUp: 'gesture-swipe-up',
  zoneButton: 'arrow-top-right-thick',
};

/** A hand icon acting out the gesture: slow for a drag, sharp for a flick, a pulse for a tap. */
const GestureDemo = ({ demo, color }: { demo: Demo; color: string }) => {
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
    if (reduceMotion) return undefined;
    switch (demo) {
      case 'swipeSideways':
        x.set(
          withRepeat(
            withSequence(
              withTiming(-14, { duration: 450 }),
              withTiming(14, { duration: 900 }),
              withTiming(0, { duration: 450 }),
            ),
            -1,
          ),
        );
        break;
      case 'tap':
      case 'zoneButton':
        scale.set(
          withRepeat(
            withSequence(
              withTiming(0.8, { duration: 160 }),
              withTiming(1, { duration: 220 }),
              withDelay(500, withTiming(1, { duration: 0 })),
            ),
            -1,
          ),
        );
        break;
      case 'dragDown':
        y.set(
          withRepeat(
            withSequence(withTiming(16, { duration: 1400 }), withTiming(0, { duration: 0 })),
            -1,
          ),
        );
        break;
      case 'flickDown':
        y.set(
          withRepeat(
            withSequence(
              withTiming(18, { duration: 160 }),
              withDelay(700, withTiming(0, { duration: 0 })),
            ),
            -1,
          ),
        );
        break;
      case 'swipeUp':
        y.set(
          withRepeat(
            withSequence(
              withTiming(-16, { duration: 260 }),
              withDelay(600, withTiming(0, { duration: 0 })),
            ),
            -1,
          ),
        );
        break;
    }
    return () => {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(scale);
    };
  }, [demo, reduceMotion, scale, x, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Icon name={DEMO_ICON[demo]} size={34} color={color} />
    </Animated.View>
  );
};

interface Props {
  step: number;
  total: number;
  title: string;
  body: string;
  demo: Demo;
  /** Shows the "Nice!" state while the next step loads. */
  succeeded: boolean;
  /** Omitted while the tutorial is mandatory, which hides Skip. */
  onSkip?: () => void;
}

/** The tutorial's instructions, under the board and outside the touch area. */
export const CoachCard = ({ step, total, title, body, demo, succeeded, onSkip }: Props) => {
  const { colors } = useTheme();
  const t = useT();

  return (
    <View style={styles.wrap}>
      <Chamfer
        cut={14}
        fill={withAlpha(colors.surface, 0.97)}
        stroke={succeeded ? colors.success : colors.primary}
        strokeWidth={1.5}
        style={styles.card}
      >
        <View style={styles.demo}>
          {succeeded ? (
            <Animated.View entering={ZoomIn.duration(200)}>
              <Icon name="check-circle" size={38} color={colors.success} />
            </Animated.View>
          ) : (
            <GestureDemo demo={demo} color={colors.primary} />
          )}
        </View>

        <Animated.View
          key={`${step}-${succeeded}`}
          entering={FadeIn.duration(220)}
          style={styles.text}
        >
          <View style={styles.topRow}>
            <Text variant="label" color={colors.textDim}>
              {t.tutorial.stepCounter(step, total)}
            </Text>
            {onSkip ? (
              <PressableScale accessibilityRole="button" hitSlop={10} onPress={onSkip}>
                <Text variant="label" color={colors.textDim}>
                  {t.tutorial.skipShort}
                </Text>
              </PressableScale>
            ) : null}
          </View>
          <Text variant="heading" color={succeeded ? colors.success : colors.text}>
            {succeeded ? t.tutorial.success : title}
          </Text>
          {succeeded ? null : (
            <Text variant="caption" color={colors.textDim}>
              {body}
            </Text>
          )}
          <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < step - 1 || (i === step - 1 && succeeded)
                        ? colors.primary
                        : i === step - 1
                          ? withAlpha(colors.primary, 0.45)
                          : colors.surfaceRaised,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </Chamfer>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, paddingTop: spacing.xs },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 112,
  },
  demo: { width: 52, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginTop: spacing.xs },
  dot: { width: 18, height: 4, borderRadius: 2 },
});

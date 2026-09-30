import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { TypographyVariant } from '../../theme/typography';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

interface Props {
  children: string;
  variant?: TypographyVariant;
  color?: string;
  /** Occasional horizontal tear. Off when the system asks for reduced motion. */
  jitter?: boolean;
}

/**
 * Chromatic-aberration text: offset copies in the theme's secondary and danger colours sit
 * behind the main layer, and every few seconds they tear sideways for a few frames.
 */
export const GlitchText = ({ children, variant = 'display', color, jitter = true }: Props) => {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const tear = useSharedValue(0);

  useEffect(() => {
    if (!jitter || reduceMotion) return;
    tear.set(
      withRepeat(
        withSequence(
          withDelay(2800, withTiming(5, { duration: 40 })),
          withTiming(-4, { duration: 50 }),
          withTiming(2, { duration: 40 }),
          withTiming(0, { duration: 40 }),
        ),
        -1,
      ),
    );
  }, [jitter, reduceMotion, tear]);

  const left = useAnimatedStyle(() => ({ transform: [{ translateX: -2 - tear.value }] }));
  const right = useAnimatedStyle(() => ({ transform: [{ translateX: 2 + tear.value }] }));

  return (
    <View>
      <Animated.View style={[styles.layer, left]} pointerEvents="none">
        <Text variant={variant} color={theme.colors.secondary} style={styles.ghost}>
          {children}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.layer, right]} pointerEvents="none">
        <Text variant={variant} color={theme.colors.danger} style={styles.ghost}>
          {children}
        </Text>
      </Animated.View>
      <Text variant={variant} color={color ?? theme.colors.text}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
  ghost: { opacity: 0.75 },
});

import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Chamfer } from './Chamfer';

const WIDTH = 54;
const HEIGHT = 32;
const INSET = 4;
const KNOB = HEIGHT - INSET * 2;
const TRAVEL = WIDTH - KNOB - INSET * 2;

/** Corner rounding per theme shape, so the knob matches the track and the rest of the UI. */
const KNOB_RADIUS = { round: KNOB / 2, arch: KNOB / 2, square: 2, notch: 3, chamfer: 3 } as const;

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

/**
 * On/off switch drawn in the active theme instead of the native one. The native switch has a pure
 * white knob that the CRT scanline overlay stripes, and its off track nearly vanishes on dark
 * panels; this one has an outlined off state and a knob in theme colours.
 */
export const Toggle = ({ value, onValueChange, accessibilityLabel }: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(value ? 1 : 0, { duration: reduceMotion ? 0 : 160 }));
  }, [value, progress, reduceMotion]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, TRAVEL]) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
    >
      <Chamfer
        cut={8}
        fill={value ? colors.primary : colors.surfaceRaised}
        stroke={value ? colors.primary : colors.textDim}
        strokeWidth={1.5}
        style={styles.track}
      >
        <View style={styles.rail}>
          <Animated.View
            style={[
              styles.knob,
              {
                backgroundColor: value ? colors.onPrimary : colors.textDim,
                borderRadius: KNOB_RADIUS[theme.shape],
              },
              knobStyle,
            ]}
          />
        </View>
      </Chamfer>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: { width: WIDTH, height: HEIGHT, justifyContent: 'center' },
  rail: { paddingHorizontal: INSET },
  knob: { width: KNOB, height: KNOB },
});

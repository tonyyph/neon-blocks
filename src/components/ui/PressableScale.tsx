import type { ReactNode } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  children: ReactNode;
}

/** Pressable that shrinks slightly while held. The animation runs on the UI thread. */
export const PressableScale = ({
  style,
  pressedScale = 0.94,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = (event: GestureResponderEvent) => {
    scale.set(withTiming(pressedScale, { duration: 70 }));
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    scale.set(withTiming(1, { duration: 120 }));
    onPressOut?.(event);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

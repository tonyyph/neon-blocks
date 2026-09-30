import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { Backdrop, type BackdropIntensity, Scanlines } from './Backdrop';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backdrop?: BackdropIntensity;
}

/** Full-screen safe-area container: themed backdrop behind, scanlines on top. */
export const Screen = ({ children, style, backdrop = 'full' }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Backdrop intensity={backdrop} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <Animated.View entering={FadeIn.duration(180)} style={[styles.content, style]}>
          {children}
        </Animated.View>
      </SafeAreaView>
      <Scanlines />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1 },
});

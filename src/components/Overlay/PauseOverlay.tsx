import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { GlitchText } from '../ui/GlitchText';
import { OverlayCard } from './OverlayCard';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMenu: () => void;
}

export const PauseOverlay = ({ onResume, onRestart, onSettings, onMenu }: Props) => {
  const { colors } = useTheme();
  return (
    <OverlayCard accent={colors.secondary}>
      <View style={styles.title}>
        <GlitchText variant="title">Paused</GlitchText>
      </View>
      <Button label="Resume" icon="play" variant="primary" onPress={onResume} />
      <Button label="Restart" icon="restart" onPress={onRestart} />
      <Button label="Settings" icon="cog-outline" onPress={onSettings} />
      <Button label="Main menu" icon="home-outline" onPress={onMenu} />
    </OverlayCard>
  );
};

const styles = StyleSheet.create({
  title: { alignItems: 'center', marginBottom: spacing.sm },
});

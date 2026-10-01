import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme/spacing';
import { useT } from '../../i18n';
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
  const t = useT();
  return (
    <OverlayCard accent={colors.secondary}>
      <View style={styles.title}>
        <GlitchText variant="title">{t.pause.title}</GlitchText>
      </View>
      <Button label={t.pause.resume} icon="play" variant="primary" onPress={onResume} />
      <Button label={t.pause.restart} icon="restart" onPress={onRestart} />
      <Button label={t.pause.settings} icon="cog-outline" onPress={onSettings} />
      <Button label={t.pause.menu} icon="home-outline" onPress={onMenu} />
    </OverlayCard>
  );
};

const styles = StyleSheet.create({
  title: { alignItems: 'center', marginBottom: spacing.sm },
});

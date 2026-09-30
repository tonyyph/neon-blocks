import { StyleSheet, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Chamfer } from '../components/ui/Chamfer';
import { GlitchText } from '../components/ui/GlitchText';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { PressableScale } from '../components/ui/PressableScale';
import { Readout } from '../components/ui/Readout';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { useStatsStore } from '../store/statsStore';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

interface Props {
  onStart: () => void;
  onThemes: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
}

export const MainMenuScreen = ({ onStart, onThemes, onSettings, onHowToPlay }: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const stats = useStatsStore((store) => store.stats);

  return (
    <Screen style={styles.screen}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Theme: ${theme.name}. Change theme`}
        onPress={onThemes}
        style={styles.themeChip}
      >
        <Chamfer
          cut={7}
          fill={withAlpha(colors.surface, 0.85)}
          stroke={colors.line}
          style={styles.chip}
        >
          <Icon name="palette-swatch-variant" size={16} color={colors.primary} />
          <Text variant="caption" color={colors.text}>
            {theme.name}
          </Text>
        </Chamfer>
      </PressableScale>

      <View style={styles.hero}>
        <Logo cellSize={26} theme={theme} />
        <View style={styles.title}>
          <GlitchText variant="display" color={colors.primary}>
            NEON
          </GlitchText>
          <GlitchText variant="display" color={colors.text} jitter={false}>
            BLOCKS
          </GlitchText>
        </View>
      </View>

      <View style={styles.record}>
        <Text variant="label" color={colors.textDim}>
          High score
        </Text>
        <Readout value={stats.highScore} digits={7} variant="score" color={colors.text} />
        {stats.gamesPlayed > 0 ? (
          <Text variant="caption" color={colors.textDim}>
            {`Best run: ${stats.bestLines} lines, level ${stats.bestLevel}`}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label="Start" icon="play" variant="primary" onPress={onStart} />
        <View style={styles.row}>
          <View style={styles.half}>
            <Button label="Themes" icon="palette-outline" onPress={onThemes} />
          </View>
          <View style={styles.half}>
            <Button label="Settings" icon="cog-outline" onPress={onSettings} />
          </View>
        </View>
        <Button label="How to play" icon="help-circle-outline" onPress={onHowToPlay} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-evenly',
  },
  themeChip: { position: 'absolute', top: spacing.sm, right: spacing.lg, zIndex: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  hero: { alignItems: 'center', gap: spacing.xl },
  title: { alignItems: 'center' },
  record: { alignItems: 'center', gap: 2 },
  actions: {
    gap: spacing.md,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});

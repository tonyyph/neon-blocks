import { StyleSheet, View } from 'react-native';

import { useGameStore } from '../../store/gameStore';
import { useStatsStore } from '../../store/statsStore';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Chamfer } from '../ui/Chamfer';
import { GlitchText } from '../ui/GlitchText';
import { Text } from '../ui/Text';
import { OverlayCard } from './OverlayCard';

interface Props {
  onRestart: () => void;
  onMenu: () => void;
}

const Stat = ({ label, value }: { label: string; value: number }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text variant="label" color={colors.textDim}>
        {label}
      </Text>
      <Text variant="stat">{value.toLocaleString()}</Text>
    </View>
  );
};

export const GameOverOverlay = ({ onRestart, onMenu }: Props) => {
  const { colors } = useTheme();
  const score = useGameStore((store) => store.game.score);
  const lines = useGameStore((store) => store.game.lines);
  const level = useGameStore((store) => store.game.level);
  const gameId = useGameStore((store) => store.game.gameId);
  const highScore = useStatsStore((store) => store.stats.highScore);
  const isNewHighScore = useStatsStore(
    (store) => store.lastOutcome?.gameId === gameId && store.lastOutcome.isNewHighScore,
  );

  return (
    <OverlayCard accent={isNewHighScore ? colors.success : colors.danger}>
      <View style={styles.center}>
        <GlitchText variant="title" color={colors.danger}>
          Game over
        </GlitchText>
      </View>
      {isNewHighScore ? (
        <Chamfer cut={6} fill={colors.success} style={styles.badge}>
          <Text variant="label" color={colors.background}>
            New high score
          </Text>
        </Chamfer>
      ) : null}
      <View style={styles.center}>
        <Text variant="label" color={colors.textDim}>
          Score
        </Text>
        <Text variant="display" color={colors.primary} style={styles.score}>
          {score.toLocaleString()}
        </Text>
      </View>
      <View style={styles.stats}>
        <Stat label="Lines" value={lines} />
        <Stat label="Level" value={level} />
        <Stat label="Best" value={highScore} />
      </View>
      <Button label="Play again" icon="restart" variant="primary" onPress={onRestart} />
      <Button label="Main menu" icon="home-outline" onPress={onMenu} />
    </OverlayCard>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  score: { fontSize: 40, lineHeight: 52 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  stat: { alignItems: 'center', gap: 2 },
});

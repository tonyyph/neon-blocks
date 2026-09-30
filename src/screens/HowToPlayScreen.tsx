import { ScrollView, StyleSheet, View } from 'react-native';

import { Chamfer } from '../components/ui/Chamfer';
import { Icon, type IconName } from '../components/ui/Icon';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

const CONTROLS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'gesture-swipe-horizontal',
    title: 'Move',
    body: 'Drag left or right anywhere below the score. The piece follows your finger.',
  },
  {
    icon: 'gesture-tap',
    title: 'Rotate',
    body: 'Tap the right half to turn clockwise, the left half to turn the other way.',
  },
  { icon: 'gesture-swipe-down', title: 'Soft drop', body: 'Drag down slowly. +1 per row.' },
  {
    icon: 'arrow-collapse-down',
    title: 'Hard drop',
    body: 'Flick down to slam the piece and lock it. +2 per row.',
  },
  {
    icon: 'gesture-swipe-up',
    title: 'Hold',
    body: 'Swipe up to save the piece for later. Once per piece.',
  },
  {
    icon: 'view-sequential',
    title: 'Clear lines',
    body: 'Fill a row to clear it. Every 10 lines speeds up the game.',
  },
];

const SCORES: [string, string][] = [
  ['Single', '100'],
  ['Double', '300'],
  ['Triple', '500'],
  ['Tetris', '800'],
];

interface Props {
  onBack: () => void;
}

export const HowToPlayScreen = ({ onBack }: Props) => {
  const { colors } = useTheme();
  const card = { fill: withAlpha(colors.surface, 0.92), stroke: colors.line };
  return (
    <Screen>
      <ScreenHeader title="How to play" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {CONTROLS.map(({ icon, title, body }) => (
          <Chamfer key={title} cut={10} {...card} style={styles.item}>
            <Chamfer cut={6} fill={colors.surfaceRaised} style={styles.iconWrap}>
              <Icon name={icon} size={24} color={colors.primary} />
            </Chamfer>
            <View style={styles.itemText}>
              <Text variant="heading">{title}</Text>
              <Text variant="caption" color={colors.textDim}>
                {body}
              </Text>
            </View>
          </Chamfer>
        ))}

        <Chamfer cut={12} {...card} style={styles.scoreCard}>
          <Text variant="label" color={colors.textDim}>
            Points × level
          </Text>
          {SCORES.map(([name, points]) => (
            <View key={name} style={styles.scoreRow}>
              <Text variant="body">{name}</Text>
              <Text variant="stat" color={colors.primary}>
                {points}
              </Text>
            </View>
          ))}
          <Text variant="caption" color={colors.textDim}>
            A Tetris straight after another scores half again. Clearing on consecutive pieces builds
            a combo bonus.
          </Text>
        </Chamfer>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1, gap: 2 },
  scoreCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

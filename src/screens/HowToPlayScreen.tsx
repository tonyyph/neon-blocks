import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Chamfer } from '../components/ui/Chamfer';
import { Icon, type IconName } from '../components/ui/Icon';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { useT } from '../i18n';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

/** One icon per entry of `howToPlay.items`, in the same order. */
const ICONS: IconName[] = [
  'chevron-left',
  'rotate-right',
  'gesture-swipe-down',
  'arrow-collapse-down',
  'gesture-swipe-up',
  'view-sequential',
  'timer-sand',
  'dna',
];

interface Props {
  onBack: () => void;
  onTutorial: () => void;
}

export const HowToPlayScreen = ({ onBack, onTutorial }: Props) => {
  const { colors } = useTheme();
  const t = useT();
  const card = { fill: withAlpha(colors.surface, 0.92), stroke: colors.line };
  return (
    <Screen>
      <ScreenHeader title={t.howToPlay.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Button
          label={t.tutorial.replay}
          icon="school-outline"
          variant="primary"
          onPress={onTutorial}
        />
        {t.howToPlay.items.map(([title, body], index) => (
          <Chamfer key={title} cut={10} {...card} style={styles.item}>
            <Chamfer cut={6} fill={colors.surfaceRaised} style={styles.iconWrap}>
              <Icon name={ICONS[index]} size={24} color={colors.primary} />
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
            {t.howToPlay.pointsTitle}
          </Text>
          {t.howToPlay.points.map(([name, points]) => (
            <View key={name} style={styles.scoreRow}>
              <Text variant="body">{name}</Text>
              <Text variant="stat" color={colors.primary}>
                {points}
              </Text>
            </View>
          ))}
          <Text variant="caption" color={colors.textDim}>
            {t.howToPlay.pointsNote}
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

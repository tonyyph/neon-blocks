import { ScrollView, StyleSheet, View } from 'react-native';

import { Chamfer } from '../components/ui/Chamfer';
import { Icon } from '../components/ui/Icon';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { ACHIEVEMENTS } from '../progress/achievements';
import { useStatsStore } from '../store/statsStore';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

export const AchievementsScreen = ({ onBack }: { onBack: () => void }) => {
  const { colors } = useTheme();
  const unlocked = useStatsStore((store) => store.progress.achievements);
  const earned = ACHIEVEMENTS.filter(({ id }) => unlocked[id]).length;

  return (
    <Screen>
      <ScreenHeader title="Awards" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text variant="body" color={colors.textDim} style={styles.count}>
          {`${earned} of ${ACHIEVEMENTS.length} earned`}
        </Text>
        {ACHIEVEMENTS.map((achievement) => {
          const at = unlocked[achievement.id];
          return (
            <Chamfer
              key={achievement.id}
              cut={10}
              fill={withAlpha(at ? colors.primary : colors.surface, at ? 0.12 : 0.85)}
              stroke={at ? colors.primary : colors.line}
              style={styles.item}
            >
              <Icon
                name={at ? achievement.icon : 'lock-outline'}
                size={26}
                color={at ? colors.primary : colors.textFaint}
              />
              <View style={styles.text}>
                <Text variant="heading" color={at ? colors.text : colors.textDim}>
                  {achievement.name}
                </Text>
                <Text variant="caption" color={colors.textDim}>
                  {achievement.description}
                </Text>
              </View>
              {at ? (
                <Text variant="caption" color={colors.textFaint}>
                  {new Date(at).toLocaleDateString()}
                </Text>
              ) : null}
            </Chamfer>
          );
        })}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.sm },
  count: { textAlign: 'center', marginBottom: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  text: { flex: 1, gap: 2 },
});

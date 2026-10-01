import { ScrollView, StyleSheet, View } from 'react-native';

import { Chamfer } from '../components/ui/Chamfer';
import { Icon, type IconName } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { MODES, MODE_ORDER, MUTATOR_INFO, dailyMutator, toDateKey } from '../game/modes';
import type { GameMode } from '../game/types';
import { currentStreak } from '../progress/records';
import type { ModeRecord } from '../progress/types';
import { useStatsStore } from '../store/statsStore';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';
import { formatTime } from '../utils/formatTime';

const ICONS: Record<GameMode, IconName> = {
  marathon: 'infinity',
  sprint: 'flag-checkered',
  ultra: 'timer-outline',
  dig: 'shovel',
  cascade: 'link-variant',
  mutators: 'dna',
  daily: 'calendar-star',
};

/** The record line under a mode: best score or best time, or an invitation if never played. */
const recordLine = (mode: GameMode, record: ModeRecord | undefined): string => {
  if (!record?.plays) return 'Not played yet';
  if (MODES[mode].record === 'time') {
    return record.bestTimeMs != null ? `Best ${formatTime(record.bestTimeMs)}` : 'Not finished yet';
  }
  return `Best ${record.bestScore.toLocaleString()}`;
};

const DailyCard = ({ onPlay }: { onPlay: () => void }) => {
  const { colors } = useTheme();
  const today = toDateKey(new Date());
  const daily = useStatsStore((store) => store.progress.daily);
  const todayScore = daily.results[today];
  const streak = currentStreak(daily, today);
  const twist = MUTATOR_INFO[dailyMutator(today)];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Daily challenge, ${today}. Twist: ${twist.name}.`}
      onPress={onPlay}
      pressedScale={0.97}
    >
      <Chamfer
        cut={18}
        fill={withAlpha(colors.primary, 0.12)}
        stroke={colors.primary}
        strokeWidth={2}
        style={styles.daily}
      >
        <View style={styles.dailyTop}>
          <Icon name="calendar-star" size={26} color={colors.primary} />
          <View style={styles.flex}>
            <Text variant="heading" color={colors.primary}>
              Daily challenge
            </Text>
            <Text variant="caption" color={colors.textDim}>
              {`${today} · twist: ${twist.name}`}
            </Text>
          </View>
          {streak > 0 ? (
            <View style={styles.streak}>
              <Icon name="fire" size={18} color={colors.danger} />
              <Text variant="stat" color={colors.text}>
                {streak}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" color={colors.text}>
          {todayScore === undefined
            ? `${MODES.daily.summary} ${twist.hint} Your first run today is the one that counts.`
            : `Today's score: ${todayScore.toLocaleString()}. Play again for practice.`}
        </Text>
      </Chamfer>
    </PressableScale>
  );
};

interface Props {
  onBack: () => void;
  onPlay: (mode: GameMode) => void;
}

export const ModeSelectScreen = ({ onBack, onPlay }: Props) => {
  const { colors } = useTheme();
  const records = useStatsStore((store) => store.progress.records);

  return (
    <Screen>
      <ScreenHeader title="Play" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        <DailyCard onPlay={() => onPlay('daily')} />
        {MODE_ORDER.map((mode) => {
          const config = MODES[mode];
          return (
            <PressableScale
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`${config.name}. ${config.summary}`}
              onPress={() => onPlay(mode)}
              pressedScale={0.97}
            >
              <Chamfer
                cut={12}
                fill={withAlpha(colors.surface, 0.92)}
                stroke={colors.line}
                style={styles.mode}
              >
                <Chamfer cut={6} fill={colors.surfaceRaised} style={styles.icon}>
                  <Icon name={ICONS[mode]} size={24} color={colors.primary} />
                </Chamfer>
                <View style={styles.flex}>
                  <Text variant="heading">{config.name}</Text>
                  <Text variant="caption" color={colors.textDim}>
                    {config.summary}
                  </Text>
                </View>
                <Text variant="caption" color={colors.secondary} style={styles.record}>
                  {recordLine(mode, records[mode])}
                </Text>
              </Chamfer>
            </PressableScale>
          );
        })}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  daily: { padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.sm },
  dailyTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  record: { maxWidth: 96, textAlign: 'right' },
});

import { ScrollView, StyleSheet, View } from 'react-native';

import { Chamfer } from '../components/ui/Chamfer';
import { Icon, type IconName } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { MODES, MODE_ORDER, dailyMutator, toDateKey } from '../game/modes';
import type { GameMode } from '../game/types';
import { type Strings, formatDay, formatNumber, useT } from '../i18n';
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
  tutorial: 'school-outline',
};

/** The record line under a mode: best score or best time, or an invitation if never played. */
const recordLine = (mode: GameMode, record: ModeRecord | undefined, t: Strings): string => {
  if (!record?.plays) return t.modes.notPlayed;
  if (MODES[mode].record === 'time') {
    return record.bestTimeMs != null
      ? t.modes.best(formatTime(record.bestTimeMs))
      : t.modes.notFinished;
  }
  return t.modes.best(formatNumber(record.bestScore, t));
};

const DailyCard = ({ onPlay }: { onPlay: () => void }) => {
  const { colors } = useTheme();
  const t = useT();
  const today = toDateKey(new Date());
  const daily = useStatsStore((store) => store.progress.daily);
  const todayScore = daily.results[today];
  const streak = currentStreak(daily, today);
  const twist = dailyMutator(today);
  const twistName = t.mutators.names[twist];
  const day = formatDay(today, t);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t.daily.a11y(day, twistName)}
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
              {t.daily.title}
            </Text>
            <Text variant="caption" color={colors.textDim}>
              {t.daily.subtitle(day, twistName)}
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
            ? t.daily.intro(t.modes.summaries.daily, t.mutators.hints[twist])
            : t.daily.played(formatNumber(todayScore, t))}
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
  const t = useT();
  const records = useStatsStore((store) => store.progress.records);

  return (
    <Screen>
      <ScreenHeader title={t.modes.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        <DailyCard onPlay={() => onPlay('daily')} />
        {MODE_ORDER.map((mode) => {
          const name = t.modes.names[mode];
          const summary = t.modes.summaries[mode];
          return (
            <PressableScale
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`${name}. ${summary}`}
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
                  <Text variant="heading">{name}</Text>
                  <Text variant="caption" color={colors.textDim}>
                    {summary}
                  </Text>
                </View>
                <Text variant="caption" color={colors.secondary} style={styles.record}>
                  {recordLine(mode, records[mode], t)}
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

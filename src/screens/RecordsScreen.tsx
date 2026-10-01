import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chamfer } from '../components/ui/Chamfer';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { MODES, MODE_ORDER } from '../game/modes';
import { type Strings, formatNumber, useT } from '../i18n';
import { piecesPerSecond } from '../progress/types';
import { useStatsStore } from '../store/statsStore';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';
import { formatTime } from '../utils/formatTime';

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const { colors } = useTheme();
  return (
    <Chamfer
      cut={12}
      fill={withAlpha(colors.surface, 0.92)}
      stroke={colors.line}
      style={styles.section}
    >
      <Text variant="label" color={colors.textDim}>
        {title}
      </Text>
      {children}
    </Chamfer>
  );
};

const Row = ({ label, value, dim }: { label: string; value: string; dim?: boolean }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="body" color={dim ? colors.textDim : colors.text}>
        {label}
      </Text>
      <Text variant="stat" color={dim ? colors.textFaint : colors.primary}>
        {value}
      </Text>
    </View>
  );
};

const formatDate = (epochMs: number) => {
  const date = new Date(epochMs);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const formatHours = (ms: number, t: Strings) => {
  const minutes = Math.round(ms / 60_000);
  return minutes < 60
    ? t.records.minutes(minutes)
    : t.records.hours(Math.floor(minutes / 60), minutes % 60);
};

export const RecordsScreen = ({ onBack }: { onBack: () => void }) => {
  const { colors } = useTheme();
  const t = useT();
  const progress = useStatsStore((store) => store.progress);
  const { totals, records, daily, recent } = progress;

  return (
    <Screen>
      <ScreenHeader title={t.records.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        <Section title={t.records.byMode}>
          {[...MODE_ORDER, 'daily' as const].map((mode) => {
            const record = records[mode];
            const config = MODES[mode];
            const value = !record?.plays
              ? '–'
              : config.record === 'time'
                ? record.bestTimeMs != null
                  ? formatTime(record.bestTimeMs)
                  : t.records.notFinished
                : formatNumber(record.bestScore, t);
            return (
              <Row key={mode} label={t.modes.names[mode]} value={value} dim={!record?.plays} />
            );
          })}
        </Section>

        <Section title={t.records.daily}>
          <Row label={t.records.streak} value={`${daily.streak}`} />
          <Row label={t.records.bestStreak} value={`${daily.bestStreak}`} />
          <Row label={t.records.daysPlayed} value={`${Object.keys(daily.results).length}`} />
        </Section>

        <Section title={t.records.allTime}>
          <Row label={t.records.games} value={formatNumber(totals.games, t)} />
          <Row label={t.records.lines} value={formatNumber(totals.lines, t)} />
          <Row label={t.records.tetrises} value={formatNumber(totals.tetrises, t)} />
          <Row label={t.records.pieces} value={formatNumber(totals.pieces, t)} />
          <Row
            label={t.records.pps}
            value={piecesPerSecond(totals.pieces, totals.playTimeMs).toLocaleString(t.locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          />
          <Row label={t.records.longestCombo} value={`${totals.maxCombo}`} />
          <Row label={t.records.longestChain} value={`${totals.maxChain}`} />
          <Row label={t.records.biggestZone} value={t.records.zoneLines(totals.maxZoneLines)} />
          <Row label={t.records.timePlayed} value={formatHours(totals.playTimeMs, t)} />
        </Section>

        <Section title={t.records.recent}>
          {recent.length === 0 ? (
            <Text variant="caption" color={colors.textDim}>
              {t.records.recentEmpty}
            </Text>
          ) : (
            recent.map((game) => {
              const timed = MODES[game.mode].record === 'time' && game.outcome === 'completed';
              return (
                <Row
                  key={`${game.finishedAt}-${game.mode}`}
                  label={`${formatDate(game.finishedAt)}  ${t.modes.names[game.mode]}`}
                  value={timed ? formatTime(game.timeMs) : formatNumber(game.score, t)}
                />
              );
            })
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.lg },
  section: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chamfer } from '../components/ui/Chamfer';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { MODES, MODE_ORDER } from '../game/modes';
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

const formatHours = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

export const RecordsScreen = ({ onBack }: { onBack: () => void }) => {
  const { colors } = useTheme();
  const progress = useStatsStore((store) => store.progress);
  const { totals, records, daily, recent } = progress;

  return (
    <Screen>
      <ScreenHeader title="Records" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        <Section title="Best by mode">
          {[...MODE_ORDER, 'daily' as const].map((mode) => {
            const record = records[mode];
            const config = MODES[mode];
            const value = !record?.plays
              ? '–'
              : config.record === 'time'
                ? record.bestTimeMs != null
                  ? formatTime(record.bestTimeMs)
                  : 'DNF'
                : record.bestScore.toLocaleString();
            return <Row key={mode} label={config.name} value={value} dim={!record?.plays} />;
          })}
        </Section>

        <Section title="Daily">
          <Row label="Current streak" value={`${daily.streak}`} />
          <Row label="Best streak" value={`${daily.bestStreak}`} />
          <Row label="Days played" value={`${Object.keys(daily.results).length}`} />
        </Section>

        <Section title="All time">
          <Row label="Games" value={totals.games.toLocaleString()} />
          <Row label="Lines" value={totals.lines.toLocaleString()} />
          <Row label="Tetrises" value={totals.tetrises.toLocaleString()} />
          <Row label="Pieces" value={totals.pieces.toLocaleString()} />
          <Row
            label="Pieces per second"
            value={piecesPerSecond(totals.pieces, totals.playTimeMs).toFixed(2)}
          />
          <Row label="Longest combo" value={`${totals.maxCombo}`} />
          <Row label="Longest chain" value={`${totals.maxChain}`} />
          <Row label="Biggest Zone" value={`${totals.maxZoneLines} lines`} />
          <Row label="Time played" value={formatHours(totals.playTimeMs)} />
        </Section>

        <Section title="Recent games">
          {recent.length === 0 ? (
            <Text variant="caption" color={colors.textDim}>
              Finish a game and it shows up here.
            </Text>
          ) : (
            recent.map((game) => {
              const timed = MODES[game.mode].record === 'time' && game.outcome === 'completed';
              return (
                <Row
                  key={`${game.finishedAt}-${game.mode}`}
                  label={`${formatDate(game.finishedAt)}  ${MODES[game.mode].name}`}
                  value={timed ? formatTime(game.timeMs) : game.score.toLocaleString()}
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

import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { MODES } from '../../game/modes';
import { formatNumber, useT } from '../../i18n';
import { useShareResult } from '../../hooks/useShareResult';
import { ACHIEVEMENTS } from '../../progress/achievements';
import { useGameStore } from '../../store/gameStore';
import { useStatsStore } from '../../store/statsStore';
import { LINE_BOX } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { formatTime } from '../../utils/formatTime';
import { Button } from '../ui/Button';
import { Chamfer } from '../ui/Chamfer';
import { GlitchText } from '../ui/GlitchText';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';
import { OverlayCard } from './OverlayCard';

interface Props {
  onRestart: () => void;
  /** Omitted when leaving is not allowed, which hides the Menu button. */
  onMenu?: () => void;
}

const Stat = ({ label, value }: { label: string; value: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text variant="label" color={colors.textDim}>
        {label}
      </Text>
      <Text variant="stat">{value}</Text>
    </View>
  );
};

const Badge = ({ label, color }: { label: string; color: string }) => {
  const { colors } = useTheme();
  return (
    <Chamfer cut={6} fill={color} style={styles.badge}>
      <Text variant="label" color={colors.background}>
        {label}
      </Text>
    </Chamfer>
  );
};

export const GameOverOverlay = ({ onRestart, onMenu }: Props) => {
  const theme = useTheme();
  const t = useT();
  const { colors } = theme;
  const game = useGameStore((store) => store.game);
  const record = useStatsStore((store) => store.progress.records[game.mode]);
  const outcome = useStatsStore((store) =>
    store.lastOutcome?.gameId === game.gameId ? store.lastOutcome : null,
  );
  const cardRef = useRef<View>(null);
  const { share, busy } = useShareResult(cardRef);

  const config = MODES[game.mode];
  const result = game.outcome ?? 'topOut';
  const racing = config.record === 'time';
  const headline = racing && result === 'completed' ? formatTime(game.elapsedMs) : null;
  const best = racing
    ? record?.bestTimeMs != null
      ? formatTime(record.bestTimeMs)
      : '–'
    : formatNumber(record?.bestScore ?? game.score, t);
  const accent = result === 'completed' || outcome?.isRecord ? colors.success : colors.danger;
  const unlocked = ACHIEVEMENTS.filter(({ id }) => outcome?.unlocked.includes(id));

  return (
    <OverlayCard accent={accent}>
      {/* This block is what Share captures, so it carries its own background and branding. */}
      <View
        ref={cardRef}
        collapsable={false}
        style={[styles.shareCard, { backgroundColor: colors.surface }]}
      >
        <View style={styles.center}>
          <Text variant="label" color={colors.textDim}>
            {game.mode === 'daily' && game.dateKey
              ? t.gameOver.dailyLabel(game.dateKey)
              : t.modes.names[game.mode]}
          </Text>
          <GlitchText
            variant="title"
            color={result === 'completed' ? colors.success : colors.danger}
          >
            {t.gameOver.titles[result]}
          </GlitchText>
        </View>

        <View style={styles.badges}>
          {outcome?.isRecord ? <Badge label={t.gameOver.newRecord} color={colors.success} /> : null}
          {game.mode === 'daily' && outcome ? (
            <Badge
              label={outcome.isOfficialDaily ? t.gameOver.todaysScore : t.gameOver.practice}
              color={outcome.isOfficialDaily ? colors.primary : colors.textDim}
            />
          ) : null}
        </View>

        <View style={styles.center}>
          <Text variant="label" color={colors.textDim}>
            {headline ? t.common.time : t.common.score}
          </Text>
          <Text
            variant="display"
            color={colors.primary}
            style={{ fontSize: 40, lineHeight: Math.ceil(40 * LINE_BOX[theme.fonts.display]) }}
          >
            {headline ?? formatNumber(game.score, t)}
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat label={t.common.lines} value={String(game.lines)} />
          <Stat
            label={racing ? t.common.score : t.common.level}
            value={racing ? formatNumber(game.score, t) : String(game.level)}
          />
          <Stat label={t.common.best} value={best} />
        </View>
        <Text variant="caption" color={colors.textFaint} style={styles.brand}>
          Neon Blocks
        </Text>
      </View>

      {unlocked.length ? (
        <View style={styles.unlocked}>
          {unlocked.map((achievement) => (
            <View key={achievement.id} style={styles.unlock}>
              <Icon name={achievement.icon} size={18} color={colors.primary} />
              <Text variant="caption" color={colors.text}>
                {t.awards.items[achievement.id][0]}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Button label={t.gameOver.playAgain} icon="restart" variant="primary" onPress={onRestart} />
      <View style={styles.row}>
        <View style={styles.half}>
          <Button
            label={busy ? t.gameOver.sharing : t.gameOver.share}
            icon="share-variant"
            onPress={share}
          />
        </View>
        {onMenu ? (
          <View style={styles.half}>
            <Button label={t.gameOver.menu} icon="home-outline" onPress={onMenu} />
          </View>
        ) : null}
      </View>
    </OverlayCard>
  );
};

const styles = StyleSheet.create({
  shareCard: { gap: spacing.sm, paddingVertical: spacing.sm },
  center: { alignItems: 'center' },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  brand: { textAlign: 'center' },
  unlocked: { gap: spacing.xs },
  unlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});

import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { BOARD_FRAME, GameBoard } from '../components/Board/GameBoard';
import { GestureHints } from '../components/Controls/GestureHints';
import { GameOverOverlay } from '../components/Overlay/GameOverOverlay';
import { PauseOverlay } from '../components/Overlay/PauseOverlay';
import { HoldPiece } from '../components/Preview/HoldPiece';
import { NextQueue } from '../components/Preview/NextQueue';
import { PREVIEW_BOX_H } from '../components/Preview/PiecePreview';
import { ZoneButton } from '../components/Controls/ZoneButton';
import { Chamfer } from '../components/ui/Chamfer';
import { Icon } from '../components/ui/Icon';
import { Panel } from '../components/ui/Panel';
import { PressableScale } from '../components/ui/PressableScale';
import { Readout } from '../components/ui/Readout';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { BOARD_WIDTH, VISIBLE_ROWS } from '../game/constants';
import { MODES, type ModeConfig } from '../game/modes';
import { useGameLoop } from '../hooks/useGameLoop';
import { useT } from '../i18n';
import { useGameEventHaptics } from '../hooks/useHaptics';
import { useGestureControls } from '../hooks/useGestureControls';
import { useRecordGameOver } from '../hooks/useRecordGameOver';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { dispatchGame, startNewGame, useGameStore } from '../store/gameStore';
import { MIN_TOUCH, spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';
import { clamp } from '../utils/clamp';
import { formatCountdown, formatTime } from '../utils/formatTime';

const PLAYFIELD_PADDING = spacing.md;
const STRIP_GAP = spacing.sm;
/** Panel label, padding and border around the 2-cell-tall previews. */
const STRIP_CHROME = 34;

interface Layout {
  cellSize: number;
  previewCell: number;
}

/**
 * Hold and next sit in a strip above the board, so the board gets the full width. The cell is the
 * largest whole pixel size that fits both ways.
 */
const computeLayout = (width: number, height: number): Layout => {
  const previewCell = clamp(Math.floor(width / 28), 10, 18);
  const stripHeight = previewCell * PREVIEW_BOX_H + STRIP_CHROME;
  const byWidth = (width - BOARD_FRAME * 2) / BOARD_WIDTH;
  const byHeight = (height - stripHeight - STRIP_GAP - BOARD_FRAME * 2) / VISIBLE_ROWS;
  return { cellSize: Math.max(8, Math.floor(Math.min(byWidth, byHeight))), previewCell };
};

const SCORE_DIGITS = 7;

/** Sprint and Dig race the clock: it counts up, in hundredths. */
const ElapsedClock = () => {
  const { colors } = useTheme();
  const centis = useGameStore((store) => Math.floor(store.game.elapsedMs / 10));
  return (
    <Text variant="score" color={colors.primary}>
      {formatTime(centis * 10)}
    </Text>
  );
};

const ScoreReadout = () => {
  const { colors } = useTheme();
  const score = useGameStore((store) => store.game.score);
  return <Readout value={score} digits={SCORE_DIGITS} variant="score" color={colors.primary} />;
};

/** The line under the main readout: what is left to do, or how long is left. */
const GoalLine = ({ config }: { config: ModeConfig }) => {
  const { colors } = useTheme();
  const t = useT();
  const text = useGameStore(({ game }) => {
    if (config.lineGoal !== null)
      return t.game.linesToGo(Math.max(0, config.lineGoal - game.lines));
    if (config.garbageRows > 0) return t.game.garbageLeft(game.garbageLeft);
    if (config.timeLimitMs !== null) {
      return t.game.timeLeft(formatCountdown(config.timeLimitMs - game.elapsedMs));
    }
    return null;
  });
  if (!text) return null;
  return (
    <Text variant="caption" color={colors.textDim}>
      {text}
    </Text>
  );
};

const ModeChip = ({ name }: { name: string }) => {
  const { colors } = useTheme();
  return (
    <Chamfer cut={7} fill={colors.surface} stroke={colors.line} style={styles.modeChip}>
      <Text variant="label" color={colors.textDim}>
        {name}
      </Text>
    </Chamfer>
  );
};

const Header = () => {
  const { colors } = useTheme();
  const t = useT();
  const mode = useGameStore((store) => store.game.mode);
  const config = MODES[mode];
  const racing = config.record === 'time';
  return (
    <View style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t.game.pause}
        hitSlop={8}
        onPress={() => dispatchGame({ type: 'pause' })}
      >
        <Chamfer cut={9} fill={colors.surface} stroke={colors.line} style={styles.pauseButton}>
          <Icon name="pause" size={24} color={colors.primary} />
        </Chamfer>
      </PressableScale>
      <View style={styles.scoreBlock}>
        <Text variant="label" color={colors.textDim}>
          {racing ? t.common.time : t.common.score}
        </Text>
        {racing ? <ElapsedClock /> : <ScoreReadout />}
        <GoalLine config={config} />
      </View>
      <View style={styles.right}>
        {config.zone ? <ZoneButton /> : <ModeChip name={t.modes.names[mode]} />}
      </View>
    </View>
  );
};

/** Level and lines, compact, at the end of the preview strip. */
const LevelLines = () => {
  const { colors } = useTheme();
  const t = useT();
  const level = useGameStore((store) => store.game.level);
  const lines = useGameStore((store) => store.game.lines);
  return (
    <Panel style={styles.levelPanel}>
      <View style={styles.metaRow}>
        <Text variant="label" color={colors.textDim}>
          {t.common.levelShort}
        </Text>
        <Readout value={level} digits={2} variant="stat" color={colors.text} />
      </View>
      <View style={styles.metaRow}>
        <Text variant="label" color={colors.textDim}>
          {t.common.linesShort}
        </Text>
        <Readout value={lines} digits={3} variant="stat" color={colors.text} />
      </View>
    </Panel>
  );
};

interface Props {
  onOpenSettings: () => void;
  /** Omitted when the player may not leave (the mandatory tutorial). */
  onExitToMenu?: () => void;
  /** Replaces the gesture legend under the board, outside the touch area (the tutorial coach). */
  footer?: ReactNode;
  /** What Restart in the pause menu does; defaults to a new game in the same mode. */
  onRestart?: () => void;
  /** The tutorial restarts its own step instead of showing a game-over card. */
  hideGameOver?: boolean;
}

export const GameScreen = ({
  onOpenSettings,
  onExitToMenu,
  footer,
  onRestart = () => startNewGame(),
  hideGameOver = false,
}: Props) => {
  const t = useT();
  useGameLoop();
  useSoundEffects();
  useGameEventHaptics();
  useRecordGameOver();

  const status = useGameStore((store) => store.game.status);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [areaWidth, setAreaWidth] = useState(0);
  const gesture = useGestureControls(layout?.cellSize ?? 20, areaWidth);

  const onPlayfieldLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    // onLayout reports the outer size; the columns only get what is inside the padding.
    setLayout(computeLayout(width - PLAYFIELD_PADDING * 2, height));
    setAreaWidth(width);
  };

  const exitToMenu = onExitToMenu
    ? () => {
        dispatchGame({ type: 'quit' });
        onExitToMenu();
      }
    : undefined;

  return (
    <Screen backdrop="dim">
      <Header />
      {/* Everything below the header is one touch surface; see useGestureControls. */}
      <GestureDetector gesture={gesture}>
        <View style={styles.touchArea} accessibilityHint={t.game.touchHint}>
          <View style={styles.playfield} onLayout={onPlayfieldLayout}>
            {layout ? (
              <View style={styles.stack}>
                <View style={styles.strip}>
                  <HoldPiece cellSize={layout.previewCell} />
                  <NextQueue cellSize={layout.previewCell} />
                  <LevelLines />
                </View>
                <GameBoard cellSize={layout.cellSize} />
              </View>
            ) : null}
          </View>
          {footer ? null : <GestureHints />}
        </View>
      </GestureDetector>
      {footer}

      {status === 'paused' ? (
        <PauseOverlay
          onResume={() => dispatchGame({ type: 'resume' })}
          onRestart={onRestart}
          onSettings={onOpenSettings}
          onMenu={exitToMenu}
        />
      ) : null}
      {status === 'gameOver' && !hideGameOver ? (
        <GameOverOverlay onRestart={() => startNewGame()} onMenu={exitToMenu} />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  pauseButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBlock: { alignItems: 'center' },
  right: { width: 76, alignItems: 'flex-end' },
  modeChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2 },
  levelPanel: { justifyContent: 'center', gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  touchArea: { flex: 1 },
  playfield: {
    flex: 1,
    paddingHorizontal: PLAYFIELD_PADDING,
  },
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: STRIP_GAP,
  },
  strip: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: STRIP_GAP,
  },
});

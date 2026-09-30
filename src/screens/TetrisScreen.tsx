import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { BOARD_FRAME, GameBoard } from '../components/Board/GameBoard';
import { GestureHints } from '../components/Controls/GestureHints';
import { GameOverOverlay } from '../components/Overlay/GameOverOverlay';
import { PauseOverlay } from '../components/Overlay/PauseOverlay';
import { HoldPiece } from '../components/Preview/HoldPiece';
import { NextQueue } from '../components/Preview/NextQueue';
import { PREVIEW_BOX_H } from '../components/Preview/PiecePreview';
import { Chamfer } from '../components/ui/Chamfer';
import { Icon } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { Readout } from '../components/ui/Readout';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { BOARD_WIDTH, VISIBLE_ROWS } from '../game/constants';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameEventHaptics } from '../hooks/useHaptics';
import { useGestureControls } from '../hooks/useGestureControls';
import { useRecordGameOver } from '../hooks/useRecordGameOver';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { dispatchGame, startNewGame, useGameStore } from '../store/gameStore';
import { MIN_TOUCH, spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';
import { clamp } from '../utils/clamp';

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

const Header = () => {
  const { colors } = useTheme();
  const score = useGameStore((store) => store.game.score);
  const level = useGameStore((store) => store.game.level);
  const lines = useGameStore((store) => store.game.lines);
  return (
    <View style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Pause"
        hitSlop={8}
        onPress={() => dispatchGame({ type: 'pause' })}
      >
        <Chamfer cut={9} fill={colors.surface} stroke={colors.line} style={styles.pauseButton}>
          <Icon name="pause" size={24} color={colors.primary} />
        </Chamfer>
      </PressableScale>
      <View style={styles.scoreBlock}>
        <Text variant="label" color={colors.textDim}>
          Score
        </Text>
        <Readout value={score} digits={SCORE_DIGITS} variant="score" color={colors.primary} />
      </View>
      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Text variant="label" color={colors.textDim}>
            Lv
          </Text>
          <Readout value={level} digits={2} variant="stat" color={colors.text} />
        </View>
        <View style={styles.metaRow}>
          <Text variant="label" color={colors.textDim}>
            Ln
          </Text>
          <Readout value={lines} digits={3} variant="stat" color={colors.text} />
        </View>
      </View>
    </View>
  );
};

interface Props {
  onOpenSettings: () => void;
  onExitToMenu: () => void;
}

export const TetrisScreen = ({ onOpenSettings, onExitToMenu }: Props) => {
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

  const exitToMenu = () => {
    dispatchGame({ type: 'quit' });
    onExitToMenu();
  };

  return (
    <Screen backdrop="dim">
      <Header />
      {/* Everything below the header is one touch surface; see useGestureControls. */}
      <GestureDetector gesture={gesture}>
        <View
          style={styles.touchArea}
          accessibilityHint="Drag to move, tap to rotate, flick down to drop, swipe up to hold"
        >
          <View style={styles.playfield} onLayout={onPlayfieldLayout}>
            {layout ? (
              <View style={styles.stack}>
                <View style={styles.strip}>
                  <HoldPiece cellSize={layout.previewCell} />
                  <NextQueue cellSize={layout.previewCell} />
                </View>
                <GameBoard cellSize={layout.cellSize} />
              </View>
            ) : null}
          </View>
          <GestureHints />
        </View>
      </GestureDetector>

      {status === 'paused' ? (
        <PauseOverlay
          onResume={() => dispatchGame({ type: 'resume' })}
          onRestart={startNewGame}
          onSettings={onOpenSettings}
          onMenu={exitToMenu}
        />
      ) : null}
      {status === 'gameOver' ? (
        <GameOverOverlay onRestart={startNewGame} onMenu={exitToMenu} />
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
  meta: { width: MIN_TOUCH + 28, alignItems: 'flex-end' },
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

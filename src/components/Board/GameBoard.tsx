import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BOARD_WIDTH, HIDDEN_ROWS, LINE_CLEAR_MS, VISIBLE_ROWS } from '../../game/constants';
import { getVisibleRowSignatures } from '../../game/selectors';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { lighten, withAlpha } from '../../theme/colorUtils';
import type { Theme } from '../../theme/themes';
import { useTheme } from '../../theme/useTheme';
import { Chamfer, CornerBrackets } from '../ui/Chamfer';
import { Cell } from './Cell';
import { ClearCallout } from './ClearCallout';

/** Space between the grid and the outside of the frame, on each side. */
export const BOARD_FRAME = 7;
const GLOW_WIDTH = 6;

/** A faint band that sweeps down the well every few seconds, like a CRT refresh. */
const ScanBar = ({ height, color }: { height: number; color: string }) => {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(-1);
  const band = Math.max(60, height * 0.2);
  useEffect(() => {
    if (reduceMotion) return;
    y.set(withRepeat(withDelay(1800, withTiming(1, { duration: 3600 })), -1));
  }, [reduceMotion, y]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(y.value, [-1, 1], [-band, height]) }],
  }));
  if (reduceMotion) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.scanBar, { height: band }, style]}>
      <LinearGradient
        colors={['transparent', withAlpha(color, 0.12), 'transparent']}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

/** Bright band that sweeps a cleared row away. */
const ClearFlash = ({ color }: { color: string }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withTiming(1, { duration: LINE_CLEAR_MS }));
  }, [progress]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25, 1], [0.3, 0.95, 0.7]),
    transform: [{ scaleX: interpolate(progress.value, [0, 0.35, 1], [1, 1, 0]) }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.flash, { backgroundColor: color }, style]} />
  );
};

interface RowProps {
  signature: string;
  cellSize: number;
  flashing: boolean;
  theme: Theme;
}

/** Memoised on the row's string signature, so unchanged rows skip rendering entirely. */
const Row = memo(({ signature, cellSize, flashing, theme }: RowProps) => (
  <View style={styles.row}>
    {Array.from(signature, (glyph, x) => (
      <Cell key={x} glyph={glyph} size={cellSize} theme={theme} />
    ))}
    {flashing ? <ClearFlash color={lighten(theme.colors.primary, 0.75)} /> : null}
  </View>
));
Row.displayName = 'Row';

interface Props {
  cellSize: number;
}

export const GameBoard = ({ cellSize }: Props) => {
  const theme = useTheme();
  const board = useGameStore((store) => store.game.board);
  const active = useGameStore((store) => store.game.active);
  const clearingRows = useGameStore((store) => store.game.clearing?.rows ?? null);
  const ghostEnabled = useSettingsStore((store) => store.settings.ghostEnabled);

  const rows = useMemo(
    () => getVisibleRowSignatures(board, active, ghostEnabled),
    [board, active, ghostEnabled],
  );
  const flashing = useMemo(
    () => new Set((clearingRows ?? []).map((y) => y - HIDDEN_ROWS)),
    [clearingRows],
  );

  // A short downward jolt on hard drop.
  const jolt = useSharedValue(0);
  useEffect(
    () =>
      useGameStore.subscribe((store, previous) => {
        if (store.game.events === previous.game.events) return;
        if (!store.game.events.some((event) => event.type === 'hardDrop')) return;
        jolt.set(
          withSequence(
            withTiming(Math.max(2, cellSize * 0.18), { duration: 45 }),
            withTiming(0, { duration: 160 }),
          ),
        );
      }),
    [cellSize, jolt],
  );
  const joltStyle = useAnimatedStyle(() => ({ transform: [{ translateY: jolt.value }] }));

  const gridWidth = cellSize * BOARD_WIDTH;
  const gridHeight = cellSize * VISIBLE_ROWS;
  const { colors } = theme;

  return (
    <Animated.View
      style={[
        { width: gridWidth + BOARD_FRAME * 2, height: gridHeight + BOARD_FRAME * 2 },
        joltStyle,
      ]}
      accessibilityLabel="Game board"
    >
      {/* Soft outer glow ring, then the frame itself. */}
      <Chamfer
        cut={18}
        stroke={withAlpha(colors.primary, 0.14)}
        strokeWidth={GLOW_WIDTH}
        style={StyleSheet.absoluteFill}
      />
      <Chamfer
        cut={16}
        fill={withAlpha(colors.well, 0.94)}
        stroke={colors.line}
        strokeWidth={1.5}
        style={[styles.frame, { padding: BOARD_FRAME }]}
      >
        <View style={[styles.grid, { width: gridWidth, height: gridHeight }]}>
          {rows.map((signature, y) => (
            <Row
              key={y}
              signature={signature}
              cellSize={cellSize}
              flashing={flashing.has(y)}
              theme={theme}
            />
          ))}
          <ScanBar height={gridHeight} color={colors.primary} />
        </View>
      </Chamfer>
      <CornerBrackets color={colors.primary} size={16} thickness={2} inset={-3} />
      <ClearCallout />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  frame: { flex: 1 },
  grid: { overflow: 'hidden' },
  scanBar: { position: 'absolute', left: 0, right: 0, top: 0 },
  row: {
    flexDirection: 'row',
  },
  flash: { ...StyleSheet.absoluteFill },
});

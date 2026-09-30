import { StyleSheet, View } from 'react-native';

import type { PieceType } from '../../game/types';
import type { Theme } from '../../theme/themes';
import { Block } from '../Board/Cell';

/** Same composition as the app icon (see tools/generate-assets.js): a T dropping into a slot. */
const MARK: { type: PieceType; x: number; y: number }[] = [
  { type: 'T', x: 1, y: 0 },
  { type: 'T', x: 2, y: 0 },
  { type: 'T', x: 3, y: 0 },
  { type: 'T', x: 2, y: 1 },
  { type: 'I', x: 0, y: 2 },
  { type: 'I', x: 1, y: 2 },
  { type: 'I', x: 0, y: 3 },
  { type: 'I', x: 1, y: 3 },
  { type: 'O', x: 3, y: 2 },
  { type: 'O', x: 4, y: 2 },
  { type: 'O', x: 3, y: 3 },
  { type: 'O', x: 4, y: 3 },
  { type: 'L', x: 2, y: 3 },
];

export const Logo = ({ cellSize = 22, theme }: { cellSize?: number; theme: Theme }) => (
  <View style={{ width: cellSize * 5, height: cellSize * 4 }}>
    {MARK.map(({ type, x, y }) => (
      <View key={`${x}-${y}`} style={[styles.cell, { left: x * cellSize, top: y * cellSize }]}>
        <Block type={type} size={cellSize} theme={theme} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  cell: { position: 'absolute' },
});

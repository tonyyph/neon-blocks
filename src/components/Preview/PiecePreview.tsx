import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { getPieceOffsets } from '../../game/pieces';
import type { PieceType } from '../../game/types';
import type { Theme } from '../../theme/themes';
import { Block } from '../Board/Cell';

interface Props {
  type: PieceType | null;
  cellSize: number;
  theme: Theme;
  dimmed?: boolean;
}

/** Every piece fits a 4 x 2 box in its spawn orientation. */
export const PREVIEW_BOX_W = 4;
export const PREVIEW_BOX_H = 2;

/** A piece in spawn orientation, trimmed to its blocks and centred in a fixed 4 x 2 box. */
export const PiecePreview = memo(({ type, cellSize, theme, dimmed = false }: Props) => {
  const box = { width: cellSize * PREVIEW_BOX_W, height: cellSize * PREVIEW_BOX_H };
  if (!type) return <View style={box} />;

  const cells = getPieceOffsets(type, 0);
  const minX = Math.min(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  const width = Math.max(...cells.map((c) => c.x)) - minX + 1;
  const height = Math.max(...cells.map((c) => c.y)) - minY + 1;
  const offsetX = ((PREVIEW_BOX_W - width) * cellSize) / 2;
  const offsetY = ((PREVIEW_BOX_H - height) * cellSize) / 2;

  return (
    <View style={[box, dimmed && styles.dimmed]}>
      {cells.map(({ x, y }) => (
        <View
          key={`${x}-${y}`}
          style={[
            styles.cell,
            { left: offsetX + (x - minX) * cellSize, top: offsetY + (y - minY) * cellSize },
          ]}
        >
          <Block type={type} size={cellSize} theme={theme} />
        </View>
      ))}
    </View>
  );
});
PiecePreview.displayName = 'PiecePreview';

const styles = StyleSheet.create({
  cell: { position: 'absolute' },
  dimmed: { opacity: 0.3 },
});

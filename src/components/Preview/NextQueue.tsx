import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { selectNextPieces } from '../../game/selectors';
import { useGameStore } from '../../store/gameStore';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Panel } from '../ui/Panel';
import { PiecePreview } from './PiecePreview';

interface Props {
  cellSize: number;
}

/** Upcoming pieces in a row, the next one full size and the rest smaller. */
export const NextQueue = ({ cellSize }: Props) => {
  const theme = useTheme();
  const next = useGameStore(useShallow((store) => selectNextPieces(store.game)));
  return (
    <Panel label="Next" style={styles.panel}>
      <View style={styles.list}>
        {next.map((type, index) => (
          <PiecePreview
            // Position, not piece type, identifies a slot: the same type can appear twice.
            key={index}
            type={type}
            theme={theme}
            cellSize={index === 0 ? cellSize : Math.round(cellSize * 0.72)}
          />
        ))}
      </View>
    </Panel>
  );
};

const styles = StyleSheet.create({
  panel: { flex: 1 },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

import { useGameStore } from '../../store/gameStore';
import { useT } from '../../i18n';
import { useTheme } from '../../theme/useTheme';
import { Panel } from '../ui/Panel';
import { PiecePreview } from './PiecePreview';

interface Props {
  cellSize: number;
}

export const HoldPiece = ({ cellSize }: Props) => {
  const theme = useTheme();
  const t = useT();
  const hold = useGameStore((store) => store.game.hold);
  const canHold = useGameStore((store) => store.game.canHold);
  return (
    <Panel label={t.common.hold}>
      <PiecePreview type={hold} cellSize={cellSize} theme={theme} dimmed={!canHold} />
    </Panel>
  );
};

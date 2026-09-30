import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

/** Fixed-width readout: leading zeros stay dim so the live digits read first. */
export const Readout = ({
  value,
  digits,
  variant,
  color,
}: {
  value: number;
  digits: number;
  variant: 'score' | 'stat';
  color: string;
}) => {
  const { colors } = useTheme();
  const text = String(value);
  const padding = '0'.repeat(Math.max(0, digits - text.length));
  return (
    <Text variant={variant} color={color}>
      <Text variant={variant} color={colors.textFaint}>
        {padding}
      </Text>
      {text}
    </Text>
  );
};

import { StyleSheet, View } from 'react-native';

import { haptics } from '../../hooks/useHaptics';
import { withAlpha } from '../../theme/colorUtils';
import { MIN_TOUCH, spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Chamfer } from './Chamfer';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
}

export const Button = ({ label, onPress, variant = 'secondary', icon }: Props) => {
  const { colors } = useTheme();
  const look = {
    primary: { fill: colors.primary, stroke: colors.primary, text: colors.onPrimary },
    secondary: {
      fill: withAlpha(colors.surfaceRaised, 0.9),
      stroke: colors.line,
      text: colors.text,
    },
    danger: { fill: withAlpha(colors.danger, 0.08), stroke: colors.danger, text: colors.danger },
  }[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
    >
      <Chamfer
        cut={14}
        fill={look.fill}
        stroke={look.stroke}
        strokeWidth={1.5}
        style={styles.button}
      >
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={20} color={look.text} /> : null}
          {/* One line always: wide display faces (Playfair SC, Cinzel) shrink a little instead. */}
          <Text
            variant="heading"
            color={look.text}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={styles.label}
          >
            {label}
          </Text>
        </View>
      </Chamfer>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH + 8,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  label: { flexShrink: 1 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});

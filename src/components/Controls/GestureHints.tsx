import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from '../ui/Icon';
import { Text } from '../ui/Text';

const HINTS: { icon: IconName; label: string }[] = [
  { icon: 'gesture-swipe-horizontal', label: 'Move' },
  { icon: 'gesture-tap', label: 'Rotate' },
  { icon: 'gesture-swipe-down', label: 'Drop' },
  { icon: 'gesture-swipe-up', label: 'Hold' },
];

/** A quiet legend under the board so the gesture controls stay discoverable. */
export const GestureHints = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.row} pointerEvents="none">
      {HINTS.map(({ icon, label }) => (
        <View key={label} style={styles.hint}>
          <Icon name={icon} size={16} color={colors.textFaint} />
          <Text variant="caption" color={colors.textFaint}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.sm,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

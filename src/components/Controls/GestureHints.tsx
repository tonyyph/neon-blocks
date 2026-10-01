import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme/spacing';
import { useT } from '../../i18n';
import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from '../ui/Icon';
import { Text } from '../ui/Text';

const HINTS: { icon: IconName; key: 'move' | 'rotate' | 'drop' | 'hold' }[] = [
  { icon: 'gesture-swipe-horizontal', key: 'move' },
  { icon: 'gesture-tap', key: 'rotate' },
  { icon: 'gesture-swipe-down', key: 'drop' },
  { icon: 'gesture-swipe-up', key: 'hold' },
];

/** A quiet legend under the board so the gesture controls stay discoverable. */
export const GestureHints = () => {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View style={styles.row} pointerEvents="none">
      {HINTS.map(({ icon, key }) => (
        <View key={key} style={styles.hint}>
          <Icon name={icon} size={16} color={colors.textFaint} />
          <Text variant="caption" color={colors.textFaint}>
            {t.game.gestures[key]}
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

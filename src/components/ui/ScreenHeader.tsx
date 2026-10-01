import { StyleSheet, View } from 'react-native';

import { MIN_TOUCH, spacing } from '../../theme/spacing';
import { useT } from '../../i18n';
import { useTheme } from '../../theme/useTheme';
import { Chamfer } from './Chamfer';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface Props {
  title: string;
  onBack: () => void;
}

export const ScreenHeader = ({ title, onBack }: Props) => {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t.common.back}
        onPress={onBack}
        hitSlop={8}
      >
        <Chamfer cut={8} fill={colors.surface} stroke={colors.line} style={styles.back}>
          <Icon name="chevron-left" size={28} color={colors.primary} />
        </Chamfer>
      </PressableScale>
      <Text variant="title">{title}</Text>
      <View style={styles.back} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

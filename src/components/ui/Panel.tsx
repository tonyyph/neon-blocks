import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { withAlpha } from '../../theme/colorUtils';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Chamfer } from './Chamfer';
import { Text } from './Text';

interface Props {
  label?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export const Panel = ({ label, style, children }: Props) => {
  const { colors } = useTheme();
  return (
    <Chamfer
      cut={8}
      fill={withAlpha(colors.surface, 0.92)}
      stroke={colors.line}
      style={[styles.panel, style]}
    >
      {label ? (
        <Text variant="label" color={colors.textDim} style={styles.label}>
          {label}
        </Text>
      ) : null}
      {children}
    </Chamfer>
  );
};

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  label: { marginBottom: 2 },
});

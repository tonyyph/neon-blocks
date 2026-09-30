import { Text as RNText, type TextProps } from 'react-native';

import { type TypographyVariant, getTextStyle } from '../../theme/typography';
import { useTheme } from '../../theme/useTheme';

interface Props extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

export const Text = ({ variant = 'body', color, style, ...rest }: Props) => {
  const theme = useTheme();
  return (
    <RNText
      allowFontScaling={false}
      style={[getTextStyle(variant, theme), { color: color ?? theme.colors.text }, style]}
      {...rest}
    />
  );
};

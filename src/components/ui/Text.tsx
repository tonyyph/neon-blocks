import { Children, type ReactNode } from 'react';
import { Text as RNText, type TextProps } from 'react-native';

import { type TypographyVariant, getTextStyle } from '../../theme/typography';
import { useTheme } from '../../theme/useTheme';

interface Props extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

/** The plain text inside `children`, so the font can be chosen for the letters it contains. */
const plainText = (children: ReactNode): string =>
  Children.toArray(children)
    .filter((child) => typeof child === 'string' || typeof child === 'number')
    .join('');

export const Text = ({ variant = 'body', color, style, children, ...rest }: Props) => {
  const theme = useTheme();
  return (
    <RNText
      allowFontScaling={false}
      style={[
        getTextStyle(variant, theme, plainText(children)),
        { color: color ?? theme.colors.text },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

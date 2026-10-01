import { type ReactNode, useState } from 'react';
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { PanelShape } from '../../theme/themes';
import { useTheme } from '../../theme/useTheme';

/**
 * SVG outline for a panel in the theme's shape. `size` is the shape's characteristic measure: the
 * corner cut, the corner radius, the notch, or the arch radius.
 */
export const panelPath = (
  shape: PanelShape,
  width: number,
  height: number,
  size: number,
  stroke: number,
): string => {
  const i = stroke / 2;
  const w = width - i;
  const h = height - i;
  switch (shape) {
    case 'square':
      return `M${i},${i} H${w} V${h} H${i} Z`;
    case 'round': {
      const r = Math.min(size * 1.2, (width - stroke) / 2, (height - stroke) / 2);
      return `M${i + r},${i} H${w - r} A${r},${r} 0 0 1 ${w},${i + r} V${h - r} A${r},${r} 0 0 1 ${w - r},${h} H${i + r} A${r},${r} 0 0 1 ${i},${h - r} V${i + r} A${r},${r} 0 0 1 ${i + r},${i} Z`;
    }
    case 'notch': {
      // Square notches bitten out of each corner, like the corners of a lacquer box lid.
      const n = Math.min(size * 0.6, width / 4, height / 4);
      return `M${i + n},${i} H${w - n} V${i + n} H${w} V${h - n} H${w - n} V${h} H${i + n} V${h - n} H${i} V${i + n} H${i + n} Z`;
    }
    case 'arch': {
      // A window: rounded shoulders on top, square sill below.
      const r = Math.min(size * 1.6, (width - stroke) / 2, (height - stroke) / 2);
      return `M${i},${h} V${i + r} A${r},${r} 0 0 1 ${i + r},${i} H${w - r} A${r},${r} 0 0 1 ${w},${i + r} V${h} Z`;
    }
    default: {
      const c = Math.min(size, width / 2, height / 2);
      return `M${c + i},${i} H${w} V${h - c} L${w - c},${h} H${i} V${c + i} Z`;
    }
  }
};

interface Props {
  /** The shape's size: corner cut, radius, notch or arch, depending on the theme's shape. */
  cut?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Overrides the active theme's shape, e.g. for a theme preview card. */
  shape?: PanelShape;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * A panel outline in the active theme's shape: cut corners for the cyberpunk themes, drafting
 * squares, candy rounds, lacquer-box notches or gothic arches for the others.
 */
export const Chamfer = ({
  cut = 10,
  fill = 'transparent',
  stroke,
  strokeWidth = 1,
  shape,
  style,
  children,
}: Props) => {
  const theme = useTheme();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((previous) =>
      previous && previous.width === width && previous.height === height
        ? previous
        : { width, height },
    );
  };

  return (
    <View style={style} onLayout={onLayout}>
      {size ? (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={size.width}
          height={size.height}
        >
          <Path
            d={panelPath(
              shape ?? theme.shape,
              size.width,
              size.height,
              cut,
              stroke ? strokeWidth : 0,
            )}
            fill={fill}
            stroke={stroke}
            strokeWidth={stroke ? strokeWidth : 0}
          />
        </Svg>
      ) : null}
      {children}
    </View>
  );
};

interface BracketProps {
  color: string;
  size?: number;
  thickness?: number;
  inset?: number;
}

/** HUD targeting brackets on the four corners of the parent, for themes that use them. */
export const CornerBrackets = ({ color, size = 14, thickness = 2, inset = 0 }: BracketProps) => {
  const theme = useTheme();
  if (!theme.brackets) return null;
  const base = { position: 'absolute' as const, width: size, height: size, borderColor: color };
  return (
    <>
      <View
        pointerEvents="none"
        style={[
          base,
          { top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          base,
          { top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          base,
          { bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          base,
          {
            bottom: inset,
            right: inset,
            borderBottomWidth: thickness,
            borderRightWidth: thickness,
          },
        ]}
      />
    </>
  );
};

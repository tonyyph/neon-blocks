import { type ReactNode, useState } from 'react';
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * Outline with the top-left and bottom-right corners cut off. The cut corner is the shape the
 * whole UI is built from, in place of rounded rectangles.
 */
export const chamferPath = (width: number, height: number, cut: number, stroke: number): string => {
  const i = stroke / 2;
  const c = Math.min(cut, width / 2, height / 2);
  return `M${c + i},${i} H${width - i} V${height - c - i} L${width - c - i},${height - i} H${i} V${c + i} Z`;
};

interface Props {
  cut?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const Chamfer = ({
  cut = 10,
  fill = 'transparent',
  stroke,
  strokeWidth = 1,
  style,
  children,
}: Props) => {
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
            d={chamferPath(size.width, size.height, cut, stroke ? strokeWidth : 0)}
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

/** HUD targeting brackets on the four corners of the parent. */
export const CornerBrackets = ({ color, size = 14, thickness = 2, inset = 0 }: BracketProps) => {
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

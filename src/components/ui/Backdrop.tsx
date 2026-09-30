import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Path,
  Pattern,
  Rect,
  Stop,
} from 'react-native-svg';

import { withAlpha } from '../../theme/colorUtils';
import type { Theme } from '../../theme/themes';
import { useTheme } from '../../theme/useTheme';
import { createRandom } from '../../utils/random';

export type BackdropIntensity = 'full' | 'dim';

interface ArtProps {
  theme: Theme;
  width: number;
  height: number;
  intensity: BackdropIntensity;
}

/** Circuit traces: a run, a 45° jog, a run, ending in a pad. Seeded so it never reshuffles. */
const CircuitArt = ({ theme, width, height, intensity }: ArtProps) => {
  const traces = useMemo(() => {
    const random = createRandom(7);
    return Array.from({ length: 16 }, () => {
      const x = random.next() * width;
      const y = random.next() * height;
      const run = 30 + random.next() * 90;
      const jog = (random.next() > 0.5 ? 1 : -1) * (14 + random.next() * 30);
      const tail = 20 + random.next() * 60;
      const x2 = x + run;
      const x3 = x2 + Math.abs(jog);
      const y3 = y + jog;
      return { d: `M${x},${y} H${x2} L${x3},${y3} H${x3 + tail}`, pad: [x3 + tail, y3] as const };
    });
  }, [width, height]);
  const stroke = withAlpha(theme.colors.primary, intensity === 'full' ? 0.16 : 0.08);
  return (
    <>
      {traces.map(({ d }, i) => (
        <Path key={`t${i}`} d={d} stroke={stroke} strokeWidth={1.2} fill="none" />
      ))}
      {traces.map(({ pad }, i) => (
        <Circle key={`p${i}`} cx={pad[0]} cy={pad[1]} r={2.6} fill={stroke} />
      ))}
    </>
  );
};

/** Thin slanted streaks, like rain lit by signs. */
const RainArt = ({ theme, width, height, intensity }: ArtProps) => {
  const drops = useMemo(() => {
    const random = createRandom(11);
    return Array.from({ length: 70 }, () => {
      const length = 18 + random.next() * 60;
      const x = random.next() * width;
      const y = random.next() * height;
      return { x, y, length, warm: random.next() > 0.7 };
    });
  }, [width, height]);
  const alpha = intensity === 'full' ? 0.22 : 0.1;
  return (
    <>
      {drops.map(({ x, y, length, warm }, i) => (
        <Line
          key={i}
          x1={x}
          y1={y}
          x2={x - length * 0.18}
          y2={y + length}
          stroke={withAlpha(warm ? theme.colors.primary : theme.colors.secondary, alpha)}
          strokeWidth={1}
        />
      ))}
    </>
  );
};

/** A striped sun sinking into a perspective grid. */
const HorizonArt = ({ theme, width, height, intensity }: ArtProps) => {
  const horizon = height * (intensity === 'full' ? 0.5 : 0.62);
  const sunR = width * 0.32;
  const sunY = horizon - sunR * 0.35;
  const gridAlpha = intensity === 'full' ? 0.45 : 0.2;
  const grid = withAlpha(theme.colors.primary, gridAlpha);

  const horizontals = Array.from(
    { length: 12 },
    (_, i) => horizon + ((i + 1) ** 2 / 144) * (height - horizon),
  );
  const verticals = Array.from({ length: 17 }, (_, i) => (i - 8) / 8);

  return (
    <>
      <Defs>
        <SvgGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.colors.secondary} stopOpacity={1} />
          <Stop offset="1" stopColor={theme.colors.primary} stopOpacity={1} />
        </SvgGradient>
      </Defs>
      <Circle
        cx={width / 2}
        cy={sunY}
        r={sunR}
        fill="url(#sun)"
        opacity={intensity === 'full' ? 0.85 : 0.22}
      />
      {Array.from({ length: 6 }, (_, i) => (
        <Rect
          key={`band${i}`}
          x={0}
          y={sunY + i * sunR * 0.12}
          width={width}
          height={2 + i * 1.6}
          fill={theme.colors.background}
        />
      ))}
      <Rect
        x={0}
        y={horizon}
        width={width}
        height={height - horizon}
        fill={theme.colors.background}
      />
      {horizontals.map((y, i) => (
        <Line key={`h${i}`} x1={0} y1={y} x2={width} y2={y} stroke={grid} strokeWidth={1} />
      ))}
      {verticals.map((t, i) => (
        <Line
          key={`v${i}`}
          x1={width / 2 + t * width * 0.08}
          y1={horizon}
          x2={width / 2 + t * width * 1.6}
          y2={height}
          stroke={grid}
          strokeWidth={1}
        />
      ))}
    </>
  );
};

const ART = { circuit: CircuitArt, rain: RainArt, horizon: HorizonArt } as const;

/** Themed gradient plus static art. Drawn once per theme and screen size; no animation. */
export const Backdrop = memo(({ intensity = 'full' }: { intensity?: BackdropIntensity }) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const Art = theme.backdrop === 'none' ? null : ART[theme.backdrop];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundAlt]}
        style={StyleSheet.absoluteFill}
      />
      {Art ? (
        <Svg width={width} height={height}>
          <Art theme={theme} width={width} height={height} intensity={intensity} />
        </Svg>
      ) : null}
    </View>
  );
});
Backdrop.displayName = 'Backdrop';

/** CRT scanlines laid over everything. Strength comes from the theme; 0 disables it. */
export const Scanlines = memo(() => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  if (theme.scanlines <= 0) return null;
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <Pattern id="scan" patternUnits="userSpaceOnUse" width={4} height={3}>
          <Rect x={0} y={0} width={4} height={1} fill="#000000" />
        </Pattern>
      </Defs>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#scan)"
        opacity={theme.scanlines * 5}
      />
    </Svg>
  );
});
Scanlines.displayName = 'Scanlines';

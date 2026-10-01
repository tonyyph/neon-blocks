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

/** Drafting film: fine and major grid lines plus a few compass circles. */
const GraphArt = ({ theme, width, height, intensity }: ArtProps) => {
  const alpha = intensity === 'full' ? 1 : 0.6;
  const minor = withAlpha(theme.colors.text, 0.06 * alpha);
  const major = withAlpha(theme.colors.text, 0.13 * alpha);
  const circles = useMemo(() => {
    const random = createRandom(5);
    return Array.from({ length: 4 }, () => ({
      cx: random.next() * width,
      cy: random.next() * height,
      r: 40 + random.next() * 90,
    }));
  }, [width, height]);
  return (
    <>
      <Defs>
        <Pattern id="minor" patternUnits="userSpaceOnUse" width={16} height={16}>
          <Path d="M16 0 H0 V16" fill="none" stroke={minor} strokeWidth={1} />
        </Pattern>
        <Pattern id="major" patternUnits="userSpaceOnUse" width={80} height={80}>
          <Path d="M80 0 H0 V80" fill="none" stroke={major} strokeWidth={1.2} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#minor)" />
      <Rect x={0} y={0} width={width} height={height} fill="url(#major)" />
      {circles.map(({ cx, cy, r }, i) => (
        <Circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={withAlpha(theme.colors.secondary, 0.16 * alpha)}
          strokeDasharray="6 5"
        />
      ))}
    </>
  );
};

/** Polka dots in two colours. */
const DotsArt = ({ theme, width, height, intensity }: ArtProps) => {
  const alpha = intensity === 'full' ? 0.14 : 0.08;
  return (
    <>
      <Defs>
        <Pattern id="dots" patternUnits="userSpaceOnUse" width={36} height={36}>
          <Circle cx={9} cy={9} r={5} fill={withAlpha(theme.colors.primary, alpha)} />
          <Circle cx={27} cy={27} r={5} fill={withAlpha(theme.colors.secondary, alpha)} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#dots)" />
    </>
  );
};

/** Seigaiha: rows of overlapping concentric waves, traced in gold. */
const WavesArt = ({ theme, width, height, intensity }: ArtProps) => {
  const stroke = withAlpha(theme.colors.primary, intensity === 'full' ? 0.12 : 0.07);
  const arcs = (cx: number, cy: number) =>
    [24, 17, 10].map((r) => (
      <Circle key={`${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} fill="none" stroke={stroke} />
    ));
  return (
    <>
      <Defs>
        <Pattern id="waves" patternUnits="userSpaceOnUse" width={48} height={24}>
          {arcs(24, 24)}
          {arcs(0, 12)}
          {arcs(48, 12)}
        </Pattern>
      </Defs>
      <Rect x={0} y={height * 0.45} width={width} height={height * 0.55} fill="url(#waves)" />
    </>
  );
};

/** A rose window: rings, spokes and a crown of petals. */
const RoseArt = ({ theme, width, height, intensity }: ArtProps) => {
  const cx = width / 2;
  const cy = height * (intensity === 'full' ? 0.27 : 0.2);
  const r = width * 0.44;
  const lead = withAlpha(theme.colors.primary, intensity === 'full' ? 0.22 : 0.1);
  const glass = intensity === 'full' ? 0.1 : 0.05;
  const hues = [
    theme.colors.secondary,
    theme.colors.danger,
    theme.colors.success,
    theme.colors.primary,
  ];
  const spokes = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  return (
    <>
      {spokes.map((angle, i) => (
        <Circle
          key={`petal${i}`}
          cx={cx + Math.cos(angle) * r * 0.62}
          cy={cy + Math.sin(angle) * r * 0.62}
          r={r * 0.2}
          fill={withAlpha(hues[i % hues.length], glass)}
          stroke={lead}
        />
      ))}
      {[1, 0.38, 0.16].map((k) => (
        <Circle
          key={`ring${k}`}
          cx={cx}
          cy={cy}
          r={r * k}
          fill="none"
          stroke={lead}
          strokeWidth={1.5}
        />
      ))}
      {spokes.map((angle, i) => (
        <Line
          key={`spoke${i}`}
          x1={cx + Math.cos(angle) * r * 0.16}
          y1={cy + Math.sin(angle) * r * 0.16}
          x2={cx + Math.cos(angle) * r}
          y2={cy + Math.sin(angle) * r}
          stroke={lead}
        />
      ))}
    </>
  );
};

const ART = {
  circuit: CircuitArt,
  rain: RainArt,
  horizon: HorizonArt,
  graph: GraphArt,
  dots: DotsArt,
  waves: WavesArt,
  rose: RoseArt,
} as const;

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

/**
 * Scales each theme's scanline value into overlay opacity. Kept low enough that the lines read as
 * texture on dark areas rather than stripes across bright buttons and toggles.
 */
const SCANLINE_STRENGTH = 3;

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
        opacity={theme.scanlines * SCANLINE_STRENGTH}
      />
    </Svg>
  );
});
Scanlines.displayName = 'Scanlines';

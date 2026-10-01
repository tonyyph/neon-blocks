import type { PieceType } from '../game/types';
import { darken, lighten, mix, withAlpha } from './colorUtils';
import type { FontFamily } from './fonts';

export type ThemeId =
  | 'nightCity'
  | 'neonRain'
  | 'outrun'
  | 'amberTerminal'
  | 'blueprint'
  | 'sugarRush'
  | 'kintsugi'
  | 'cathedral';

/** How a single block is drawn. Each theme owns one, so themes differ in shape, not just colour. */
export type BlockStyle =
  'tube' | 'gloss' | 'bevel' | 'chip' | 'blueprint' | 'jelly' | 'lacquer' | 'glass';

/** Static art behind the UI. */
export type Backdrop =
  'circuit' | 'rain' | 'horizon' | 'none' | 'graph' | 'dots' | 'waves' | 'rose';

/**
 * Outline of every panel, button and the board frame: cut corners (cyberpunk), sharp drafting
 * squares, soft candy rounds, notched lacquer-box corners, or an arched window top.
 */
export type PanelShape = 'chamfer' | 'square' | 'round' | 'notch' | 'arch';

/** How big titles are dressed: RGB-split glitch, a solid offset "sticker" shadow, or nothing. */
export type TitleEffect = 'glitch' | 'pop' | 'plain';

export interface PieceShades {
  fill: string;
  light: string;
  dark: string;
  /** Translucent fill used by hollow styles and the ghost. */
  tint: string;
}

interface ThemeSpec {
  id: ThemeId;
  /** Section the theme is listed under in the picker. */
  collection: 'Cyberpunk' | 'Crafted';
  shape: PanelShape;
  titleEffect: TitleEffect;
  /** The CRT refresh band that sweeps the well. */
  scanBar: boolean;
  /** HUD corner brackets around the board and dialogs. */
  brackets: boolean;
  /** Status bar text colour: light on dark themes, dark on light ones. */
  statusBar: 'light' | 'dark';
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceRaised: string;
    well: string;
    grid: string;
    line: string;
    text: string;
    textDim: string;
    textFaint: string;
    primary: string;
    secondary: string;
    danger: string;
    success: string;
    onPrimary: string;
    scrim: string;
  };
  pieces: Record<PieceType, string>;
  blockStyle: BlockStyle;
  backdrop: Backdrop;
  /** Opacity of the CRT scanline overlay; 0 turns it off. */
  scanlines: number;
  fonts: {
    display: FontFamily;
    heading: FontFamily;
    body: FontFamily;
    label: FontFamily;
    number: FontFamily;
  };
}

/** Everything a block can be drawn as: a piece, Dig garbage, or a banked Zone line. */
export type BlockKind = PieceType | 'G' | 'X';

export interface Theme extends ThemeSpec {
  shades: Record<BlockKind, PieceShades>;
}

const CYBER_FONTS: ThemeSpec['fonts'] = {
  display: 'Orbitron_900Black',
  heading: 'ChakraPetch_700Bold',
  body: 'ChakraPetch_500Medium',
  label: 'ChakraPetch_600SemiBold',
  number: 'Orbitron_700Bold',
};

const CYBER_LOOK = {
  collection: 'Cyberpunk',
  shape: 'chamfer',
  titleEffect: 'glitch',
  scanBar: true,
  brackets: true,
  statusBar: 'light',
} as const;

const SPECS: ThemeSpec[] = [
  {
    id: 'nightCity',
    ...CYBER_LOOK,
    colors: {
      background: '#050508',
      backgroundAlt: '#16060C',
      surface: '#0E0E15',
      surfaceRaised: '#181822',
      well: '#07070B',
      grid: 'rgba(252,238,10,0.07)',
      line: 'rgba(252,238,10,0.32)',
      text: '#EDEDF2',
      textDim: '#9D9DB0',
      textFaint: '#5E5E70',
      primary: '#FCEE0A',
      secondary: '#00F0FF',
      danger: '#FF003C',
      success: '#00FF9F',
      onPrimary: '#050508',
      scrim: 'rgba(5,5,8,0.86)',
    },
    pieces: {
      I: '#00F0FF',
      O: '#FCEE0A',
      T: '#D21CFF',
      S: '#39FF88',
      Z: '#FF1F4B',
      J: '#3D7BFF',
      L: '#FF8A00',
    },
    blockStyle: 'tube',
    backdrop: 'circuit',
    scanlines: 0.06,
    fonts: CYBER_FONTS,
  },
  {
    id: 'neonRain',
    ...CYBER_LOOK,
    colors: {
      background: '#0A0620',
      backgroundAlt: '#1E0B3F',
      surface: '#140C30',
      surfaceRaised: '#211647',
      well: '#07041A',
      grid: 'rgba(45,226,230,0.08)',
      line: 'rgba(255,43,214,0.4)',
      text: '#F3EAFF',
      textDim: '#AC9FCC',
      textFaint: '#6B5F8C',
      primary: '#FF2BD6',
      secondary: '#2DE2E6',
      danger: '#FF4D6D',
      success: '#5CFFB0',
      onPrimary: '#0A0620',
      scrim: 'rgba(10,6,32,0.86)',
    },
    pieces: {
      I: '#2DE2E6',
      O: '#FFD84D',
      T: '#B967FF',
      S: '#4DFFB5',
      Z: '#FF2BD6',
      J: '#4D7CFF',
      L: '#FF8C42',
    },
    blockStyle: 'gloss',
    backdrop: 'rain',
    scanlines: 0.04,
    fonts: CYBER_FONTS,
  },
  {
    id: 'outrun',
    ...CYBER_LOOK,
    colors: {
      background: '#1A0933',
      backgroundAlt: '#4A0D4E',
      surface: '#240E40',
      surfaceRaised: '#321656',
      well: '#12061F',
      grid: 'rgba(255,106,213,0.1)',
      line: 'rgba(255,158,61,0.5)',
      text: '#FFF1F8',
      textDim: '#CBA6DB',
      textFaint: '#835F96',
      primary: '#FF6AD5',
      secondary: '#FF9E3D',
      danger: '#FF4F6E',
      success: '#6BFFD6',
      onPrimary: '#1A0933',
      scrim: 'rgba(26,9,51,0.86)',
    },
    pieces: {
      I: '#3DE8FF',
      O: '#FFE14D',
      T: '#C77DFF',
      S: '#6BFFB8',
      Z: '#FF4F8B',
      J: '#6C7BFF',
      L: '#FF9E3D',
    },
    blockStyle: 'bevel',
    backdrop: 'horizon',
    scanlines: 0.03,
    fonts: CYBER_FONTS,
  },
  {
    id: 'amberTerminal',
    ...CYBER_LOOK,
    colors: {
      background: '#0B0703',
      backgroundAlt: '#1A0F04',
      surface: '#140C05',
      surfaceRaised: '#1E1309',
      well: '#080502',
      grid: 'rgba(255,176,0,0.08)',
      line: 'rgba(255,176,0,0.38)',
      text: '#FFD58A',
      textDim: '#C48D3A',
      textFaint: '#7C5622',
      primary: '#FFB000',
      secondary: '#FFE7B3',
      danger: '#FF5A36',
      success: '#D6FF5C',
      onPrimary: '#0B0703',
      scrim: 'rgba(11,7,3,0.88)',
    },
    pieces: {
      I: '#FFE7B3',
      O: '#FFD000',
      T: '#FF6A00',
      S: '#C8E03A',
      Z: '#FF3B24',
      J: '#8FD3C1',
      L: '#D9A066',
    },
    blockStyle: 'chip',
    backdrop: 'none',
    scanlines: 0.1,
    fonts: {
      display: 'ShareTechMono_400Regular',
      heading: 'ShareTechMono_400Regular',
      body: 'ShareTechMono_400Regular',
      label: 'ShareTechMono_400Regular',
      number: 'ShareTechMono_400Regular',
    },
  },
  {
    id: 'blueprint',
    collection: 'Crafted',
    shape: 'square',
    titleEffect: 'plain',
    scanBar: false,
    brackets: true,
    statusBar: 'light',
    colors: {
      background: '#123E70',
      backgroundAlt: '#0C2F58',
      surface: '#174679',
      surfaceRaised: '#1E558F',
      well: '#0E3561',
      grid: 'rgba(255,255,255,0.1)',
      line: 'rgba(230,240,255,0.55)',
      text: '#F4F8FF',
      textDim: '#C3D6F0',
      textFaint: '#86A5CF',
      primary: '#FFFFFF',
      secondary: '#FFD166',
      danger: '#FF9C8E',
      success: '#9BF0C8',
      onPrimary: '#123E70',
      scrim: 'rgba(12,47,88,0.9)',
    },
    pieces: {
      I: '#9FE7FF',
      O: '#FFE58A',
      T: '#D9B8FF',
      S: '#A8F0B8',
      Z: '#FFB3A7',
      J: '#A9C7FF',
      L: '#FFC98A',
    },
    blockStyle: 'blueprint',
    backdrop: 'graph',
    scanlines: 0,
    fonts: {
      display: 'ArchitectsDaughter_400Regular',
      heading: 'ArchitectsDaughter_400Regular',
      body: 'ShareTechMono_400Regular',
      label: 'ShareTechMono_400Regular',
      number: 'ShareTechMono_400Regular',
    },
  },
  {
    id: 'sugarRush',
    collection: 'Crafted',
    shape: 'round',
    titleEffect: 'pop',
    scanBar: false,
    brackets: false,
    statusBar: 'dark',
    colors: {
      background: '#FFE6F1',
      backgroundAlt: '#E3EEFF',
      surface: '#FFFFFF',
      surfaceRaised: '#FFF0F7',
      well: '#2D1640',
      grid: 'rgba(255,255,255,0.09)',
      line: 'rgba(194,24,91,0.32)',
      text: '#3A1D4A',
      textDim: '#6B4A7E',
      textFaint: '#9C7AAF',
      primary: '#C2185B',
      secondary: '#1F8FA0',
      danger: '#D63A4C',
      success: '#1E8C5C',
      onPrimary: '#FFFFFF',
      scrim: 'rgba(255,230,241,0.9)',
    },
    pieces: {
      I: '#4FD1FF',
      O: '#FFD84D',
      T: '#C77DFF',
      S: '#5EE6A0',
      Z: '#FF5C8A',
      J: '#7A92FF',
      L: '#FF9F45',
    },
    blockStyle: 'jelly',
    backdrop: 'dots',
    scanlines: 0,
    fonts: {
      display: 'Baloo2_800ExtraBold',
      heading: 'Baloo2_700Bold',
      body: 'Baloo2_500Medium',
      label: 'Baloo2_700Bold',
      number: 'Baloo2_800ExtraBold',
    },
  },
  {
    id: 'kintsugi',
    collection: 'Crafted',
    shape: 'notch',
    titleEffect: 'plain',
    scanBar: false,
    brackets: false,
    statusBar: 'light',
    colors: {
      background: '#120A08',
      backgroundAlt: '#2B0F0B',
      surface: '#1D1210',
      surfaceRaised: '#2B1A16',
      well: '#0D0706',
      grid: 'rgba(212,175,55,0.08)',
      line: 'rgba(212,175,55,0.5)',
      text: '#F3E6CF',
      textDim: '#C9AC7E',
      textFaint: '#80694A',
      primary: '#D4AF37',
      secondary: '#D9573F',
      danger: '#E0563F',
      success: '#94C27F',
      onPrimary: '#120A08',
      scrim: 'rgba(18,10,8,0.9)',
    },
    pieces: {
      I: '#5FB0A6',
      O: '#E3B23C',
      T: '#A57AB5',
      S: '#86B85E',
      Z: '#D2493A',
      J: '#5C86C9',
      L: '#DD8A50',
    },
    blockStyle: 'lacquer',
    backdrop: 'waves',
    scanlines: 0,
    fonts: {
      display: 'Cinzel_700Bold',
      heading: 'Cinzel_600SemiBold',
      body: 'CormorantGaramond_600SemiBold',
      label: 'Cinzel_600SemiBold',
      number: 'Cinzel_700Bold',
    },
  },
  {
    id: 'cathedral',
    collection: 'Crafted',
    shape: 'arch',
    titleEffect: 'plain',
    scanBar: false,
    brackets: false,
    statusBar: 'light',
    colors: {
      background: '#14101C',
      backgroundAlt: '#261A38',
      surface: '#1E1829',
      surfaceRaised: '#2B2339',
      well: '#0B0910',
      grid: 'rgba(255,255,255,0.05)',
      line: 'rgba(214,180,112,0.5)',
      text: '#F2EBF8',
      textDim: '#BDAFCE',
      textFaint: '#7D6F90',
      primary: '#E8B04B',
      secondary: '#5AA9E6',
      danger: '#E0566E',
      success: '#4CB98A',
      onPrimary: '#14101C',
      scrim: 'rgba(20,16,28,0.9)',
    },
    pieces: {
      I: '#3FA7E0',
      O: '#F2C14E',
      T: '#A66BDB',
      S: '#3DBE7E',
      Z: '#E04460',
      J: '#4F74E3',
      L: '#F08A3E',
    },
    blockStyle: 'glass',
    backdrop: 'rose',
    scanlines: 0,
    fonts: {
      display: 'UnifrakturMaguntia_400Regular',
      heading: 'CormorantGaramond_700Bold',
      body: 'CormorantGaramond_600SemiBold',
      label: 'Cinzel_600SemiBold',
      number: 'Cinzel_700Bold',
    },
  },
];

const shade = (fill: string): PieceShades => ({
  fill,
  light: lighten(fill, 0.55),
  dark: darken(fill, 0.45),
  tint: withAlpha(fill, 0.16),
});

const buildShades = (spec: ThemeSpec): Record<BlockKind, PieceShades> => {
  const pieces = Object.fromEntries(
    (Object.keys(spec.pieces) as PieceType[]).map((type) => [type, shade(spec.pieces[type])]),
  ) as Record<PieceType, PieceShades>;
  return {
    ...pieces,
    // Garbage sits between the faint and dim text colours: clearly a block, clearly not a piece.
    G: shade(mix(spec.colors.textFaint, spec.colors.textDim, 0.35)),
    // Banked Zone lines glow in the theme's text colour.
    X: shade(spec.colors.text),
  };
};

export const THEMES: Record<ThemeId, Theme> = Object.fromEntries(
  SPECS.map((spec) => [spec.id, { ...spec, shades: buildShades(spec) }]),
) as Record<ThemeId, Theme>;

export const THEME_ORDER: readonly ThemeId[] = SPECS.map((spec) => spec.id);

export const DEFAULT_THEME_ID: ThemeId = 'nightCity';

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && value in THEMES;

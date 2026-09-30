import type { PieceType } from '../game/types';
import { darken, lighten, withAlpha } from './colorUtils';
import type { FontFamily } from './fonts';

export type ThemeId = 'nightCity' | 'neonRain' | 'outrun' | 'amberTerminal';

/** How a single block is drawn. Each theme owns one, so themes differ in shape, not just colour. */
export type BlockStyle = 'tube' | 'gloss' | 'bevel' | 'chip';

/** Static art behind the UI. */
export type Backdrop = 'circuit' | 'rain' | 'horizon' | 'none';

export interface PieceShades {
  fill: string;
  light: string;
  dark: string;
  /** Translucent fill used by hollow styles and the ghost. */
  tint: string;
}

interface ThemeSpec {
  id: ThemeId;
  name: string;
  tagline: string;
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

export interface Theme extends ThemeSpec {
  shades: Record<PieceType, PieceShades>;
}

const CYBER_FONTS: ThemeSpec['fonts'] = {
  display: 'Orbitron_900Black',
  heading: 'ChakraPetch_700Bold',
  body: 'ChakraPetch_500Medium',
  label: 'ChakraPetch_600SemiBold',
  number: 'Orbitron_700Bold',
};

const SPECS: ThemeSpec[] = [
  {
    id: 'nightCity',
    name: 'Night City',
    tagline: 'Hazard yellow on black. Hollow neon tubes.',
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
    name: 'Neon Rain',
    tagline: 'Magenta signs through wet glass.',
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
    name: 'Outrun',
    tagline: 'A violet dusk and a grid to the horizon.',
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
    name: 'Amber Terminal',
    tagline: 'A netrunner’s phosphor screen.',
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
];

const buildShades = (pieces: Record<PieceType, string>): Record<PieceType, PieceShades> => {
  const entries = (Object.keys(pieces) as PieceType[]).map((type) => {
    const fill = pieces[type];
    return [
      type,
      { fill, light: lighten(fill, 0.55), dark: darken(fill, 0.45), tint: withAlpha(fill, 0.16) },
    ] as const;
  });
  return Object.fromEntries(entries) as Record<PieceType, PieceShades>;
};

export const THEMES: Record<ThemeId, Theme> = Object.fromEntries(
  SPECS.map((spec) => [spec.id, { ...spec, shades: buildShades(spec.pieces) }]),
) as Record<ThemeId, Theme>;

export const THEME_ORDER: readonly ThemeId[] = SPECS.map((spec) => spec.id);

export const DEFAULT_THEME_ID: ThemeId = 'nightCity';

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && value in THEMES;

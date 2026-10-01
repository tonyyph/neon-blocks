import { ArchitectsDaughter_400Regular } from '@expo-google-fonts/architects-daughter/400Regular';
import { Baloo2_500Medium } from '@expo-google-fonts/baloo-2/500Medium';
import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2/700Bold';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold';
import { ChakraPetch_500Medium } from '@expo-google-fonts/chakra-petch/500Medium';
import { ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch/600SemiBold';
import { ChakraPetch_700Bold } from '@expo-google-fonts/chakra-petch/700Bold';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel/600SemiBold';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond/700Bold';
import { GrenzeGotisch_700Bold } from '@expo-google-fonts/grenze-gotisch/700Bold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { Orbitron_700Bold } from '@expo-google-fonts/orbitron/700Bold';
import { Orbitron_900Black } from '@expo-google-fonts/orbitron/900Black';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand/400Regular';
import { PlayfairDisplaySC_700Bold } from '@expo-google-fonts/playfair-display-sc/700Bold';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono/400Regular';
import { Tektur_700Bold } from '@expo-google-fonts/tektur/700Bold';
import { Tektur_800ExtraBold } from '@expo-google-fonts/tektur/800ExtraBold';
import { UnifrakturMaguntia_400Regular } from '@expo-google-fonts/unifrakturmaguntia/400Regular';

/** Imported weight by weight so only these files ship in the bundle. */
export const FONT_ASSETS = {
  Orbitron_700Bold,
  Orbitron_900Black,
  ChakraPetch_500Medium,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
  ShareTechMono_400Regular,
  ArchitectsDaughter_400Regular,
  Baloo2_500Medium,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  UnifrakturMaguntia_400Regular,
  // Vietnamese companions for the fonts above that have no Vietnamese glyphs.
  Tektur_700Bold,
  Tektur_800ExtraBold,
  JetBrainsMono_500Medium,
  PatrickHand_400Regular,
  PlayfairDisplaySC_700Bold,
  GrenzeGotisch_700Bold,
};

export type FontFamily = keyof typeof FONT_ASSETS;

/**
 * Each font's own line box (hhea ascent + descent over units per em), measured from the bundled
 * files. A line height below size x factor clips glyphs, so the type scale never goes under it.
 * `fonts.test.ts` re-measures the files and fails if a value here is too small.
 */
export const LINE_BOX: Record<FontFamily, number> = {
  Orbitron_700Bold: 1.254,
  Orbitron_900Black: 1.254,
  ChakraPetch_500Medium: 1.3,
  ChakraPetch_600SemiBold: 1.3,
  ChakraPetch_700Bold: 1.3,
  ShareTechMono_400Regular: 1.127,
  ArchitectsDaughter_400Regular: 1.39,
  Baloo2_500Medium: 1.602,
  Baloo2_700Bold: 1.602,
  Baloo2_800ExtraBold: 1.602,
  Cinzel_600SemiBold: 1.348,
  Cinzel_700Bold: 1.348,
  CormorantGaramond_600SemiBold: 1.211,
  CormorantGaramond_700Bold: 1.211,
  UnifrakturMaguntia_400Regular: 1.035,
  Tektur_700Bold: 1.3,
  Tektur_800ExtraBold: 1.3,
  JetBrainsMono_500Medium: 1.32,
  PatrickHand_400Regular: 1.354,
  PlayfairDisplaySC_700Bold: 1.333,
  GrenzeGotisch_700Bold: 1.48,
};

/**
 * Fonts without Vietnamese glyphs, mapped to the closest-feeling font that has them. Without this,
 * iOS would draw letters like ặ or ư in a system font mid-word. `fonts.test.ts` checks every font
 * either covers Vietnamese or has a companion here that does.
 */
export const VIETNAMESE_COMPANION: Partial<Record<FontFamily, FontFamily>> = {
  Orbitron_700Bold: 'Tektur_700Bold',
  Orbitron_900Black: 'Tektur_800ExtraBold',
  ShareTechMono_400Regular: 'JetBrainsMono_500Medium',
  ArchitectsDaughter_400Regular: 'PatrickHand_400Regular',
  Cinzel_600SemiBold: 'PlayfairDisplaySC_700Bold',
  Cinzel_700Bold: 'PlayfairDisplaySC_700Bold',
  UnifrakturMaguntia_400Regular: 'GrenzeGotisch_700Bold',
};

/** Letters only Vietnamese uses on top of plain ASCII, upper and lower case. */
export const VIETNAMESE_LETTERS =
  'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';

const VIETNAMESE = new RegExp(`[${VIETNAMESE_LETTERS}${VIETNAMESE_LETTERS.toUpperCase()}]`);

/**
 * The font to draw `text` in: the theme's own, unless the text has Vietnamese letters that font
 * lacks. Decided per string, so plain-ASCII text such as the logo keeps the theme's look.
 */
export const resolveFont = (font: FontFamily, text: string | undefined): FontFamily => {
  const companion = VIETNAMESE_COMPANION[font];
  return companion && text && VIETNAMESE.test(text) ? companion : font;
};

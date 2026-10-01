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
import { Orbitron_700Bold } from '@expo-google-fonts/orbitron/700Bold';
import { Orbitron_900Black } from '@expo-google-fonts/orbitron/900Black';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono/400Regular';
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
};

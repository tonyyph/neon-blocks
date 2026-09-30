import { ChakraPetch_500Medium } from '@expo-google-fonts/chakra-petch/500Medium';
import { ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch/600SemiBold';
import { ChakraPetch_700Bold } from '@expo-google-fonts/chakra-petch/700Bold';
import { Orbitron_700Bold } from '@expo-google-fonts/orbitron/700Bold';
import { Orbitron_900Black } from '@expo-google-fonts/orbitron/900Black';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono/400Regular';

/** Imported weight by weight so only these six files ship in the bundle. */
export const FONT_ASSETS = {
  Orbitron_700Bold,
  Orbitron_900Black,
  ChakraPetch_500Medium,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
  ShareTechMono_400Regular,
};

export type FontFamily = keyof typeof FONT_ASSETS;

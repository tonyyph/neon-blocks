import { getLocales } from 'expo-localization';

export type Language = 'en' | 'vi';

export const LANGUAGES: readonly Language[] = ['vi', 'en'];

/** Each language's name, written in that language. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', vi: 'Tiếng Việt' };

export const isLanguage = (value: unknown): value is Language => value === 'en' || value === 'vi';

/** Vietnamese if the device prefers it, English otherwise. Used until the player picks one. */
export const deviceLanguage = (): Language => {
  try {
    return getLocales()[0]?.languageCode === 'vi' ? 'vi' : 'en';
  } catch {
    return 'en';
  }
};

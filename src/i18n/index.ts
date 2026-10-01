import { useSettingsStore } from '../store/settingsStore';
import { type Strings, en } from './en';
import { type Language } from './language';
import { vi } from './vi';

export * from './language';
export type { Strings } from './en';

const STRINGS: Record<Language, Strings> = { en, vi };
export const stringsFor = (language: Language): Strings => STRINGS[language];

/** The active language's strings. Components re-render when the player switches language. */
export const useT = (): Strings => useSettingsStore((store) => STRINGS[store.settings.language]);

/** Strings at call time, for code outside React. */
export const getT = (): Strings => STRINGS[useSettingsStore.getState().settings.language];

/** Thousands separators in the reader's convention: 12,345 in English, 12.345 in Vietnamese. */
export const formatNumber = (value: number, strings: Strings): string =>
  value.toLocaleString(strings.locale);

/** A Daily date key (YYYY-MM-DD) as people write dates: 01/10/2026 in Vietnamese, Oct 1, 2026 in English. */
export const formatDay = (dateKey: string, strings: Strings): string => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(strings.locale, {
    day: '2-digit',
    month: strings.locale === 'vi-VN' ? '2-digit' : 'short',
    year: 'numeric',
  });
};

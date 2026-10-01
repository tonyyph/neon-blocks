import { type Language, deviceLanguage, isLanguage } from '../i18n/language';
import { DEFAULT_THEME_ID, type ThemeId, isThemeId } from '../theme/themes';
import { isRecord, readJson, writeJson } from './jsonStorage';
import { STORAGE_KEYS } from './storageKeys';

export type ControlMode = 'buttons' | 'gestures';

export type PersistedSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  ghostEnabled: boolean;
  controlMode: ControlMode;
  themeId: ThemeId;
  language: Language;
  /** Set once the player finishes or skips the first-run tutorial. */
  tutorialDone: boolean;
};

export const DEFAULT_SETTINGS: PersistedSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  ghostEnabled: true,
  controlMode: 'gestures',
  themeId: DEFAULT_THEME_ID,
  language: 'en',
  tutorialDone: false,
};

/** Accepts any stored value and keeps only well-typed fields, falling back to defaults. */
export const parseSettings = (value: unknown): PersistedSettings => {
  // First launch (or unreadable data): follow the device language.
  if (!isRecord(value)) return { ...DEFAULT_SETTINGS, language: deviceLanguage() };
  const bool = (key: 'soundEnabled' | 'hapticsEnabled' | 'ghostEnabled') =>
    typeof value[key] === 'boolean' ? (value[key] as boolean) : DEFAULT_SETTINGS[key];
  return {
    soundEnabled: bool('soundEnabled'),
    hapticsEnabled: bool('hapticsEnabled'),
    ghostEnabled: bool('ghostEnabled'),
    // Gestures are the only control scheme; the field is kept for a possible buttons option.
    controlMode: 'gestures',
    themeId: isThemeId(value.themeId) ? value.themeId : DEFAULT_THEME_ID,
    language: isLanguage(value.language) ? value.language : deviceLanguage(),
    // Saved settings without this field belong to players from before the tutorial existed.
    tutorialDone: typeof value.tutorialDone === 'boolean' ? value.tutorialDone : true,
  };
};

export const loadSettings = async (): Promise<PersistedSettings> =>
  parseSettings(await readJson(STORAGE_KEYS.settings));

export const saveSettings = (settings: PersistedSettings): Promise<void> =>
  writeJson(STORAGE_KEYS.settings, settings);

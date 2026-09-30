import { useSettingsStore } from '../store/settingsStore';
import { THEMES, type Theme } from './themes';

/** The active theme. Components re-render when the player switches themes. */
export const useTheme = (): Theme => useSettingsStore((store) => THEMES[store.settings.themeId]);

import { create } from 'zustand';

import {
  DEFAULT_SETTINGS,
  type PersistedSettings,
  loadSettings,
  saveSettings,
} from '../storage/settingsStorage';

interface SettingsStore {
  settings: PersistedSettings;
  hydrate: () => Promise<void>;
  update: (patch: Partial<PersistedSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrate: async () => set({ settings: await loadSettings() }),
  update: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    void saveSettings(settings);
  },
}));

/** Read a setting at call time, for callbacks that should not re-render when it changes. */
export const getSettings = () => useSettingsStore.getState().settings;

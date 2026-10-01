import { DEFAULT_SETTINGS, parseSettings } from '../settingsStorage';

describe('parseSettings', () => {
  it('falls back to defaults for missing or corrupt data', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('nope')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings({ soundEnabled: 'yes' })).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps a known theme and rejects an unknown one', () => {
    expect(parseSettings({ themeId: 'outrun' }).themeId).toBe('outrun');
    expect(parseSettings({ themeId: 'vaporware' }).themeId).toBe(DEFAULT_SETTINGS.themeId);
  });

  it('keeps valid stored values', () => {
    expect(parseSettings({ soundEnabled: false, ghostEnabled: false })).toEqual({
      ...DEFAULT_SETTINGS,
      soundEnabled: false,
      ghostEnabled: false,
    });
  });
});

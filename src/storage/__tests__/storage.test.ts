import { DEFAULT_SETTINGS, parseSettings } from '../settingsStorage';

describe('parseSettings', () => {
  it('treats nothing stored as a first launch: defaults, tutorial still to do', () => {
    const first = parseSettings(null);
    expect(first).toMatchObject({ ...DEFAULT_SETTINGS, language: first.language });
    expect(first.setupDone).toBe(false);
    expect(first.tutorialDone).toBe(false);
    expect(parseSettings('nope').setupDone).toBe(false);
    expect(parseSettings('nope').tutorialDone).toBe(false);
  });

  it('assumes players with saved settings from before the tutorial already know the game', () => {
    expect(parseSettings({ soundEnabled: true })).toMatchObject({
      setupDone: true,
      tutorialDone: true,
    });
    expect(parseSettings({ setupDone: true, tutorialDone: false })).toMatchObject({
      setupDone: true,
      tutorialDone: false,
    });
    expect(parseSettings({ tutorialDone: false }).tutorialDone).toBe(false);
  });

  it('keeps a known theme and rejects an unknown one', () => {
    expect(parseSettings({ themeId: 'outrun' }).themeId).toBe('outrun');
    expect(parseSettings({ themeId: 'vaporware' }).themeId).toBe(DEFAULT_SETTINGS.themeId);
  });

  it('keeps valid stored values and ignores broken ones', () => {
    const parsed = parseSettings({
      soundEnabled: false,
      ghostEnabled: false,
      hapticsEnabled: 'yes',
      language: 'vi',
    });
    expect(parsed).toMatchObject({
      soundEnabled: false,
      ghostEnabled: false,
      hapticsEnabled: DEFAULT_SETTINGS.hapticsEnabled,
      language: 'vi',
    });
  });
});

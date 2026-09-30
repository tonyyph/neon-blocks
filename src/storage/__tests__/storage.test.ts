import { DEFAULT_SETTINGS, parseSettings } from '../settingsStorage';
import { DEFAULT_STATS, applyGameResult, parseStats } from '../statsStorage';

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

describe('stats', () => {
  it('sanitises stored numbers', () => {
    expect(parseStats({ highScore: -5, gamesPlayed: 3.7, bestLines: 'x' })).toEqual({
      ...DEFAULT_STATS,
      gamesPlayed: 3,
    });
  });

  it('applies a game result as bests plus one game played', () => {
    const stats = { highScore: 1000, gamesPlayed: 2, bestLines: 30, bestLevel: 4 };
    expect(applyGameResult(stats, { score: 500, lines: 40, level: 5 })).toEqual({
      highScore: 1000,
      gamesPlayed: 3,
      bestLines: 40,
      bestLevel: 5,
    });
  });
});

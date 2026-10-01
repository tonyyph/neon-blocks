import { migrateV1, parseProgress } from '../../storage/progressStorage';
import { EMPTY_PROGRESS, applyGameResult, currentStreak } from '../records';
import type { GameResult, Progress } from '../types';

const result = (overrides: Partial<GameResult> = {}): GameResult => ({
  mode: 'marathon',
  dateKey: null,
  outcome: 'topOut',
  score: 1000,
  lines: 10,
  level: 2,
  timeMs: 60_000,
  pieces: 30,
  tetrises: 0,
  backToBacks: 0,
  maxCombo: 0,
  maxChain: 0,
  maxZoneLines: 0,
  finishedAt: 1_000,
  ...overrides,
});

const apply = (progress: Progress, r: GameResult, gameId = 1) =>
  applyGameResult(progress, r, gameId);

describe('records', () => {
  it('a first score is a record, a lower one is not', () => {
    const first = apply(EMPTY_PROGRESS, result({ score: 1000 }));
    expect(first.summary.isRecord).toBe(true);
    expect(first.progress.records.marathon).toMatchObject({ plays: 1, bestScore: 1000 });
    const second = apply(first.progress, result({ score: 500 }), 2);
    expect(second.summary.isRecord).toBe(false);
    expect(second.summary.previousBest).toBe(1000);
    expect(second.progress.records.marathon?.plays).toBe(2);
  });

  it('time modes only record completed runs, and faster is better', () => {
    const failed = apply(
      EMPTY_PROGRESS,
      result({ mode: 'sprint', outcome: 'topOut', timeMs: 30_000 }),
    );
    expect(failed.summary.isRecord).toBe(false);
    expect(failed.progress.records.sprint?.bestTimeMs).toBeNull();

    const done = apply(
      failed.progress,
      result({ mode: 'sprint', outcome: 'completed', timeMs: 90_000 }),
    );
    expect(done.summary.isRecord).toBe(true);
    const slower = apply(
      done.progress,
      result({ mode: 'sprint', outcome: 'completed', timeMs: 95_000 }),
    );
    expect(slower.summary.isRecord).toBe(false);
    expect(slower.progress.records.sprint?.bestTimeMs).toBe(90_000);
  });

  it('adds totals and keeps the ten most recent games', () => {
    let progress = EMPTY_PROGRESS;
    for (let i = 0; i < 12; i += 1) progress = apply(progress, result({ score: i }), i).progress;
    expect(progress.totals.games).toBe(12);
    expect(progress.totals.lines).toBe(120);
    expect(progress.recent).toHaveLength(10);
    expect(progress.recent[0].score).toBe(11);
  });
});

describe('daily', () => {
  const daily = (dateKey: string, score = 100) =>
    result({ mode: 'daily', outcome: 'timeUp', dateKey, score });

  it('only the first game of a day is official', () => {
    const first = apply(EMPTY_PROGRESS, daily('2026-10-01', 500));
    expect(first.summary.isOfficialDaily).toBe(true);
    const again = apply(first.progress, daily('2026-10-01', 900), 2);
    expect(again.summary.isOfficialDaily).toBe(false);
    expect(again.progress.daily.results['2026-10-01']).toBe(500);
  });

  it('counts consecutive days as a streak and resets after a gap', () => {
    let progress = EMPTY_PROGRESS;
    for (const day of ['2026-09-29', '2026-09-30', '2026-10-01']) {
      progress = apply(progress, daily(day)).progress;
    }
    expect(progress.daily.streak).toBe(3);
    progress = apply(progress, daily('2026-10-05')).progress;
    expect(progress.daily.streak).toBe(1);
    expect(progress.daily.bestStreak).toBe(3);
  });

  it('shows a streak only while it is still alive', () => {
    const progress = apply(EMPTY_PROGRESS, daily('2026-10-01')).progress;
    expect(currentStreak(progress.daily, '2026-10-02')).toBe(1);
    expect(currentStreak(progress.daily, '2026-10-04')).toBe(0);
  });
});

describe('achievements', () => {
  it('unlocks once, with the time it happened', () => {
    const first = apply(EMPTY_PROGRESS, result({ tetrises: 1, finishedAt: 42 }));
    expect(first.summary.unlocked).toEqual(expect.arrayContaining(['first-game', 'first-tetris']));
    expect(first.progress.achievements['first-tetris']).toBe(42);
    const again = apply(first.progress, result({ tetrises: 1 }), 2);
    expect(again.summary.unlocked).not.toContain('first-tetris');
  });

  it('checks mode-specific goals', () => {
    const sprint = apply(
      EMPTY_PROGRESS,
      result({ mode: 'sprint', outcome: 'completed', timeMs: 100_000 }),
    );
    expect(sprint.summary.unlocked).toEqual(expect.arrayContaining(['sprint-done', 'sprint-2min']));
    const chain = apply(EMPTY_PROGRESS, result({ mode: 'cascade', maxChain: 5 }));
    expect(chain.summary.unlocked).toEqual(expect.arrayContaining(['chain-3', 'chain-5']));
    const zone = apply(EMPTY_PROGRESS, result({ maxZoneLines: 9 }));
    expect(zone.summary.unlocked).toContain('zone-8');
    expect(zone.summary.unlocked).not.toContain('zone-16');
  });

  it('needs a long enough game for the speed award', () => {
    const short = apply(EMPTY_PROGRESS, result({ pieces: 40, timeMs: 10_000 }));
    expect(short.summary.unlocked).not.toContain('speed-2pps');
    const long = apply(EMPTY_PROGRESS, result({ pieces: 120, timeMs: 55_000 }));
    expect(long.summary.unlocked).toContain('speed-2pps');
  });
});

describe('storage', () => {
  it('round-trips progress and drops garbage', () => {
    const progress = apply(EMPTY_PROGRESS, result({ tetrises: 2 })).progress;
    expect(parseProgress(JSON.parse(JSON.stringify(progress)))).toEqual(progress);
    expect(parseProgress('nope')).toEqual(EMPTY_PROGRESS);
    expect(
      parseProgress({ records: { bogus: { bestScore: 5 } }, achievements: { fake: 1 } }),
    ).toMatchObject({ records: {}, achievements: {} });
  });

  it('migrates the v1 high score into Marathon', () => {
    const migrated = migrateV1({ highScore: 4200, gamesPlayed: 3, bestLines: 30, bestLevel: 4 });
    expect(migrated.records.marathon).toMatchObject({ bestScore: 4200, plays: 3, bestLines: 30 });
    expect(migrated.totals.games).toBe(3);
  });
});

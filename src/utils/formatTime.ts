/**
 * Formats a duration for the HUD and records: `1:05.32` with hundredths, `1:05` without.
 * Hundredths are truncated, never rounded up, so a clock never shows a time not yet reached.
 */
export const formatTime = (ms: number, hundredths = true): string => {
  const safe = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(safe / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);
  const base = `${minutes}:${String(seconds).padStart(2, '0')}`;
  return hundredths ? `${base}.${String(Math.floor((safe % 1000) / 10)).padStart(2, '0')}` : base;
};

/** Seconds left on a countdown, rounded up so it reads 0:01 until the very end. */
export const formatCountdown = (ms: number): string =>
  formatTime(Math.ceil(Math.max(0, ms) / 1000) * 1000, false);

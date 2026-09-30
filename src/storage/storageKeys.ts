/** Versioned so a future schema change can migrate instead of misreading old data. */
export const STORAGE_KEYS = {
  settings: 'neonblocks.settings.v1',
  stats: 'neonblocks.stats.v1',
} as const;

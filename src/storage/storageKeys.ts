/** Versioned so a future schema change can migrate instead of misreading old data. */
export const STORAGE_KEYS = {
  settings: 'neonblocks.settings.v1',
  /** Superseded by `progress`; read once to migrate the old high score. */
  statsV1: 'neonblocks.stats.v1',
  progress: 'neonblocks.progress.v2',
} as const;

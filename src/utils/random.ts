/**
 * Seeded PRNG (mulberry32). The game keeps its seed in state so the reducer stays pure and a
 * game can be replayed exactly in tests.
 */
export const createRandom = (seed: number) => {
  let state = seed >>> 0;
  return {
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get seed(): number {
      return state;
    },
  };
};

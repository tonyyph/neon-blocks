/** Fisher–Yates shuffle. Returns a new array; `random` must return values in [0, 1). */
export const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

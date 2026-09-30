export const SOFT_DROP_POINTS_PER_CELL = 1;
export const HARD_DROP_POINTS_PER_CELL = 2;

/** Base points for clearing 0–4 lines at level 1. */
export const LINE_CLEAR_POINTS = [0, 100, 300, 500, 800] as const;

export const COMBO_POINTS = 50;

export const getLineClearScore = (lines: number, level: number): number =>
  (LINE_CLEAR_POINTS[lines] ?? 0) * level;

/** A Tetris straight after another Tetris earns half its value again. */
export const getBackToBackBonus = (lines: number, level: number, backToBack: boolean): number =>
  lines === 4 && backToBack ? getLineClearScore(4, level) / 2 : 0;

/** `combo` is the number of consecutive clears before this one; the first clear earns nothing. */
export const getComboBonus = (combo: number, level: number): number =>
  combo > 0 ? COMBO_POINTS * combo * level : 0;

export interface ClearScore {
  points: number;
  backToBack: boolean;
}

export const scoreClear = (
  lines: number,
  level: number,
  combo: number,
  backToBackArmed: boolean,
): ClearScore => {
  const b2b = getBackToBackBonus(lines, level, backToBackArmed);
  return {
    points: getLineClearScore(lines, level) + b2b + getComboBonus(combo, level),
    backToBack: b2b > 0,
  };
};

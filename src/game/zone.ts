import { BOARD_WIDTH } from './constants';
import { type Board, type Cell, ZONE_LINE } from './types';

/** Lines that fill the meter from empty. */
export const ZONE_LINES_TO_FILL = 16;
/** Zone can start once the meter is at least half full. */
export const ZONE_MIN_METER = 0.5;
/** A full meter buys this much frozen time; a half meter half as much. */
export const ZONE_FULL_DURATION_MS = 20_000;

export const isZoneRow = (row: readonly Cell[]): boolean => row.every((cell) => cell === ZONE_LINE);

/**
 * Banks cleared rows during Zone: the full rows leave their place and stack at the bottom as Zone
 * lines, under any already banked, and everything above them drops.
 */
export const bankZoneRows = (board: Board, rows: readonly number[]): Board => {
  const remove = new Set(rows);
  const kept = board.filter((row, y) => !remove.has(y) && !isZoneRow(row));
  const banked = board.filter(isZoneRow).length + rows.length;
  const zoneRow = (): Cell[] => Array.from({ length: BOARD_WIDTH }, () => ZONE_LINE);
  return [...kept, ...Array.from({ length: banked }, zoneRow)];
};

/** Removes the banked Zone lines when Zone ends; the stack above settles back down. */
export const releaseZoneRows = (board: Board): Board => {
  const kept = board.filter((row) => !isZoneRow(row));
  const empty = (): Cell[] => Array.from({ length: BOARD_WIDTH }, () => null);
  return [...Array.from({ length: board.length - kept.length }, empty), ...kept];
};

/** Zone pays off steeply: 4 lines 1,200, 8 lines 4,800, 16 lines 19,200 (× level). */
export const getZoneScore = (lines: number, level: number): number => 75 * lines * lines * level;

/** Banked-line counts that earn a named burst. Names live in the i18n dictionaries. */
export const ZONE_TIERS = [8, 12, 16, 20] as const;
export type ZoneTier = (typeof ZONE_TIERS)[number];

/** The highest tier the banked count has reached, or null below the first. */
export const getZoneTier = (lines: number): ZoneTier | null =>
  ZONE_TIERS.filter((tier) => lines >= tier).pop() ?? null;

import { LINES_PER_LEVEL } from './constants';

export const getLevel = (lines: number): number => Math.floor(lines / LINES_PER_LEVEL) + 1;

export const getDropInterval = (level: number): number => Math.max(100, 1000 - (level - 1) * 80);

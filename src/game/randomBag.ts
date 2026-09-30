import { shuffle } from '../utils/shuffle';
import { PIECE_TYPES } from './pieces';
import type { PieceType } from './types';

export const BAG_SIZE = PIECE_TYPES.length;

export const createBag = (random: () => number): PieceType[] => shuffle(PIECE_TYPES, random);

/**
 * Tops the queue up with whole shuffled bags until it holds at least `minLength` pieces.
 * Appending whole bags keeps the 7-bag guarantee: every aligned run of 7 contains each piece once.
 */
export const fillQueue = (
  queue: readonly PieceType[],
  minLength: number,
  random: () => number,
): PieceType[] => {
  const next = [...queue];
  while (next.length < minLength) next.push(...createBag(random));
  return next;
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const logStorageError = (operation: string, key: string, error: unknown) => {
  if (__DEV__) console.warn(`[storage] ${operation} ${key} failed`, error);
};

/** Reads JSON, returning null on a missing key, unreadable storage or corrupt data. */
export const readJson = async (key: string): Promise<unknown> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch (error) {
    logStorageError('read', key, error);
    return null;
  }
};

/** Writes JSON. Failures are logged and swallowed: losing a save must never crash the game. */
export const writeJson = async (key: string, value: unknown): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logStorageError('write', key, error);
  }
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

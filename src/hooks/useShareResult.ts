import * as Sharing from 'expo-sharing';
import { type RefObject, useCallback, useState } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * Captures the given view as a PNG and opens the system share sheet with it. Failures (no share
 * target, capture refused) are swallowed: sharing is a nicety and must never break the game.
 */
export const useShareResult = (ref: RefObject<View | null>) => {
  const [busy, setBusy] = useState(false);

  const share = useCallback(async () => {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: 'Share your result',
        });
      }
    } catch (error) {
      if (__DEV__) console.warn('[share] failed', error);
    } finally {
      setBusy(false);
    }
  }, [ref, busy]);

  return { share, busy };
};

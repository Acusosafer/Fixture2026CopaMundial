'use client';

import { useState, useRef, useCallback } from 'react';

export function useTVMode() {
  const [isTV, setIsTV] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const enter = useCallback(async () => {
    setIsTV(true);
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch { /* not supported on all browsers */ }
    try {
      await document.documentElement.requestFullscreen();
    } catch { /* user may deny */ }
  }, []);

  const exit = useCallback(() => {
    setIsTV(false);
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return { isTV, enter, exit };
}

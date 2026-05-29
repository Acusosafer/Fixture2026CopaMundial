'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/store/preferences';

// Syncs zustand theme + team → <html> class + data-theme + data-team
export function ThemeSync() {
  const theme = usePreferences((s) => s.theme);
  const teamCode = usePreferences((s) => s.myTeamCode);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(theme);
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    const html = document.documentElement;
    if (teamCode) {
      html.setAttribute('data-team', teamCode);
    } else {
      html.removeAttribute('data-team');
    }
  }, [teamCode]);

  return null;
}

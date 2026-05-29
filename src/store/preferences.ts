import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  myTeamCode: string;
  use24h: boolean;
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  setMyTeamCode: (code: string) => void;
  toggleTimeFormat: () => void;
  toggleSound: () => void;
  toggleTheme: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      myTeamCode: 'AR',
      use24h: true,
      soundEnabled: false,
      theme: 'dark',
      setMyTeamCode: (code) => set({ myTeamCode: code }),
      toggleTimeFormat: () => set((s) => ({ use24h: !s.use24h })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'mundial2026-prefs' }
  )
);

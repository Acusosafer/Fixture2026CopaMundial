import { usePreferences } from '@/store/preferences';
import { getTeamByCode, type Team } from '@/lib/teams';

export function useMySelection(): {
  team: Team | undefined;
  setTeamCode: (code: string) => void;
} {
  const myTeamCode = usePreferences((s) => s.myTeamCode);
  const setMyTeamCode = usePreferences((s) => s.setMyTeamCode);

  return {
    team: getTeamByCode(myTeamCode),
    setTeamCode: setMyTeamCode,
  };
}

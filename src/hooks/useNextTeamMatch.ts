'use client';

import { useMemo } from 'react';
import { staticMatches, type StaticMatch } from '@/lib/fixtures-static';
import { useBracketResolution } from './useBracketResolution';

export interface NextTeamMatch {
  match: StaticMatch;
  rivalCode: string;        // resolved team code (or slot if still TBD)
  rivalIsPredicted: boolean; // true if rival comes from predictions, not ESPN confirmed
}

export function useNextTeamMatch(teamCode: string): NextTeamMatch | null {
  const { confirmed, predicted } = useBracketResolution();

  return useMemo(() => {
    const now = new Date();
    const upcoming = staticMatches
      .filter((m) => new Date(m.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const match of upcoming) {
      const homeResolved =
        confirmed.get(match.homeTeamCode) ??
        predicted.get(match.homeTeamCode) ??
        match.homeTeamCode;
      const awayResolved =
        confirmed.get(match.awayTeamCode) ??
        predicted.get(match.awayTeamCode) ??
        match.awayTeamCode;

      if (homeResolved === teamCode) {
        return {
          match,
          rivalCode: awayResolved,
          rivalIsPredicted: !confirmed.has(match.awayTeamCode),
        };
      }
      if (awayResolved === teamCode) {
        return {
          match,
          rivalCode: homeResolved,
          rivalIsPredicted: !confirmed.has(match.homeTeamCode),
        };
      }
    }
    return null;
  }, [teamCode, confirmed, predicted]);
}

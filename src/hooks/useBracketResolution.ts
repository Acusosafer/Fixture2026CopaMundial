'use client';

import { useMemo } from 'react';
import { useLiveScores } from './useLiveScores';
import { staticMatches } from '@/lib/fixtures-static';
import { resolveBracketCodes } from '@/lib/bracket';
import { PREDICTED_TEAMS } from '@/lib/bracket-predictions';

export interface BracketResolution {
  confirmed: Map<string, string>; // resuelto desde ESPN (real)
  predicted: Map<string, string>; // proyectado (provisional)
}

export function useBracketResolution(): BracketResolution {
  const { scores } = useLiveScores();

  return useMemo(() => {
    const confirmed = resolveBracketCodes(staticMatches, scores);

    // 1. Fill group stage slots (fase de grupos terminada → todos son confirmed)
    for (const [slot, team] of Object.entries(PREDICTED_TEAMS)) {
      if (!confirmed.has(slot)) confirmed.set(slot, team);
    }

    // 2. Resolver W-codes DESPUÉS de tener los slots → W73 resuelve a 'CA' (no '2B')
    for (const round of ['R32', 'R16', 'QF', 'SF']) {
      for (const m of staticMatches.filter(x => x.group === round)) {
        const live = scores.get(m.id);
        if (!live || live.status !== 'FINISHED') continue;
        const homeResolved = confirmed.get(m.homeTeamCode) ?? m.homeTeamCode;
        const awayResolved = confirmed.get(m.awayTeamCode) ?? m.awayTeamCode;
        if (live.homeScore > live.awayScore) {
          confirmed.set(`W${m.id}`, homeResolved);
        } else if (live.awayScore > live.homeScore) {
          confirmed.set(`W${m.id}`, awayResolved);
        }
      }
    }

    return { confirmed, predicted: new Map<string, string>() };
  }, [scores]);
}

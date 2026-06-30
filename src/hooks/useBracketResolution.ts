'use client';

import { useMemo } from 'react';
import { useLiveScores } from './useLiveScores';
import { staticMatches } from '@/lib/fixtures-static';
import { resolveBracketCodes } from '@/lib/bracket';
import { PREDICTED_TEAMS } from '@/lib/bracket-predictions';
import { winnerSide } from '@/lib/live';

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
    //    winnerSide() contempla definición por penales (homeScore == awayScore
    //    pero shootoutScore distinto) — sin esto, los cruces por penales no avanzan.
    for (const round of ['R32', 'R16', 'QF', 'SF']) {
      for (const m of staticMatches.filter(x => x.group === round)) {
        const live = scores.get(m.id);
        if (!live || live.status !== 'FINISHED') continue;
        const side = winnerSide(live);
        if (!side) continue;
        const winnerRaw = side === 'home' ? m.homeTeamCode : m.awayTeamCode;
        confirmed.set(`W${m.id}`, confirmed.get(winnerRaw) ?? winnerRaw);
      }
    }

    return { confirmed, predicted: new Map<string, string>() };
  }, [scores]);
}

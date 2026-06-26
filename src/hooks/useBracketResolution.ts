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
    const predicted = new Map<string, string>();

    for (const [slot, team] of Object.entries(PREDICTED_TEAMS)) {
      if (!confirmed.has(slot)) {
        predicted.set(slot, team);
      }
    }

    return { confirmed, predicted };
  }, [scores]);
}

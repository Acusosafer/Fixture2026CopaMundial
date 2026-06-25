'use client';

import { useMemo } from 'react';
import { useLiveScores } from './useLiveScores';
import { staticMatches } from '@/lib/fixtures-static';
import { resolveBracketCodes } from '@/lib/bracket';

export function useBracketResolution(): Map<string, string> {
  const { scores } = useLiveScores();
  return useMemo(() => resolveBracketCodes(staticMatches, scores), [scores]);
}

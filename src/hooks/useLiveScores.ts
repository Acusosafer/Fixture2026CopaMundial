'use client';
import { useQuery } from '@tanstack/react-query';
import type { LiveScore } from '@/lib/live';

interface LiveResponse {
  data: LiveScore[];
  liveCount?: number;
  tournament?: boolean;
}

// Poll every 60s when there are live matches; every 5min otherwise.
// Returns a Map keyed by staticMatch.id for O(1) lookup in MatchCard.
export function useLiveScores(): {
  scores: Map<number, LiveScore>;
  liveCount: number;
  isLoading: boolean;
} {
  const query = useQuery<LiveResponse, Error>({
    queryKey: ['live-scores'],
    queryFn: async () => {
      const res = await fetch('/api/live');
      if (!res.ok) return { data: [] };
      return res.json() as Promise<LiveResponse>;
    },
    refetchInterval: (q) => {
      const count = q.state.data?.liveCount ?? 0;
      return count > 0 ? 30_000 : 60_000; // 30s si hay vivos, 60s si no
    },
    staleTime: 25_000,
    retry: false,
  });

  const data = query.data?.data ?? [];
  const scores = new Map(data.map((s) => [s.staticMatchId, s]));

  return {
    scores,
    liveCount: query.data?.liveCount ?? 0,
    isLoading: query.isLoading,
  };
}

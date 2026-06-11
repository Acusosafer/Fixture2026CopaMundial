'use client';
import { useQuery } from '@tanstack/react-query';
import type { MatchDetail } from '@/lib/live';

interface MatchDetailResponse {
  data: MatchDetail | null;
  reason?: string;
  error?: string;
}

export function useMatchDetail(matchId: number, isLive: boolean, isFinished: boolean) {
  const query = useQuery<MatchDetailResponse, Error>({
    queryKey: ['match-detail', matchId],
    queryFn: async () => {
      const res = await fetch(`/api/match-detail/${matchId}`);
      if (!res.ok) return { data: null };
      return res.json() as Promise<MatchDetailResponse>;
    },
    enabled: isLive || isFinished,
    staleTime: isLive ? 20_000 : 60_000 * 60,
    refetchInterval: isLive ? 30_000 : false,
    refetchOnWindowFocus: isLive,
    retry: false,
  });

  return {
    detail: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.data?.error,
  };
}

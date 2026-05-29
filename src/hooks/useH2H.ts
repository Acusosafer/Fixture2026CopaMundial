'use client';
import { useQuery } from '@tanstack/react-query';
import type { HeadToHead } from '@/lib/live';

export function useH2H(matchId: number) {
  const query = useQuery<{ data: HeadToHead | null }, Error>({
    queryKey: ['h2h', matchId],
    queryFn: async () => {
      const res = await fetch(`/api/h2h/${matchId}`);
      if (!res.ok) return { data: null };
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h — no cambia
    retry: false,
  });

  return {
    h2h: query.data?.data ?? null,
    isLoading: query.isLoading,
  };
}

'use client';
import { useQuery } from '@tanstack/react-query';
import { staticMatches, type StaticMatch } from '@/lib/fixtures-static';

export function useFixtures(): {
  matches: StaticMatch[];
  isLoading: boolean;
  error: Error | null;
} {
  const query = useQuery<StaticMatch[], Error>({
    queryKey: ['fixtures'],
    queryFn: async (): Promise<StaticMatch[]> => {
      try {
        const res = await fetch('/api/fixtures');
        if (!res.ok) throw new Error('API error');
        const json = (await res.json()) as { data?: StaticMatch[] };
        return json.data ?? staticMatches;
      } catch {
        return staticMatches;
      }
    },
    staleTime: 1000 * 60 * 30,
  });

  return {
    matches: query.data ?? staticMatches,
    isLoading: query.isLoading,
    error: query.error,
  };
}

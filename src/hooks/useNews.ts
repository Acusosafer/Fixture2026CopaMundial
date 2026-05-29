'use client';
import { useQuery } from '@tanstack/react-query';
import type { NewsItem } from '@/app/api/news/route';

export function useNews(): {
  news: NewsItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery<NewsItem[], Error>({
    queryKey: ['news'],
    queryFn: async (): Promise<NewsItem[]> => {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Error al cargar noticias');
      const json = (await res.json()) as { data?: NewsItem[] };
      return json.data ?? [];
    },
    staleTime: 1000 * 60 * 5,   // 5 min
    refetchInterval: 1000 * 60 * 5,
  });

  return {
    news: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

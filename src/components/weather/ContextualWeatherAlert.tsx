'use client';

import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getWeatherMessage } from '@/lib/getWeatherMessage';
import type { WeatherData } from '@/lib/api/weather';

interface WeatherApiResponse {
  data: WeatherData;
}

interface ContextualWeatherAlertProps {
  matchDate: Date;
}

const FALLBACK_LAT = -34.6037;
const FALLBACK_LNG = -58.3816;

export function ContextualWeatherAlert({ matchDate }: ContextualWeatherAlertProps) {
  const { lat, lng } = useGeolocation();
  const resolvedLat = lat ?? FALLBACK_LAT;
  const resolvedLng = lng ?? FALLBACK_LNG;

  const { data } = useQuery<WeatherData, Error>({
    queryKey: ['weather', resolvedLat, resolvedLng],
    queryFn: async () => {
      const res = await fetch(`/api/weather?lat=${resolvedLat}&lng=${resolvedLng}`);
      if (!res.ok) throw new Error('Weather error');
      const json = (await res.json()) as WeatherApiResponse;
      return json.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!data) return null;

  const matchHour = matchDate.getHours();
  const message = getWeatherMessage(data.temperature, data.description, matchHour);

  if (!message) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: 'var(--frost-dim)',
        border: '1px solid var(--frost)',
        color: 'var(--frost)',
      }}
    >
      {message}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { WeatherData } from '@/lib/api/weather';

const FALLBACK_LAT = -34.6037;
const FALLBACK_LNG = -58.3816;

interface WeatherApiResponse {
  data: WeatherData;
  cached: boolean;
  ttl: number;
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }
  const json = (await res.json()) as WeatherApiResponse;
  return json.data;
}

export function WeatherChip() {
  const { lat, lng } = useGeolocation();

  const resolvedLat = lat ?? FALLBACK_LAT;
  const resolvedLng = lng ?? FALLBACK_LNG;

  const { data, isLoading } = useQuery<WeatherData, Error>({
    queryKey: ['weather', resolvedLat, resolvedLng],
    queryFn: () => fetchWeather(resolvedLat, resolvedLng),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  const isCoolingRisk = !!data && (data.isCoolingBreakRisk || data.temperature >= 32 || data.humidity >= 75);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300"
        style={{
          background: isCoolingRisk ? 'var(--ember-dim)' : 'var(--border-color)',
          border: `1px solid ${isCoolingRisk ? 'var(--ember)' : 'rgba(255,255,255,0.08)'}`,
          color: isCoolingRisk ? 'var(--ember)' : 'var(--text-dim)',
        }}
      >
        <span>🌡</span>
        {isLoading || !data ? (
          <span>--°C</span>
        ) : (
          <>
            <span>{Math.round(data.temperature)}°C</span>
            <span>·</span>
            <span>{data.icon} {data.description}</span>
          </>
        )}
      </div>

      {isCoolingRisk && (
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{
            background: 'var(--ember-dim)',
            border: '1px solid var(--ember)',
            color: 'var(--ember)',
          }}
        >
          ⚠ Cooling break probable
        </div>
      )}
    </div>
  );
}

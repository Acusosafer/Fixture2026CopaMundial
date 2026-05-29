import { cached } from '@/lib/cache/kv';
import { TTL } from '@/lib/cache/ttls';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  isCoolingBreakRisk: boolean;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

function mapWeatherCode(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Despejado', icon: '☀️' };
  if (code === 1 || code === 2) return { description: 'Parcialmente nublado', icon: '⛅' };
  if (code === 3) return { description: 'Nublado', icon: '☁️' };
  if (code === 45 || code === 48) return { description: 'Neblina', icon: '🌫️' };
  if (code >= 51 && code <= 67) return { description: 'Lluvia', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { description: 'Nieve', icon: '🌨️' };
  if (code >= 80 && code <= 82) return { description: 'Chaparrones', icon: '🌦️' };
  if (code === 85 || code === 86) return { description: 'Nevada', icon: '🌨️' };
  if (code >= 95 && code <= 99) return { description: 'Tormenta', icon: '⛈️' };
  return { description: 'Desconocido', icon: '🌡️' };
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m');
  url.searchParams.set('forecast_days', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as OpenMeteoResponse;
  const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = json.current;

  const { description, icon } = mapWeatherCode(weather_code);

  return {
    temperature: temperature_2m,
    weatherCode: weather_code,
    humidity: relative_humidity_2m,
    windSpeed: wind_speed_10m,
    description,
    icon,
    isCoolingBreakRisk: temperature_2m >= 32 || relative_humidity_2m >= 75,
  };
}

export async function getWeatherForStadium(
  lat: number,
  lng: number
): Promise<{ data: WeatherData; cached: boolean }> {
  const key = `weather:${lat.toFixed(4)}:${lng.toFixed(4)}`;
  return cached<WeatherData>(key, TTL.WEATHER, () => fetchWeather(lat, lng));
}

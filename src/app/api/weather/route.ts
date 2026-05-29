import { NextResponse } from 'next/server';
import { getWeatherForStadium } from '@/lib/api/weather';
import { TTL } from '@/lib/cache/ttls';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat and lng', code: 400 },
      { status: 400 }
    );
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'Invalid parameters: lat and lng must be valid numbers', code: 400 },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180', code: 400 },
      { status: 400 }
    );
  }

  try {
    const result = await getWeatherForStadium(lat, lng);
    return NextResponse.json({
      data: result.data,
      cached: result.cached,
      ttl: TTL.WEATHER,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message, code: 500 },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cached } from '@/lib/cache/kv';
import { TTL } from '@/lib/cache/ttls';
import { getWCLiveScores } from '@/lib/api/football-data';
import { hasMatchSoon, isWithinTournament, type LiveScore } from '@/lib/live';

// Mock para probar la UI sin API key ni fechas reales.
// Activar con MOCK_LIVE=true en .env.local
function getMockLiveScores(): LiveScore[] {
  return [
    { staticMatchId: 1, homeScore: 2, awayScore: 1, minute: 67, injuryTime: 0, status: 'IN_PLAY' },
    { staticMatchId: 2, homeScore: 0, awayScore: 0, minute: 45, injuryTime: 2, status: 'PAUSED' },
    { staticMatchId: 3, homeScore: 3, awayScore: 1, minute: 90, injuryTime: 0, status: 'FINISHED' },
  ];
}

export async function GET(): Promise<Response> {
  // Modo mock: devuelve datos falsos para probar la UI
  if (process.env.MOCK_LIVE === 'true') {
    const mock = getMockLiveScores();
    return NextResponse.json({
      data: mock,
      mock: true,
      liveCount: mock.filter((s) => s.status === 'IN_PLAY' || s.status === 'PAUSED').length,
    });
  }

  // Fuera del torneo no hay nada que consultar
  if (!isWithinTournament()) {
    return NextResponse.json({ data: [], tournament: false });
  }

  // TTL corto si hay partido pronto, largo si no
  const ttl = hasMatchSoon() ? TTL.MATCH_LIVE : TTL.WEATHER; // 30s ó 15min

  try {
    const result = await cached<LiveScore[]>('live:wc', ttl, getWCLiveScores);

    return NextResponse.json({
      data: result.data,
      cached: result.cached,
      ttl,
      liveCount: result.data.filter((s) => s.status === 'IN_PLAY' || s.status === 'PAUSED').length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Si falla (rate limit, red, etc.) devolvemos vacío — la UI usa datos estáticos
    return NextResponse.json({ data: [], error: message, ttl });
  }
}

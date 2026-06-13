import { NextResponse } from 'next/server';
import { TTL } from '@/lib/cache/ttls';
import { getAPIFootballLive } from '@/lib/api/api-football';
import { getWCLiveScores } from '@/lib/api/football-data';
import { getESPNLive } from '@/lib/api/espn';
import { hasMatchSoon, isActiveStatus, isWithinTournament, type LiveScore } from '@/lib/live';

function getMockLiveScores(): LiveScore[] {
  return [
    { staticMatchId: 1, homeScore: 2, awayScore: 1, minute: 67, injuryTime: 0, status: 'IN_PLAY' },
    { staticMatchId: 2, homeScore: 0, awayScore: 0, minute: 45, injuryTime: 2, status: 'PAUSED' },
  ];
}

async function fetchLive(): Promise<LiveScore[]> {
  // 1) ESPN (sin key, público)
  try {
    const scores = await getESPNLive();
    if (scores.length > 0) {
      console.log('[live] espn scores:', scores.length);
      return scores;
    }
  } catch (e) {
    console.error('[live] espn failed:', e instanceof Error ? e.message : e);
  }

  // 2) API-Football (RapidAPI)
  if (process.env.RAPIDAPI_KEY) {
    try {
      const scores = await getAPIFootballLive();
      if (scores.length > 0) {
        console.log('[live] api-football scores:', scores.length);
        return scores;
      }
    } catch (e) {
      console.error('[live] api-football failed:', e instanceof Error ? e.message : e);
    }
  }

  // 3) Fallback: football-data.org
  return getWCLiveScores();
}

export async function GET(): Promise<Response> {
  if (process.env.MOCK_LIVE === 'true') {
    const mock = getMockLiveScores();
    return NextResponse.json({ data: mock, mock: true, liveCount: mock.filter(s => s.status === 'IN_PLAY').length });
  }

  if (!isWithinTournament()) {
    return NextResponse.json({ data: [], tournament: false });
  }

  const ttl = hasMatchSoon() ? TTL.MATCH_LIVE : TTL.WEATHER;

  try {
    const data = await fetchLive();

    const res = NextResponse.json({
      data,
      ttl,
      liveCount: data.filter((s) => isActiveStatus(s.status)).length,
    });

    // Cache en Vercel Edge: todos los usuarios comparten una respuesta por ttl segundos
    res.headers.set('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`);

    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[live] fetchLive failed:', message);
    return NextResponse.json({ data: [], error: message, ttl });
  }
}

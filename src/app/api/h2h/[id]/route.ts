import { NextResponse } from 'next/server';
import { cached } from '@/lib/cache/kv';
import { TTL } from '@/lib/cache/ttls';
import { getH2H } from '@/lib/api/football-data';
import { staticMatches } from '@/lib/fixtures-static';
import { getStaticH2H } from '@/lib/h2h-static';
import type { HeadToHead } from '@/lib/live';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getMockH2H(staticMatchId: number): HeadToHead {
  const match = staticMatches.find((m) => m.id === staticMatchId);
  const home = match?.homeTeamCode ?? 'MX';
  const away = match?.awayTeamCode ?? 'ZA';

  return {
    staticMatchId,
    totalMatches: 8,
    homeWins: 4,
    awayWins: 2,
    draws: 2,
    matches: [
      { date: '2022-11-22', homeTeamCode: home, awayTeamCode: away, homeScore: 2, awayScore: 0, competition: 'Copa del Mundo 2022' },
      { date: '2018-06-25', homeTeamCode: away, awayTeamCode: home, homeScore: 1, awayScore: 2, competition: 'Copa del Mundo 2018' },
      { date: '2014-06-13', homeTeamCode: home, awayTeamCode: away, homeScore: 3, awayScore: 1, competition: 'Copa del Mundo 2014' },
      { date: '2010-06-11', homeTeamCode: away, awayTeamCode: home, homeScore: 0, awayScore: 1, competition: 'Copa del Mundo 2010' },
      { date: '2006-06-17', homeTeamCode: home, awayTeamCode: away, homeScore: 1, awayScore: 1, competition: 'Copa del Mundo 2006' },
    ],
  };
}

export async function GET(_req: Request, { params }: RouteParams): Promise<Response> {
  const { id } = await params;
  const staticMatchId = parseInt(id, 10);

  if (isNaN(staticMatchId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const match = staticMatches.find((m) => m.id === staticMatchId);
  if (!match) {
    return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
  }

  // Siempre verificar datos estáticos primero (historial real de Copas del Mundo)
  const curated = getStaticH2H(staticMatchId);
  if (curated) {
    return NextResponse.json({ data: { ...curated, staticMatchId }, cached: true, source: 'static' });
  }

  if (process.env.MOCK_LIVE === 'true') {
    return NextResponse.json({ data: null, mock: true });
  }

  try {
    const result = await cached<HeadToHead>(
      `h2h:${staticMatchId}`,
      TTL.MATCH_FINISHED, // H2H no cambia — 24h
      () => getH2H(staticMatchId)
    );
    return NextResponse.json({ data: result.data, cached: result.cached });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 200 });
  }
}

import { NextResponse } from 'next/server';
import { TTL } from '@/lib/cache/ttls';
import { getESPNMatchDetail } from '@/lib/api/espn';
import { getMatchDetail } from '@/lib/api/football-data';
import { staticMatches } from '@/lib/fixtures-static';
import type { MatchDetail } from '@/lib/live';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Mock para probar la UI sin API key (se activa con MOCK_LIVE=true)
function getMockDetail(staticMatchId: number): MatchDetail {
  return {
    staticMatchId,
    fdMatchId: 999,
    stats: {
      possession:    { home: 58, away: 42 },
      shots:         { home: 14, away: 9 },
      shotsOnTarget: { home: 6,  away: 3 },
      corners:       { home: 7,  away: 4 },
      fouls:         { home: 11, away: 16 },
      offsides:      { home: 3,  away: 1 },
      yellowCards:   { home: 1,  away: 2 },
      redCards:      { home: 0,  away: 1 },
    },
    events: [
      { type: 'GOAL',        minute: 12, injuryTime: 0, team: 'home', playerName: 'García J.', assistName: 'López M.' },
      { type: 'YELLOW_CARD', minute: 28, injuryTime: 0, team: 'away', playerName: 'Smith R.' },
      { type: 'GOAL',        minute: 45, injuryTime: 2, team: 'away', playerName: 'Müller T.' },
      { type: 'SUBSTITUTION',minute: 55, injuryTime: 0, team: 'home', playerName: 'Ramírez C.', playerInName: 'Torres A.' },
      { type: 'RED_CARD',    minute: 67, injuryTime: 0, team: 'away', playerName: 'Johnson K.' },
      { type: 'GOAL',        minute: 78, injuryTime: 0, team: 'home', playerName: 'García J.' },
      { type: 'PENALTY',     minute: 90, injuryTime: 3, team: 'home', playerName: 'García J.' },
    ],
    homeLineup: {
      formation: '4-3-3',
      startingXI: [
        { name: 'Martínez E.', number: 1,  position: 'Goalkeeper' },
        { name: 'González P.', number: 2,  position: 'Right-Back' },
        { name: 'Rodríguez A.',number: 4,  position: 'Centre-Back' },
        { name: 'Fernández D.',number: 5,  position: 'Centre-Back' },
        { name: 'López M.',    number: 3,  position: 'Left-Back' },
        { name: 'Torres A.',   number: 8,  position: 'Central Midfield' },
        { name: 'Sánchez R.',  number: 6,  position: 'Central Midfield' },
        { name: 'García J.',   number: 10, position: 'Attacking Midfield' },
        { name: 'Morales F.',  number: 7,  position: 'Right Winger' },
        { name: 'Pérez C.',    number: 11, position: 'Left Winger' },
        { name: 'Ramírez C.',  number: 9,  position: 'Centre-Forward' },
      ],
      substitutes: [
        { name: 'Vargas O.',   number: 12, position: 'Goalkeeper' },
        { name: 'Castro N.',   number: 13, position: 'Centre-Back' },
        { name: 'Herrera V.',  number: 14, position: 'Central Midfield' },
      ],
    },
    awayLineup: {
      formation: '4-4-2',
      startingXI: [
        { name: 'Weber S.',    number: 1,  position: 'Goalkeeper' },
        { name: 'Smith R.',    number: 2,  position: 'Right-Back' },
        { name: 'Brown T.',    number: 5,  position: 'Centre-Back' },
        { name: 'Davis M.',    number: 4,  position: 'Centre-Back' },
        { name: 'Wilson J.',   number: 3,  position: 'Left-Back' },
        { name: 'Müller T.',   number: 8,  position: 'Right Midfield' },
        { name: 'Fischer A.',  number: 6,  position: 'Central Midfield' },
        { name: 'Becker L.',   number: 7,  position: 'Left Midfield' },
        { name: 'Johnson K.',  number: 10, position: 'Attacking Midfield' },
        { name: 'Taylor P.',   number: 9,  position: 'Centre-Forward' },
        { name: 'Anderson C.', number: 11, position: 'Centre-Forward' },
      ],
      substitutes: [
        { name: 'Clark H.',    number: 12, position: 'Goalkeeper' },
        { name: 'Lewis B.',    number: 13, position: 'Centre-Back' },
        { name: 'Hall W.',     number: 14, position: 'Central Midfield' },
      ],
    },
  };
}

export async function GET(_req: Request, { params }: RouteParams): Promise<Response> {
  const { id } = await params;
  const staticMatchId = parseInt(id, 10);

  if (isNaN(staticMatchId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  // Verificar que el partido existe
  const match = staticMatches.find((m) => m.id === staticMatchId);
  if (!match) {
    return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
  }

  // Mock mode
  if (process.env.MOCK_LIVE === 'true') {
    return NextResponse.json({ data: getMockDetail(staticMatchId), mock: true });
  }

  // Solo buscar en la API si el partido ya comenzó (por tiempo, no por status estático)
  const matchStarted = new Date() >= new Date(match.date);
  if (!matchStarted) {
    return NextResponse.json({ data: null, reason: 'not_started' });
  }

  try {
    const isFinished = match.status === 'finished';
    const ttl = isFinished ? TTL.MATCH_FINISHED : TTL.MATCH_LIVE;

    // Intentar ESPN primero (no requiere key, tiene datos live reales)
    try {
      const detail = await getESPNMatchDetail(staticMatchId);
      console.log(`[detail] espn ok: ${detail.events.length} events`);
      const res = NextResponse.json({ data: detail });
      // No cachear en edge mientras el partido está en vivo — cada request va al origen
      if (isFinished) {
        res.headers.set('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`);
      } else {
        res.headers.set('Cache-Control', 'no-store');
      }
      return res;
    } catch (espnErr) {
      console.error('[detail] espn failed:', espnErr instanceof Error ? espnErr.message : espnErr);
    }

    // Fallback: football-data.org
    const detail = await getMatchDetail(staticMatchId);
    return NextResponse.json({ data: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[detail] all sources failed:', message);
    return NextResponse.json({ data: null, error: message }, { status: 200 });
  }
}

import { staticMatches } from '@/lib/fixtures-static';
import { TLA_TO_CODE, type LiveScore } from '@/lib/live';

const BASE = 'https://api-football-v1.p.rapidapi.com/v3';

interface AFStatus { short: string; elapsed: number | null; }
interface AFFixture {
  fixture: { id: number; status: AFStatus };
  teams: { home: { code: string; name: string }; away: { code: string; name: string } };
  goals: { home: number | null; away: number | null };
}

function mapStatus(short: string): LiveScore['status'] {
  if (short === '1H' || short === '2H' || short === 'ET') return 'IN_PLAY';
  if (short === 'HT' || short === 'BT') return 'PAUSED';
  if (short === 'FT' || short === 'AET' || short === 'PEN') return 'FINISHED';
  return 'SUSPENDED';
}

export async function getAPIFootballLive(): Promise<LiveScore[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY not configured');

  const res = await fetch(`${BASE}/fixtures?live=all`, {
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': key,
    },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`api-football ${res.status}: ${await res.text().then(t => t.slice(0, 100))}`);

  const json = await res.json() as { response: AFFixture[] };
  const fixtures = json.response ?? [];

  console.log('[af] live fixtures total:', fixtures.length, '| teams:', fixtures.map(f => f.teams.home.code + 'v' + f.teams.away.code).join(','));

  const scores: LiveScore[] = [];

  for (const f of fixtures) {
    const homeCode = TLA_TO_CODE[f.teams.home.code] ?? f.teams.home.code;
    const awayCode = TLA_TO_CODE[f.teams.away.code] ?? f.teams.away.code;

    const staticMatch = staticMatches.find(
      (m) => m.homeTeamCode === homeCode && m.awayTeamCode === awayCode
    );

    if (!staticMatch) continue;

    scores.push({
      staticMatchId: staticMatch.id,
      homeScore: f.goals.home ?? 0,
      awayScore: f.goals.away ?? 0,
      minute: f.fixture.status.elapsed ?? 0,
      injuryTime: 0,
      status: mapStatus(f.fixture.status.short),
    });
  }

  return scores;
}

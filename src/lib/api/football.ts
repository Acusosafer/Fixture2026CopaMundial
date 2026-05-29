import { cached } from '@/lib/cache/kv';
import { TTL } from '@/lib/cache/ttls';

const API_BASE = 'https://free-api-live-football-data.p.rapidapi.com';

function getHeaders() {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST ?? 'free-api-live-football-data.p.rapidapi.com';
  if (!key) throw new Error('RAPIDAPI_KEY no configurado');
  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': host,
    'Content-Type': 'application/json',
  };
}

async function apiFetch(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Football API ${res.status}: ${path}`);
  return res.json();
}

// ─── Live matches ────────────────────────────────────────────
// Endpoint: GET /football-current-live
// Returns all currently live matches across all leagues.
// We filter for World Cup (FIFA / World Cup in league name).
export async function getLiveMatches() {
  return cached(
    'matches:live',
    TTL.MATCH_LIVE,
    () => apiFetch('/football-current-live')
  );
}

// ─── Leagues (to find World Cup league ID) ──────────────────
export async function getLeagues() {
  return cached(
    'leagues:all',
    TTL.FIXTURE_ALL,
    () => apiFetch('/football-get-all-leagues')
  );
}

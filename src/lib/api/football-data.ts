import { staticMatches } from '@/lib/fixtures-static';
import { TLA_TO_CODE, type LiveScore, type MatchDetail, type MatchEvent, type TeamLineup, type MatchStats, type HeadToHead, type H2HMatch } from '@/lib/live';

const BASE = 'https://api.football-data.org/v4';
const WC   = 'WC';

// ─── Raw types from football-data.org v4 ────────────────────

interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
}

interface FDScore {
  winner: string | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

interface FDGoal {
  minute: number;
  injuryTime: number | null;
  type: 'NORMAL' | 'OWN' | 'PENALTY';
  team: FDTeam;
  scorer: { id: number; name: string } | null;
  assist: { id: number; name: string } | null;
}

interface FDBooking {
  minute: number;
  injuryTime: number | null;
  team: FDTeam;
  player: { id: number; name: string } | null;
  card: 'YELLOW' | 'RED' | 'YELLOW_RED';
}

interface FDSubstitution {
  minute: number;
  injuryTime?: number | null;
  team: FDTeam;
  playerOut: { id: number; name: string } | null;
  playerIn: { id: number; name: string } | null;
}

interface FDLineupPlayer {
  player: { name: string };
  position: string;
  shirtNumber: number;
}

interface FDLineup {
  team: FDTeam;
  formation: string;
  startingXI: FDLineupPlayer[];
  substitutes: FDLineupPlayer[];
}

interface FDStat {
  type: string;
  home: number | string | null;
  away: number | string | null;
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  minute?: number | null;
  injuryTime?: number | null;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
  goals?: FDGoal[];
  bookings?: FDBooking[];
  substitutions?: FDSubstitution[];
  lineups?: FDLineup[];
  homeStatistics?: FDStat[];
  awayStatistics?: FDStat[];
  statistics?: FDStat[];  // some endpoints return combined
}

interface FDH2HResponse {
  aggregates: {
    numberOfMatches: number;
    homeTeam: { wins: number; draws: number; losses: number };
    awayTeam: { wins: number; draws: number; losses: number };
  };
  matches: FDMatch[];
}

// ─── Fetch helpers ───────────────────────────────────────────

function getToken(): string {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) throw new Error('FOOTBALL_DATA_API_KEY no configurado');
  return token;
}

async function fdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': getToken() },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 0 },
  });

  if (res.status === 429) throw new Error('Rate limit football-data.org');
  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`);

  return res.json() as Promise<T>;
}

// ─── Status helpers ──────────────────────────────────────────

function isFDLive(status: string): boolean {
  return status === 'IN_PLAY' || status === 'PAUSED';
}

function isFDFinished(status: string): boolean {
  return status === 'FINISHED';
}

function mapFDStatus(status: string): LiveScore['status'] {
  if (status === 'IN_PLAY')  return 'IN_PLAY';
  if (status === 'PAUSED')   return 'PAUSED';
  if (status === 'FINISHED') return 'FINISHED';
  return 'SUSPENDED';
}

// ─── Static match lookup ─────────────────────────────────────

function findStaticMatch(homeTLA: string, awayTLA: string): number | null {
  const homeCode = TLA_TO_CODE[homeTLA] ?? homeTLA;
  const awayCode = TLA_TO_CODE[awayTLA] ?? awayTLA;
  const found = staticMatches.find(
    (m) => m.homeTeamCode === homeCode && m.awayTeamCode === awayCode
  );
  return found?.id ?? null;
}

// ─── Event normalizers ───────────────────────────────────────

function normalizeGoal(g: FDGoal, homeId: number): MatchEvent {
  const type = g.type === 'OWN' ? 'OWN_GOAL' : g.type === 'PENALTY' ? 'PENALTY' : 'GOAL';
  return {
    type,
    minute: g.minute,
    injuryTime: g.injuryTime ?? 0,
    team: g.team.id === homeId ? 'home' : 'away',
    playerName: g.scorer?.name ?? '',
    assistName: g.assist?.name ?? undefined,
  };
}

function normalizeBooking(b: FDBooking, homeId: number): MatchEvent {
  const type = b.card === 'RED' ? 'RED_CARD' : b.card === 'YELLOW_RED' ? 'YELLOW_RED_CARD' : 'YELLOW_CARD';
  return {
    type,
    minute: b.minute,
    injuryTime: b.injuryTime ?? 0,
    team: b.team.id === homeId ? 'home' : 'away',
    playerName: b.player?.name ?? '',
  };
}

function normalizeSubstitution(s: FDSubstitution, homeId: number): MatchEvent {
  return {
    type: 'SUBSTITUTION',
    minute: s.minute,
    injuryTime: s.injuryTime ?? 0,
    team: s.team.id === homeId ? 'home' : 'away',
    playerName: s.playerOut?.name ?? '',
    playerInName: s.playerIn?.name ?? undefined,
  };
}

function normalizeLineup(fdLineup: FDLineup): TeamLineup {
  return {
    formation: fdLineup.formation,
    startingXI: fdLineup.startingXI.map((p) => ({
      name: p.player.name,
      number: p.shirtNumber,
      position: p.position,
    })),
    substitutes: fdLineup.substitutes.map((p) => ({
      name: p.player.name,
      number: p.shirtNumber,
      position: p.position,
    })),
  };
}

function statValue(stats: FDStat[] | undefined, type: string): number | null {
  if (!stats) return null;
  const s = stats.find((x) => x.type === type);
  if (!s) return null;
  const val = typeof s.home === 'string' ? parseFloat(s.home) : (s.home ?? null);
  return isNaN(val as number) ? null : val;
}

function normalizeStats(detail: FDMatch): MatchStats | null {
  // football-data.org v4 may return homeStatistics / awayStatistics arrays
  const hs = detail.homeStatistics;
  const as_ = detail.awayStatistics;

  if (!hs && !as_) return null;

  function pair(type: string): { home: number; away: number } | null {
    const h = statValue(hs, type);
    const a = statValue(as_, type);
    if (h === null && a === null) return null;
    return { home: h ?? 0, away: a ?? 0 };
  }

  return {
    possession:     pair('Ball Possession') ?? pair('Possession'),
    shots:          pair('Total Shots') ?? pair('Shots Total'),
    shotsOnTarget:  pair('Shots on Target') ?? pair('Shots On Goal'),
    corners:        pair('Corner Kicks') ?? pair('Corners'),
    fouls:          pair('Fouls'),
    offsides:       pair('Offsides'),
    yellowCards:    pair('Yellow Cards'),
    redCards:       pair('Red Cards'),
  };
}

// ─── Public API ──────────────────────────────────────────────

export async function getWCLiveScores(): Promise<LiveScore[]> {
  const [liveData, todayData] = await Promise.allSettled([
    fdFetch<{ matches: FDMatch[] }>(`/competitions/${WC}/matches?status=IN_PLAY,PAUSED`),
    fdFetch<{ matches: FDMatch[] }>(`/competitions/${WC}/matches?status=FINISHED&limit=10`),
  ]);

  const matches: FDMatch[] = [];

  if (liveData.status === 'fulfilled') {
    matches.push(...liveData.value.matches.filter((m) => isFDLive(m.status)));
  }
  if (todayData.status === 'fulfilled') {
    const todayUTC = new Date().toISOString().slice(0, 10);
    matches.push(
      ...todayData.value.matches.filter(
        (m) => isFDFinished(m.status) && m.utcDate.startsWith(todayUTC)
      )
    );
  }

  const scores: LiveScore[] = [];

  for (const m of matches) {
    const staticMatchId = findStaticMatch(m.homeTeam.tla, m.awayTeam.tla);
    if (staticMatchId === null) continue;

    scores.push({
      staticMatchId,
      fdMatchId: m.id,
      homeScore: m.score.fullTime.home ?? 0,
      awayScore: m.score.fullTime.away ?? 0,
      minute: m.minute ?? 0,
      injuryTime: m.injuryTime ?? 0,
      status: mapFDStatus(m.status),
    });
  }

  return scores;
}

// Fetches full match detail (events + lineups) for a specific WC match.
// staticMatchId is our internal ID; we find the fd match by teams.
export async function getMatchDetail(staticMatchId: number): Promise<MatchDetail> {
  const staticMatch = staticMatches.find((m) => m.id === staticMatchId);
  if (!staticMatch) throw new Error(`staticMatch ${staticMatchId} not found`);

  // Find the football-data.org match ID by scanning WC matches
  const all = await fdFetch<{ matches: FDMatch[] }>(`/competitions/${WC}/matches`);
  const homeCode = staticMatch.homeTeamCode;
  const awayCode = staticMatch.awayTeamCode;

  const fdMatch = all.matches.find((m) => {
    const h = TLA_TO_CODE[m.homeTeam.tla] ?? m.homeTeam.tla;
    const a = TLA_TO_CODE[m.awayTeam.tla] ?? m.awayTeam.tla;
    return h === homeCode && a === awayCode;
  });

  if (!fdMatch) throw new Error(`Match ${staticMatchId} not found in football-data.org`);

  // Fetch full detail with events + lineups
  const detail = await fdFetch<FDMatch>(`/matches/${fdMatch.id}`);

  const homeId = detail.homeTeam.id;
  const events: MatchEvent[] = [
    ...(detail.goals ?? []).map((g) => normalizeGoal(g, homeId)),
    ...(detail.bookings ?? []).map((b) => normalizeBooking(b, homeId)),
    ...(detail.substitutions ?? []).map((s) => normalizeSubstitution(s, homeId)),
  ].sort((a, b) => a.minute - b.minute || a.injuryTime - b.injuryTime);

  const [homeLineupFD, awayLineupFD] = detail.lineups ?? [];

  return {
    staticMatchId,
    fdMatchId: detail.id,
    events,
    homeLineup: homeLineupFD ? normalizeLineup(homeLineupFD) : null,
    awayLineup: awayLineupFD ? normalizeLineup(awayLineupFD) : null,
    stats: normalizeStats(detail),
  };
}

// Fetches head-to-head history between two teams for a specific match.
export async function getH2H(staticMatchId: number): Promise<HeadToHead> {
  const staticMatch = staticMatches.find((m) => m.id === staticMatchId);
  if (!staticMatch) throw new Error(`staticMatch ${staticMatchId} not found`);

  // Find the fd match ID first (same logic as getMatchDetail)
  const all = await fdFetch<{ matches: FDMatch[] }>(`/competitions/${WC}/matches`);
  const homeCode = staticMatch.homeTeamCode;
  const awayCode = staticMatch.awayTeamCode;

  const fdMatch = all.matches.find((m) => {
    const h = TLA_TO_CODE[m.homeTeam.tla] ?? m.homeTeam.tla;
    const a = TLA_TO_CODE[m.awayTeam.tla] ?? m.awayTeam.tla;
    return h === homeCode && a === awayCode;
  });

  if (!fdMatch) throw new Error(`Match ${staticMatchId} not found for H2H`);

  const h2h = await fdFetch<FDH2HResponse>(`/matches/${fdMatch.id}/head2head?limit=5`);

  const matches: H2HMatch[] = h2h.matches.map((m) => ({
    date: m.utcDate,
    homeTeamCode: TLA_TO_CODE[m.homeTeam.tla] ?? m.homeTeam.tla,
    awayTeamCode: TLA_TO_CODE[m.awayTeam.tla] ?? m.awayTeam.tla,
    homeScore: m.score.fullTime.home ?? 0,
    awayScore: m.score.fullTime.away ?? 0,
    competition: '',
  }));

  return {
    staticMatchId,
    totalMatches: h2h.aggregates.numberOfMatches,
    homeWins: h2h.aggregates.homeTeam.wins,
    awayWins: h2h.aggregates.awayTeam.wins,
    draws: h2h.aggregates.homeTeam.draws,
    matches,
  };
}

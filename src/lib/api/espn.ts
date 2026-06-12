import { staticMatches } from '@/lib/fixtures-static';
import { TLA_TO_CODE, type LiveScore, type MatchDetail, type MatchEvent, type MatchStats, type TeamLineup } from '@/lib/live';

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const WC_SLUGS = ['fifa.world', 'world.cup'];

// ── Raw ESPN types ────────────────────────────────────────────

interface ESPNTeam { id: string; abbreviation: string; displayName: string; }
interface ESPNCompetitor { homeAway: 'home' | 'away'; team: ESPNTeam; score: string; }
interface ESPNStatusType { state: string; completed: boolean; name?: string; description?: string; }
interface ESPNStatus { type: ESPNStatusType; displayClock: string; clock: number; period: number; }
interface ESPNEvent { id: string; status: ESPNStatus; competitions: Array<{ competitors: ESPNCompetitor[] }>; }

interface ESPNKeyEvent {
  id: string;
  type: { id: string; text: string; type: string };
  text?: string;
  period?: { number: number };
  clock?: { value: number; displayValue: string };
  team?: { id: string; displayName: string };
  participants?: Array<{ athlete?: { id: string; displayName: string } }>;
  scoringPlay?: boolean;
}

interface ESPNRosterEntry {
  starter: boolean;
  jersey: string;
  subbedIn?: boolean;
  subbedOut?: boolean;
  athlete: { displayName: string };
  position?: { name: string; abbreviation: string };
}

interface ESPNRoster {
  homeAway: 'home' | 'away';
  team: { id: string; displayName: string };
  formation?: string;
  roster?: ESPNRosterEntry[];
}

interface ESPNStat { name: string; displayValue: string; value?: number; }
interface ESPNTeamStats { team: { id: string; displayName: string }; statistics?: ESPNStat[]; }

interface ESPNSummary {
  keyEvents?: ESPNKeyEvent[];
  commentary?: Array<{ type?: { text: string }; clock?: { displayValue: string }; team?: { id: string }; participants?: ESPNKeyEvent['participants']; text?: string }>;
  rosters?: ESPNRoster[];
  boxscore?: { teams?: ESPNTeamStats[] };
}

// ── Helpers ───────────────────────────────────────────────────

const ESPN_FINISHED_TYPES = new Set([
  'STATUS_FINAL', 'STATUS_FULL_TIME', 'STATUS_END_PERIOD',
  'STATUS_ABANDONED', 'STATUS_POSTPONED', 'STATUS_CANCELLED',
]);

function mapESPNStatus(state: string, completed: boolean, typeName?: string, description?: string): LiveScore['status'] {
  if (completed || state === 'post' || (typeName && ESPN_FINISHED_TYPES.has(typeName))) return 'FINISHED';
  // ESPN uses state='in' for BOTH in-play and halftime; distinguish via type.name or description
  if (typeName === 'STATUS_HALFTIME' || state === 'halftime' || description?.toLowerCase() === 'halftime') return 'PAUSED';
  if (state === 'in') return 'IN_PLAY';
  return 'SUSPENDED';
}

function parseESPNClock(clock: number, displayClock: string, period: number): number {
  // clock = total elapsed seconds from match kickoff (cumulative across periods)
  if (clock > 0) return Math.floor(clock / 60);
  // fallback: displayClock is "mm:ss" elapsed in current period
  const m = parseInt(displayClock?.split(':')[0] ?? displayClock?.replace("'", '') ?? '0', 10);
  return period >= 2 ? 45 + (m || 0) : m || 0;
}

// Parse "9'" → 9, "45+2'" → 45, "67:34" → 67
function parseDisplayMinute(displayValue: string): number {
  if (!displayValue) return 0;
  const clean = displayValue.replace("'", '').split('+')[0].split(':')[0];
  return parseInt(clean, 10) || 0;
}

function mapKeyEventType(typeStr: string): MatchEvent['type'] | null {
  switch (typeStr) {
    case 'goal': return 'GOAL';
    case 'own-goal': return 'OWN_GOAL';
    case 'penalty-goal': return 'PENALTY';
    case 'yellow-card': return 'YELLOW_CARD';
    case 'yellow-red-card': return 'YELLOW_RED_CARD';
    case 'red-card': return 'RED_CARD';
    case 'substitution': return 'SUBSTITUTION';
    default: return null;
  }
}

async function espnFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(7000),
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`ESPN ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

// ── Find ESPN event for a static match ───────────────────────

async function findESPNEvent(staticMatchId: number): Promise<{ slug: string; event: ESPNEvent } | null> {
  const sm = staticMatches.find(m => m.id === staticMatchId);
  if (!sm) return null;

  for (const slug of WC_SLUGS) {
    try {
      const data = await espnFetch<{ events?: ESPNEvent[] }>(`${BASE}/${slug}/scoreboard`);
      const ev = (data.events ?? []).find(e => {
        const comp = e.competitions?.[0];
        const home = comp?.competitors.find(c => c.homeAway === 'home');
        const away = comp?.competitors.find(c => c.homeAway === 'away');
        const hc = TLA_TO_CODE[home?.team.abbreviation ?? ''] ?? home?.team.abbreviation;
        const ac = TLA_TO_CODE[away?.team.abbreviation ?? ''] ?? away?.team.abbreviation;
        return hc === sm.homeTeamCode && ac === sm.awayTeamCode;
      });
      if (ev) return { slug, event: ev };
    } catch { /* try next slug */ }
  }
  return null;
}

// ── Public: live scores ───────────────────────────────────────

export async function getESPNLive(): Promise<LiveScore[]> {
  for (const slug of WC_SLUGS) {
    try {
      const data = await espnFetch<{ events?: ESPNEvent[] }>(`${BASE}/${slug}/scoreboard`);
      const events = data.events ?? [];
      const scores: LiveScore[] = [];

      for (const ev of events) {
        const comp = ev.competitions?.[0];
        const home = comp?.competitors.find(c => c.homeAway === 'home');
        const away = comp?.competitors.find(c => c.homeAway === 'away');
        if (!home || !away) continue;

        const homeCode = TLA_TO_CODE[home.team.abbreviation] ?? home.team.abbreviation;
        const awayCode = TLA_TO_CODE[away.team.abbreviation] ?? away.team.abbreviation;
        const sm = staticMatches.find(m => m.homeTeamCode === homeCode && m.awayTeamCode === awayCode);
        if (!sm) continue;

        const { state, completed, name: typeName, description } = ev.status.type;
        if (state === 'pre') continue;

        const minute = parseESPNClock(ev.status.clock, ev.status.displayClock, ev.status.period);

        scores.push({
          staticMatchId: sm.id,
          homeScore: parseInt(home.score, 10) || 0,
          awayScore: parseInt(away.score, 10) || 0,
          minute,
          injuryTime: 0,
          status: mapESPNStatus(state, completed, typeName, description),
        });
      }

      if (scores.length > 0) {
        console.log(`[espn] live: ${scores.map(s => `match${s.staticMatchId}=${s.homeScore}-${s.awayScore}@${s.minute}'`).join(', ')}`);
      }
      return scores;
    } catch (e) {
      console.error(`[espn] ${slug} live error:`, e instanceof Error ? e.message : e);
    }
  }
  return [];
}

// ── Public: full match detail ─────────────────────────────────

export async function getESPNMatchDetail(staticMatchId: number): Promise<MatchDetail> {
  const sm = staticMatches.find(m => m.id === staticMatchId);
  if (!sm) throw new Error(`staticMatch ${staticMatchId} not found`);

  const found = await findESPNEvent(staticMatchId);
  if (!found) throw new Error(`ESPN event not found for match ${staticMatchId}`);

  const { slug, event } = found;
  const comp = event.competitions[0];
  const homeComp = comp.competitors.find(c => c.homeAway === 'home');
  const awayComp = comp.competitors.find(c => c.homeAway === 'away');
  const homeId = homeComp?.team.id ?? '';
  const awayId = awayComp?.team.id ?? '';

  const summary = await espnFetch<ESPNSummary>(`${BASE}/${slug}/summary?event=${event.id}`);

  // ── Parse events from keyEvents ───────────────────────────
  const events: MatchEvent[] = [];

  for (const ke of summary.keyEvents ?? []) {
    let eventType = mapKeyEventType(ke.type.type);

    // Fallback: ESPN marks goals with scoringPlay=true even when type.type differs
    if (!eventType && ke.scoringPlay) {
      eventType = ke.type.type === 'penalty-scored' ? 'PENALTY' : 'GOAL';
    }

    if (!eventType) {
      // Log unknown types so we can catch future gaps
      console.log(`[espn] unknown keyEvent type: "${ke.type.type}" (scoringPlay=${ke.scoringPlay}) text="${ke.type.text}"`);
      continue;
    }

    const minute = parseDisplayMinute(ke.clock?.displayValue ?? '');
    const isHome = ke.team?.id === homeId;
    const team: 'home' | 'away' = isHome ? 'home' : 'away';
    const parts = ke.participants ?? [];

    if (eventType === 'SUBSTITUTION') {
      events.push({
        type: 'SUBSTITUTION', minute, injuryTime: 0, team,
        playerName: parts[0]?.athlete?.displayName ?? '',
        playerInName: parts[1]?.athlete?.displayName ?? '',
      });
    } else if (eventType === 'GOAL' || eventType === 'OWN_GOAL' || eventType === 'PENALTY') {
      events.push({
        type: eventType, minute, injuryTime: 0, team,
        playerName: parts[0]?.athlete?.displayName ?? '',
        assistName: parts[1]?.athlete?.displayName,
      });
    } else {
      events.push({
        type: eventType, minute, injuryTime: 0, team,
        playerName: parts[0]?.athlete?.displayName ?? '',
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  // ── Parse lineups from rosters ────────────────────────────
  function parseRoster(espnRoster: ESPNRoster | undefined): TeamLineup | null {
    if (!espnRoster) return null;
    const entries = espnRoster.roster ?? [];
    const starters = entries.filter(e => e.starter).slice(0, 11);
    const subs = entries.filter(e => !e.starter);
    return {
      formation: espnRoster.formation ?? '',
      startingXI: starters.map(e => ({
        name: e.athlete.displayName,
        number: parseInt(e.jersey, 10) || 0,
        position: e.position?.name ?? '',
      })),
      substitutes: subs.map(e => ({
        name: e.athlete.displayName,
        number: parseInt(e.jersey, 10) || 0,
        position: e.position?.name ?? '',
      })),
    };
  }

  const homeRoster = (summary.rosters ?? []).find(r => r.homeAway === 'home');
  const awayRoster = (summary.rosters ?? []).find(r => r.homeAway === 'away');

  // ── Parse stats from boxscore.teams ──────────────────────
  function parseStats(): MatchStats | null {
    const bsTeams = summary.boxscore?.teams ?? [];
    if (bsTeams.length < 2) return null;
    const hStats = bsTeams.find(t => t.team.id === homeId)?.statistics ?? [];
    const aStats = bsTeams.find(t => t.team.id === awayId)?.statistics ?? [];

    function getStat(stats: ESPNStat[], name: string): number | null {
      const s = stats.find(x => x.name === name);
      if (!s) return null;
      return s.value ?? parseFloat(s.displayValue) ?? null;
    }

    function pair(name: string): { home: number; away: number } | null {
      const h = getStat(hStats, name);
      const a = getStat(aStats, name);
      if (h === null && a === null) return null;
      return { home: h ?? 0, away: a ?? 0 };
    }

    return {
      possession:    pair('possessionPct'),
      shots:         pair('totalShots'),
      shotsOnTarget: pair('shotsOnTarget'),
      corners:       pair('wonCorners'),
      fouls:         pair('foulsCommitted'),
      offsides:      pair('offsides'),
      yellowCards:   pair('yellowCards'),
      redCards:      pair('redCards'),
    };
  }

  console.log(`[espn] detail match${staticMatchId}: ${events.length} events, lineups: ${homeRoster ? 'ok' : 'null'}/${awayRoster ? 'ok' : 'null'}`);

  return {
    staticMatchId,
    fdMatchId: 0,
    events,
    homeLineup: parseRoster(homeRoster),
    awayLineup: parseRoster(awayRoster),
    stats: parseStats(),
  };
}

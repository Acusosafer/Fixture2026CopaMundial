import { staticMatches } from '@/lib/fixtures-static';
import { PREDICTED_TEAMS } from '@/lib/bracket-predictions';
import { TLA_TO_CODE, type LiveScore, type MatchDetail, type MatchEvent, type MatchStats, type TeamLineup } from '@/lib/live';

// Reverse map: teamCode → slot code (e.g. 'ZA' → '2A') for matching R32 bracket slots
const TEAM_TO_SLOT = new Map<string, string>(
  Object.entries(PREDICTED_TEAMS).map(([slot, team]) => [team, slot])
);

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const WC_SLUGS = ['fifa.world', 'world.cup'];

// ── Raw ESPN types ────────────────────────────────────────────

interface ESPNTeam { id: string; abbreviation: string; displayName: string; }
interface ESPNCompetitor { homeAway: 'home' | 'away'; team: ESPNTeam; score: string; }
interface ESPNStatusType { state: string; completed: boolean; name?: string; description?: string; }
interface ESPNStatus { type: ESPNStatusType; displayClock: string; clock: number; period: number; }
interface ESPNEvent { id: string; date?: string; status: ESPNStatus; competitions: Array<{ competitors: ESPNCompetitor[] }>; }

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

// STATUS_END_PERIOD is NOT a match end — it's the break between ET halves
const ESPN_FINISHED_TYPES = new Set([
  'STATUS_FINAL', 'STATUS_FULL_TIME',
  'STATUS_ABANDONED', 'STATUS_POSTPONED', 'STATUS_CANCELLED',
]);

// Minutes at which each period ends (used to calculate injury time)
const PERIOD_MAX: Record<number, number> = { 1: 45, 2: 90, 3: 105, 4: 120 };
// Minutes elapsed at the start of each period (for displayClock fallback)
const PERIOD_BASE: Record<number, number> = { 1: 0, 2: 45, 3: 90, 4: 105, 5: 120 };

function mapESPNStatus(
  state: string, completed: boolean, typeName?: string, description?: string, period?: number
): LiveScore['status'] {
  if (completed || state === 'post' || (typeName && ESPN_FINISHED_TYPES.has(typeName))) return 'FINISHED';
  if (typeName === 'STATUS_HALFTIME' || state === 'halftime' || description?.toLowerCase() === 'halftime') {
    return (period && period >= 3) ? 'PAUSED_ET' : 'PAUSED';
  }
  if (typeName === 'STATUS_END_PERIOD') return 'PAUSED_ET';
  if (state === 'in') {
    if (period === 5) return 'PENALTIES';
    if (period === 3 || period === 4) return 'EXTRA_TIME';
    return 'IN_PLAY';
  }
  return 'SUSPENDED';
}

function parseESPNTime(clock: number, displayClock: string, period: number): { minute: number; injuryTime: number } {
  // ESPN manda displayClock como "90'+7'" (con apóstrofo) o "90+6" durante tiempo adicional
  const injuryMatch = displayClock?.match(/^(\d+)'?\+(\d+)/);
  if (injuryMatch) {
    return { minute: parseInt(injuryMatch[1], 10), injuryTime: parseInt(injuryMatch[2], 10) };
  }

  let total: number;
  if (clock > 0) {
    // Si clock es por período (resetea cada mitad): sumar base del período
    // Si clock es acumulado: usar directo
    // Detectamos: si clock < PERIOD_BASE[period]*60 es probable que sea por período
    const base = PERIOD_BASE[period] ?? 0;
    const clockMinutes = Math.floor(clock / 60);
    total = clockMinutes < base ? base + clockMinutes : clockMinutes;
  } else {
    const base = PERIOD_BASE[period] ?? 0;
    const m = parseInt(displayClock?.split(':')[0] ?? displayClock?.replace("'", '') ?? '0', 10);
    total = base + (m || 0);
  }

  const max = PERIOD_MAX[period];
  if (max !== undefined && total > max) {
    return { minute: max, injuryTime: total - max };
  }
  return { minute: total, injuryTime: 0 };
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

// ── Date helpers ─────────────────────────────────────────────

// Dates that have knockout stage matches (R32 onwards).
// Para el bracket necesitamos TODOS los resultados históricos (no solo ±2 días)
// porque los ganadores de cruces anteriores alimentan las llaves siguientes.
function getRelevantDates(): string[] {
  const matchDates = new Set<string>();
  const now = new Date();

  for (const m of staticMatches) {
    if (!['R32', 'R16', 'QF', 'SF', 'TPO', 'FIN'].includes(m.group ?? '')) continue;
    const d = new Date(m.date);
    const diffDays = (d.getTime() - now.getTime()) / 86400000;
    // Pasado: incluir siempre (necesitamos todos los resultados para resolver el bracket)
    // Futuro: hasta 3 días adelante (partidos próximos / en vivo)
    if (diffDays <= 3) {
      const y = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      matchDates.add(`${y}${mo}${day}`);
    }
  }

  return [...matchDates];
}

function parseESPNEvents(events: ESPNEvent[]): LiveScore[] {
  const scores: LiveScore[] = [];
  for (const ev of events) {
    const comp = ev.competitions?.[0];
    const home = comp?.competitors.find(c => c.homeAway === 'home');
    const away = comp?.competitors.find(c => c.homeAway === 'away');
    if (!home || !away) continue;

    const homeCode = TLA_TO_CODE[home.team.abbreviation] ?? home.team.abbreviation;
    const awayCode = TLA_TO_CODE[away.team.abbreviation] ?? away.team.abbreviation;
    const homeSlot = TEAM_TO_SLOT.get(homeCode);
    const awaySlot = TEAM_TO_SLOT.get(awayCode);
    let sm = staticMatches.find(m =>
      (m.homeTeamCode === homeCode && m.awayTeamCode === awayCode) ||
      (homeSlot && awaySlot && m.homeTeamCode === homeSlot && m.awayTeamCode === awaySlot)
    );
    // Fallback para R16+: los equipos son dinámicos (W73, W75...) — matchear por fecha/hora
    if (!sm && ev.date) {
      const evMs = new Date(ev.date).getTime();
      sm = staticMatches.find(m => {
        if (!['R16', 'QF', 'SF', 'TPO', 'FIN'].includes(m.group)) return false;
        return Math.abs(new Date(m.date).getTime() - evMs) < 3600000; // ±1 hora
      });
    }
    if (!sm) continue;

    const { state, completed, name: typeName, description } = ev.status.type;
    if (state === 'pre') continue;

    // Log raw clock data para diagnosticar injury time
    if (state === 'in') {
      console.log(`[espn] clock raw: match=${sm.id} period=${ev.status.period} clock=${ev.status.clock} displayClock="${ev.status.displayClock}" typeName=${typeName}`);
    }

    const { minute, injuryTime } = parseESPNTime(ev.status.clock, ev.status.displayClock, ev.status.period);
    scores.push({
      staticMatchId: sm.id,
      homeScore: parseInt(home.score, 10) || 0,
      awayScore: parseInt(away.score, 10) || 0,
      minute,
      injuryTime,
      status: mapESPNStatus(state, completed, typeName, description, ev.status.period),
    });
  }
  return scores;
}

// ── Find ESPN event for a static match ───────────────────────

async function findESPNEvent(staticMatchId: number): Promise<{ slug: string; event: ESPNEvent } | null> {
  const sm = staticMatches.find(m => m.id === staticMatchId);
  if (!sm) return null;

  // Match date as YYYYMMDD for targeted fetch
  const matchDate = new Date(sm.date);
  const matchDateStr = `${matchDate.getUTCFullYear()}${String(matchDate.getUTCMonth() + 1).padStart(2, '0')}${String(matchDate.getUTCDate()).padStart(2, '0')}`;

  for (const slug of WC_SLUGS) {
    // Try the match's specific date first, then today's scoreboard
    for (const dateParam of [matchDateStr, '']) {
      try {
        const url = dateParam
          ? `${BASE}/${slug}/scoreboard?dates=${dateParam}`
          : `${BASE}/${slug}/scoreboard`;
        const data = await espnFetch<{ events?: ESPNEvent[] }>(url);
        const ev = (data.events ?? []).find(e => {
          const comp = e.competitions?.[0];
          const home = comp?.competitors.find(c => c.homeAway === 'home');
          const away = comp?.competitors.find(c => c.homeAway === 'away');
          const hc = TLA_TO_CODE[home?.team.abbreviation ?? ''] ?? home?.team.abbreviation;
          const ac = TLA_TO_CODE[away?.team.abbreviation ?? ''] ?? away?.team.abbreviation;
          return hc === sm.homeTeamCode && ac === sm.awayTeamCode;
        });
        if (ev) return { slug, event: ev };
      } catch { /* try next */ }
    }
  }
  return null;
}

// ── Public: live scores ───────────────────────────────────────

// STATUS priority for deduplication across dates: IN_PLAY > PAUSED > FINISHED
const STATUS_PRIORITY: Record<LiveScore['status'], number> = {
  IN_PLAY: 3, EXTRA_TIME: 3, PENALTIES: 3, PAUSED: 2, PAUSED_ET: 2, FINISHED: 1, SUSPENDED: 0,
};

export async function getESPNLive(): Promise<LiveScore[]> {
  const dates = getRelevantDates();

  for (const slug of WC_SLUGS) {
    try {
      // Fetch historical dates + scoreboard sin ?dates (vista live de ESPN) en paralelo
      // El sin-fecha siempre devuelve partidos en vivo aunque el ?dates del día falle por rate-limit
      const results = await Promise.allSettled([
        ...dates.map(date =>
          espnFetch<{ events?: ESPNEvent[] }>(`${BASE}/${slug}/scoreboard?dates=${date}`)
        ),
        espnFetch<{ events?: ESPNEvent[] }>(`${BASE}/${slug}/scoreboard`),
      ]);

      const scoreMap = new Map<number, LiveScore>();

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const score of parseESPNEvents(result.value.events ?? [])) {
          const existing = scoreMap.get(score.staticMatchId);
          if (!existing || STATUS_PRIORITY[score.status] > STATUS_PRIORITY[existing.status]) {
            scoreMap.set(score.staticMatchId, score);
          }
        }
      }

      const scores = [...scoreMap.values()];
      if (scores.length > 0) {
        console.log(`[espn] live (${dates.length} dates): ${scores.map(s => `m${s.staticMatchId}=${s.homeScore}-${s.awayScore} ${s.status}`).join(', ')}`);
        return scores;
      }
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

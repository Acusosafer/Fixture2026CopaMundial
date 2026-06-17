import { staticMatches } from './fixtures-static';

// ─── Tipo normalizado de score en vivo ──────────────────────
export interface LiveScore {
  staticMatchId: number;
  fdMatchId?: number;
  homeScore: number;
  awayScore: number;
  minute: number;
  injuryTime: number;
  status: 'IN_PLAY' | 'PAUSED' | 'EXTRA_TIME' | 'PAUSED_ET' | 'PENALTIES' | 'FINISHED' | 'SUSPENDED';
}

// Helper: el partido está activo (no terminado ni suspendido)
export function isActiveStatus(status: LiveScore['status']): boolean {
  return status === 'IN_PLAY' || status === 'PAUSED' || status === 'EXTRA_TIME' || status === 'PAUSED_ET' || status === 'PENALTIES';
}

// ─── Eventos del partido ─────────────────────────────────────
export type MatchEventType =
  | 'GOAL' | 'OWN_GOAL' | 'PENALTY'
  | 'YELLOW_CARD' | 'RED_CARD' | 'YELLOW_RED_CARD'
  | 'SUBSTITUTION';

export interface MatchEvent {
  type: MatchEventType;
  minute: number;
  injuryTime: number;
  team: 'home' | 'away';
  playerName: string;
  assistName?: string;    // para goles
  playerInName?: string;  // para cambios (entra)
}

export interface LineupPlayer {
  name: string;
  number: number;
  position: string;
}

export interface TeamLineup {
  formation: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface MatchStats {
  possession: { home: number; away: number } | null;
  shots:       { home: number; away: number } | null;
  shotsOnTarget:{ home: number; away: number } | null;
  corners:     { home: number; away: number } | null;
  fouls:       { home: number; away: number } | null;
  offsides:    { home: number; away: number } | null;
  yellowCards: { home: number; away: number } | null;
  redCards:    { home: number; away: number } | null;
}

export interface MatchDetail {
  staticMatchId: number;
  fdMatchId: number;
  events: MatchEvent[];
  homeLineup: TeamLineup | null;
  awayLineup: TeamLineup | null;
  stats: MatchStats | null;
}

// ─── Head-to-head ─────────────────────────────────────────────
export interface H2HMatch {
  date: string;          // ISO date
  homeTeamCode: string;
  awayTeamCode: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

export interface HeadToHead {
  staticMatchId: number;
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  matches: H2HMatch[];   // last 5
}

// ─── Mapping TLA (football-data.org) → nuestro código ISO ───
// football-data.org usa abreviaciones de 3 letras (TLA).
// Nuestros equipos usan ISO 3166-1 alpha-2 (2 letras) con excepciones.
export const TLA_TO_CODE: Record<string, string> = {
  // América
  ARG: 'AR', BRA: 'BR', URU: 'UY', CHI: 'CL',
  COL: 'CO', PER: 'PE', ECU: 'EC', PAR: 'PY',
  MEX: 'MX', USA: 'US', CAN: 'CA', PAN: 'PA',
  JAM: 'JM', HON: 'HN', CRC: 'CR', HAI: 'HT', CUW: 'CW',
  // Europa
  FRA: 'FR', GER: 'DE', ESP: 'ES', POR: 'PT',
  NED: 'NL', BEL: 'BE', CRO: 'HR', SRB: 'RS',
  DEN: 'DK', ALB: 'AL', TUR: 'TR', BIH: 'BA', SWE: 'SE',
  SUI: 'CH', CZE: 'CZ', AUT: 'AT', POL: 'PL',
  ENG: 'GB-ENG', SCO: 'GB-SCT', WAL: 'GB-WLS',
  NOR: 'NO',
  // África
  MAR: 'MA', NGA: 'NG', SEN: 'SN', CMR: 'CM',
  CIV: 'CI', KEN: 'KE', TUN: 'TN', EGY: 'EG',
  RSA: 'ZA', ALG: 'DZ', DZA: 'DZ', GHA: 'GH',
  CPV: 'CV', COD: 'CD',
  // Asia / Oceanía
  JPN: 'JP', KOR: 'KR', AUS: 'AU', IDN: 'ID',
  IRN: 'IR', CHN: 'CN', THA: 'TH', UZB: 'UZ',
  BHR: 'BH', UAE: 'AE', SAU: 'SA', KSA: 'SA', QAT: 'QA',
  NZL: 'NZ', JOR: 'JO', IRQ: 'IQ',
};

// ─── Helper: ¿hay partidos del Mundial en las próximas 2h? ──
const TOURNAMENT_START = new Date('2026-06-11T00:00:00Z');
const TOURNAMENT_END   = new Date('2026-07-19T23:59:00Z');

export function isWithinTournament(now = new Date()): boolean {
  return now >= TOURNAMENT_START && now <= TOURNAMENT_END;
}

export function hasMatchSoon(now = new Date()): boolean {
  const windowMs = 2 * 60 * 60 * 1000; // ±2h
  return staticMatches.some((m) => {
    const d = new Date(m.date).getTime();
    return Math.abs(d - now.getTime()) <= windowMs;
  });
}

import type { HeadToHead } from '@/lib/live';

type StaticH2H = Omit<HeadToHead, 'staticMatchId'>;

// Historial oficial en Copas del Mundo para los 72 partidos de la fase de grupos.
// homeWins/awayWins desde la perspectiva del fixture 2026 (home/away del fixture actual).
// Fuente: historial_mundial_2026.json (generado 2026-05-29).
export const staticH2H: Record<number, StaticH2H> = {

  // ── Grupo A ──────────────────────────────────────────────────────────────

  // Fixture 1: MX(home) vs ZA(away) — 2010: 1-1 empate (partido inaugural)
  1: {
    totalMatches: 1, homeWins: 0, awayWins: 0, draws: 1,
    matches: [
      { date: '2010-06-11', homeTeamCode: 'MX', awayTeamCode: 'ZA', homeScore: 1, awayScore: 1, competition: 'Copa del Mundo Sudáfrica 2010 (Partido inaugural)' },
    ],
  },

  // Fixture 4: MX(home) vs KR(away) — 1998: 3-1 MX, 2018: 2-1 MX
  4: {
    totalMatches: 2, homeWins: 2, awayWins: 0, draws: 0,
    matches: [
      { date: '2018-06-23', homeTeamCode: 'MX', awayTeamCode: 'KR', homeScore: 2, awayScore: 1, competition: 'Copa del Mundo Rusia 2018' },
      { date: '1998-06-13', homeTeamCode: 'MX', awayTeamCode: 'KR', homeScore: 3, awayScore: 1, competition: 'Copa del Mundo Francia 1998' },
    ],
  },

  // ── Grupo C ──────────────────────────────────────────────────────────────

  // Fixture 13: BR(home) vs MA(away) — 1998: Brasil 3-0 Marruecos
  13: {
    totalMatches: 1, homeWins: 1, awayWins: 0, draws: 0,
    matches: [
      { date: '1998-06-16', homeTeamCode: 'BR', awayTeamCode: 'MA', homeScore: 3, awayScore: 0, competition: 'Copa del Mundo Francia 1998' },
    ],
  },

  // Fixture 15: GB-SCT(home) vs MA(away) — 1998: Marruecos 3-0 Escocia
  15: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '1998-06-23', homeTeamCode: 'MA', awayTeamCode: 'GB-SCT', homeScore: 3, awayScore: 0, competition: 'Copa del Mundo Francia 1998' },
    ],
  },

  // Fixture 17: GB-SCT(home) vs BR(away) — 4 partidos: BR gana 3, 1 empate
  17: {
    totalMatches: 4, homeWins: 0, awayWins: 3, draws: 1,
    matches: [
      { date: '1974-06-18', homeTeamCode: 'BR', awayTeamCode: 'GB-SCT', homeScore: 0, awayScore: 0, competition: 'Copa del Mundo Alemania 1974' },
      { date: '1982-06-18', homeTeamCode: 'BR', awayTeamCode: 'GB-SCT', homeScore: 4, awayScore: 1, competition: 'Copa del Mundo España 1982' },
      { date: '1990-06-20', homeTeamCode: 'BR', awayTeamCode: 'GB-SCT', homeScore: 1, awayScore: 0, competition: 'Copa del Mundo Italia 1990' },
      { date: '1998-06-10', homeTeamCode: 'BR', awayTeamCode: 'GB-SCT', homeScore: 2, awayScore: 1, competition: 'Copa del Mundo Francia 1998 (Partido inaugural)' },
    ],
  },

  // ── Grupo D ──────────────────────────────────────────────────────────────

  // Fixture 19: US(home) vs PY(away) — 1930: Estados Unidos 3-0 Paraguay
  19: {
    totalMatches: 1, homeWins: 1, awayWins: 0, draws: 0,
    matches: [
      { date: '1930-07-17', homeTeamCode: 'US', awayTeamCode: 'PY', homeScore: 3, awayScore: 0, competition: 'Copa del Mundo Uruguay 1930' },
    ],
  },

  // ── Grupo E ──────────────────────────────────────────────────────────────

  // Fixture 30: EC(home) vs DE(away) — 2006: Alemania 3-0 Ecuador
  30: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '2006-06-20', homeTeamCode: 'DE', awayTeamCode: 'EC', homeScore: 3, awayScore: 0, competition: 'Copa del Mundo Alemania 2006' },
    ],
  },

  // ── Grupo F ──────────────────────────────────────────────────────────────

  // Fixture 31: NL(home) vs JP(away) — 2010: Países Bajos 1-0 Japón
  31: {
    totalMatches: 1, homeWins: 1, awayWins: 0, draws: 0,
    matches: [
      { date: '2010-06-19', homeTeamCode: 'NL', awayTeamCode: 'JP', homeScore: 1, awayScore: 0, competition: 'Copa del Mundo Sudáfrica 2010' },
    ],
  },

  // Fixture 33: NL(home) vs SE(away) — 1974: 0-0 empate
  33: {
    totalMatches: 1, homeWins: 0, awayWins: 0, draws: 1,
    matches: [
      { date: '1974-06-19', homeTeamCode: 'NL', awayTeamCode: 'SE', homeScore: 0, awayScore: 0, competition: 'Copa del Mundo Alemania 1974' },
    ],
  },

  // Fixture 34: TN(home) vs JP(away) — 2002: Japón 2-0 Túnez
  34: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '2002-06-14', homeTeamCode: 'JP', awayTeamCode: 'TN', homeScore: 2, awayScore: 0, competition: 'Copa del Mundo Corea/Japón 2002' },
    ],
  },

  // ── Grupo H ──────────────────────────────────────────────────────────────

  // Fixture 44: SA(home) vs UY(away) — 2018: Uruguay 1-0 Arabia Saudita
  44: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '2018-06-20', homeTeamCode: 'SA', awayTeamCode: 'UY', homeScore: 0, awayScore: 1, competition: 'Copa del Mundo Rusia 2018' },
    ],
  },

  // Fixture 45: ES(home) vs SA(away) — 2006: España 1-0 Arabia Saudita
  45: {
    totalMatches: 1, homeWins: 1, awayWins: 0, draws: 0,
    matches: [
      { date: '2006-06-23', homeTeamCode: 'ES', awayTeamCode: 'SA', homeScore: 1, awayScore: 0, competition: 'Copa del Mundo Alemania 2006' },
    ],
  },

  // Fixture 48: UY(home) vs ES(away) — 2 partidos: 1950 2-2, 1990 España 2-1
  48: {
    totalMatches: 2, homeWins: 0, awayWins: 1, draws: 1,
    matches: [
      { date: '1950-07-13', homeTeamCode: 'UY', awayTeamCode: 'ES', homeScore: 2, awayScore: 2, competition: 'Copa del Mundo Brasil 1950 (Fase Final)' },
      { date: '1990-06-27', homeTeamCode: 'ES', awayTeamCode: 'UY', homeScore: 2, awayScore: 1, competition: 'Copa del Mundo Italia 1990' },
    ],
  },

  // ── Grupo I ──────────────────────────────────────────────────────────────

  // Fixture 49: FR(home) vs SN(away) — 2002: Senegal 1-0 Francia (partido inaugural)
  49: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '2002-05-31', homeTeamCode: 'SN', awayTeamCode: 'FR', homeScore: 1, awayScore: 0, competition: 'Copa del Mundo Corea/Japón 2002 (Partido inaugural)' },
    ],
  },

  // ── Grupo J ──────────────────────────────────────────────────────────────

  // Fixture 59: DZ(home) vs AT(away) — 1982: Austria 2-0 Argelia
  59: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '1982-06-24', homeTeamCode: 'AT', awayTeamCode: 'DZ', homeScore: 2, awayScore: 0, competition: 'Copa del Mundo España 1982' },
    ],
  },

  // ── Grupo L ──────────────────────────────────────────────────────────────

  // Fixture 67: GB-ENG(home) vs HR(away) — 2018: Croacia 2-1 Inglaterra (Semifinal, tiempo extra)
  67: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '2018-07-11', homeTeamCode: 'GB-ENG', awayTeamCode: 'HR', homeScore: 1, awayScore: 2, competition: 'Copa del Mundo Rusia 2018 (Semifinal)' },
    ],
  },

  // Fixture 71: PA(home) vs GB-ENG(away) — 2018: Inglaterra 6-1 Panamá
  71: {
    totalMatches: 1, homeWins: 0, awayWins: 1, draws: 0,
    matches: [
      { date: '2018-06-24', homeTeamCode: 'GB-ENG', awayTeamCode: 'PA', homeScore: 6, awayScore: 1, competition: 'Copa del Mundo Rusia 2018' },
    ],
  },

};

export function getStaticH2H(matchId: number): StaticH2H | null {
  return staticH2H[matchId] ?? null;
}

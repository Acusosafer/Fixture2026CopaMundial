export interface StaticMatch {
  id: number;
  homeTeamCode: string;
  awayTeamCode: string;
  date: string; // ISO 8601 UTC
  venue: string;
  stadiumId: string;
  group: string; // 'A'...'L' | 'R32' | 'R16' | 'QF' | 'SF' | 'TPO' | 'FIN'
  status: 'scheduled' | 'live' | 'finished';
  homeScore: number | null;
  awayScore: number | null;
}

// Todos los horarios convertidos de ART (UTC-3) a UTC: hora_ART + 3h = hora_UTC
// Fuente: FIFA oficial — horarios confirmados

export const staticMatches: StaticMatch[] = [

  // ── Grupo A: MX, ZA, KR, CZ ──────────────────────────────
  // Fecha 1
  { id: 1, homeTeamCode: 'MX', awayTeamCode: 'ZA', date: '2026-06-11T19:00:00Z', venue: 'Estadio Ciudad de México', stadiumId: 'azteca', group: 'A', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 2, homeTeamCode: 'KR', awayTeamCode: 'CZ', date: '2026-06-12T02:00:00Z', venue: 'Estadio Guadalajara', stadiumId: 'akron', group: 'A', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 3, homeTeamCode: 'CZ', awayTeamCode: 'ZA', date: '2026-06-18T16:00:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'A', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 4, homeTeamCode: 'MX', awayTeamCode: 'KR', date: '2026-06-19T01:00:00Z', venue: 'Estadio Guadalajara', stadiumId: 'akron', group: 'A', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 5, homeTeamCode: 'CZ', awayTeamCode: 'MX', date: '2026-06-25T01:00:00Z', venue: 'Estadio Ciudad de México', stadiumId: 'azteca', group: 'A', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 6, homeTeamCode: 'ZA', awayTeamCode: 'KR', date: '2026-06-25T01:00:00Z', venue: 'Estadio Monterrey', stadiumId: 'bbva', group: 'A', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo B: CA, BA, QA, CH ──────────────────────────────
  // Fecha 1
  { id: 7, homeTeamCode: 'CA', awayTeamCode: 'BA', date: '2026-06-12T19:00:00Z', venue: 'Estadio de Toronto', stadiumId: 'bmo', group: 'B', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 8, homeTeamCode: 'QA', awayTeamCode: 'CH', date: '2026-06-13T19:00:00Z', venue: 'Estadio de la Bahía de San Francisco', stadiumId: 'levis', group: 'B', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 9, homeTeamCode: 'CH', awayTeamCode: 'BA', date: '2026-06-18T19:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'B', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 10, homeTeamCode: 'CA', awayTeamCode: 'QA', date: '2026-06-18T22:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'B', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 11, homeTeamCode: 'CH', awayTeamCode: 'CA', date: '2026-06-24T19:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'B', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 12, homeTeamCode: 'BA', awayTeamCode: 'QA', date: '2026-06-24T19:00:00Z', venue: 'Estadio de Seattle', stadiumId: 'lumen', group: 'B', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo C: BR, MA, HT, GB-SCT ──────────────────────────
  // Fecha 1
  { id: 13, homeTeamCode: 'BR', awayTeamCode: 'MA', date: '2026-06-13T22:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'C', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 14, homeTeamCode: 'HT', awayTeamCode: 'GB-SCT', date: '2026-06-14T01:00:00Z', venue: 'Estadio Boston', stadiumId: 'gillette', group: 'C', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 15, homeTeamCode: 'GB-SCT', awayTeamCode: 'MA', date: '2026-06-19T22:00:00Z', venue: 'Estadio Boston', stadiumId: 'gillette', group: 'C', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 16, homeTeamCode: 'BR', awayTeamCode: 'HT', date: '2026-06-20T00:30:00Z', venue: 'Estadio Filadelfia', stadiumId: 'lincoln-financial', group: 'C', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 17, homeTeamCode: 'GB-SCT', awayTeamCode: 'BR', date: '2026-06-24T22:00:00Z', venue: 'Estadio Miami', stadiumId: 'hard-rock', group: 'C', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 18, homeTeamCode: 'MA', awayTeamCode: 'HT', date: '2026-06-24T22:00:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'C', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo D: US, PY, AU, TR ──────────────────────────────
  // Fecha 1
  { id: 19, homeTeamCode: 'US', awayTeamCode: 'PY', date: '2026-06-13T01:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'D', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 20, homeTeamCode: 'AU', awayTeamCode: 'TR', date: '2026-06-14T04:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'D', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 21, homeTeamCode: 'US', awayTeamCode: 'AU', date: '2026-06-19T19:00:00Z', venue: 'Estadio de Seattle', stadiumId: 'lumen', group: 'D', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 22, homeTeamCode: 'TR', awayTeamCode: 'PY', date: '2026-06-20T03:00:00Z', venue: 'Estadio de la Bahía de San Francisco', stadiumId: 'levis', group: 'D', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 23, homeTeamCode: 'TR', awayTeamCode: 'US', date: '2026-06-26T02:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'D', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 24, homeTeamCode: 'PY', awayTeamCode: 'AU', date: '2026-06-26T02:00:00Z', venue: 'Estadio de la Bahía de San Francisco', stadiumId: 'levis', group: 'D', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo E: DE, CW, CI, EC ──────────────────────────────
  // Fecha 1
  { id: 25, homeTeamCode: 'DE', awayTeamCode: 'CW', date: '2026-06-14T17:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'E', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 26, homeTeamCode: 'CI', awayTeamCode: 'EC', date: '2026-06-14T23:00:00Z', venue: 'Estadio Filadelfia', stadiumId: 'lincoln-financial', group: 'E', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 27, homeTeamCode: 'DE', awayTeamCode: 'CI', date: '2026-06-20T20:00:00Z', venue: 'Estadio de Toronto', stadiumId: 'bmo', group: 'E', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 28, homeTeamCode: 'EC', awayTeamCode: 'CW', date: '2026-06-21T00:00:00Z', venue: 'Estadio Kansas City', stadiumId: 'arrowhead', group: 'E', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 29, homeTeamCode: 'CW', awayTeamCode: 'CI', date: '2026-06-25T20:00:00Z', venue: 'Estadio Filadelfia', stadiumId: 'lincoln-financial', group: 'E', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 30, homeTeamCode: 'EC', awayTeamCode: 'DE', date: '2026-06-25T20:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'E', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo F: NL, JP, SE, TN ──────────────────────────────
  // Fecha 1
  { id: 31, homeTeamCode: 'NL', awayTeamCode: 'JP', date: '2026-06-14T20:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'F', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 32, homeTeamCode: 'SE', awayTeamCode: 'TN', date: '2026-06-15T02:00:00Z', venue: 'Estadio Monterrey', stadiumId: 'bbva', group: 'F', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 33, homeTeamCode: 'NL', awayTeamCode: 'SE', date: '2026-06-20T17:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'F', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 34, homeTeamCode: 'TN', awayTeamCode: 'JP', date: '2026-06-21T04:00:00Z', venue: 'Estadio Monterrey', stadiumId: 'bbva', group: 'F', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 35, homeTeamCode: 'JP', awayTeamCode: 'SE', date: '2026-06-25T23:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'F', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 36, homeTeamCode: 'TN', awayTeamCode: 'NL', date: '2026-06-25T23:00:00Z', venue: 'Estadio Kansas City', stadiumId: 'arrowhead', group: 'F', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo G: BE, EG, IR, NZ ──────────────────────────────
  // Fecha 1
  { id: 37, homeTeamCode: 'BE', awayTeamCode: 'EG', date: '2026-06-15T19:00:00Z', venue: 'Estadio de Seattle', stadiumId: 'lumen', group: 'G', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 38, homeTeamCode: 'IR', awayTeamCode: 'NZ', date: '2026-06-16T01:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'G', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 39, homeTeamCode: 'BE', awayTeamCode: 'IR', date: '2026-06-21T19:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'G', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 40, homeTeamCode: 'NZ', awayTeamCode: 'EG', date: '2026-06-22T01:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'G', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 41, homeTeamCode: 'EG', awayTeamCode: 'IR', date: '2026-06-27T03:00:00Z', venue: 'Estadio de Seattle', stadiumId: 'lumen', group: 'G', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 42, homeTeamCode: 'NZ', awayTeamCode: 'BE', date: '2026-06-27T03:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'G', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo H: ES, CV, SA, UY ──────────────────────────────
  // Fecha 1
  { id: 43, homeTeamCode: 'ES', awayTeamCode: 'CV', date: '2026-06-15T16:00:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'H', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 44, homeTeamCode: 'SA', awayTeamCode: 'UY', date: '2026-06-15T22:00:00Z', venue: 'Estadio Miami', stadiumId: 'hard-rock', group: 'H', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 45, homeTeamCode: 'ES', awayTeamCode: 'SA', date: '2026-06-21T16:00:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'H', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 46, homeTeamCode: 'UY', awayTeamCode: 'CV', date: '2026-06-21T22:00:00Z', venue: 'Estadio Miami', stadiumId: 'hard-rock', group: 'H', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 47, homeTeamCode: 'CV', awayTeamCode: 'SA', date: '2026-06-27T00:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'H', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 48, homeTeamCode: 'UY', awayTeamCode: 'ES', date: '2026-06-27T00:00:00Z', venue: 'Estadio Guadalajara', stadiumId: 'akron', group: 'H', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo I: FR, SN, IQ, NO ──────────────────────────────
  // Fecha 1
  { id: 49, homeTeamCode: 'FR', awayTeamCode: 'SN', date: '2026-06-16T19:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'I', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 50, homeTeamCode: 'IQ', awayTeamCode: 'NO', date: '2026-06-16T22:00:00Z', venue: 'Estadio Boston', stadiumId: 'gillette', group: 'I', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 51, homeTeamCode: 'FR', awayTeamCode: 'IQ', date: '2026-06-22T21:00:00Z', venue: 'Estadio Filadelfia', stadiumId: 'lincoln-financial', group: 'I', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 52, homeTeamCode: 'NO', awayTeamCode: 'SN', date: '2026-06-23T00:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'I', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 53, homeTeamCode: 'NO', awayTeamCode: 'FR', date: '2026-06-26T19:00:00Z', venue: 'Estadio Boston', stadiumId: 'gillette', group: 'I', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 54, homeTeamCode: 'SN', awayTeamCode: 'IQ', date: '2026-06-26T19:00:00Z', venue: 'Estadio de Toronto', stadiumId: 'bmo', group: 'I', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo J: AR, DZ, AT, JO ──────────────────────────────
  // Fecha 1
  { id: 55, homeTeamCode: 'AR', awayTeamCode: 'DZ', date: '2026-06-17T01:00:00Z', venue: 'Estadio Kansas City', stadiumId: 'arrowhead', group: 'J', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 56, homeTeamCode: 'AT', awayTeamCode: 'JO', date: '2026-06-17T04:00:00Z', venue: 'Estadio de la Bahía de San Francisco', stadiumId: 'levis', group: 'J', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 57, homeTeamCode: 'AR', awayTeamCode: 'AT', date: '2026-06-22T17:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'J', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 58, homeTeamCode: 'JO', awayTeamCode: 'DZ', date: '2026-06-23T03:00:00Z', venue: 'Estadio de la Bahía de San Francisco', stadiumId: 'levis', group: 'J', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 59, homeTeamCode: 'DZ', awayTeamCode: 'AT', date: '2026-06-28T02:00:00Z', venue: 'Estadio Kansas City', stadiumId: 'arrowhead', group: 'J', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 60, homeTeamCode: 'JO', awayTeamCode: 'AR', date: '2026-06-28T02:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'J', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo K: PT, CD, UZ, CO ──────────────────────────────
  // Fecha 1
  { id: 61, homeTeamCode: 'PT', awayTeamCode: 'CD', date: '2026-06-17T17:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'K', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 62, homeTeamCode: 'UZ', awayTeamCode: 'CO', date: '2026-06-18T02:00:00Z', venue: 'Estadio Ciudad de México', stadiumId: 'azteca', group: 'K', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 63, homeTeamCode: 'PT', awayTeamCode: 'UZ', date: '2026-06-23T17:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'K', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 64, homeTeamCode: 'CO', awayTeamCode: 'CD', date: '2026-06-24T02:00:00Z', venue: 'Estadio Guadalajara', stadiumId: 'akron', group: 'K', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 65, homeTeamCode: 'CO', awayTeamCode: 'PT', date: '2026-06-27T23:30:00Z', venue: 'Estadio Miami', stadiumId: 'hard-rock', group: 'K', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 66, homeTeamCode: 'CD', awayTeamCode: 'UZ', date: '2026-06-27T23:30:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'K', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Grupo L: GB-ENG, HR, GH, PA ──────────────────────────
  // Fecha 1
  { id: 67, homeTeamCode: 'GB-ENG', awayTeamCode: 'HR', date: '2026-06-17T20:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'L', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 68, homeTeamCode: 'GH', awayTeamCode: 'PA', date: '2026-06-17T23:00:00Z', venue: 'Estadio de Toronto', stadiumId: 'bmo', group: 'L', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 2
  { id: 69, homeTeamCode: 'GB-ENG', awayTeamCode: 'GH', date: '2026-06-23T20:00:00Z', venue: 'Estadio Boston', stadiumId: 'gillette', group: 'L', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 70, homeTeamCode: 'PA', awayTeamCode: 'HR', date: '2026-06-23T23:00:00Z', venue: 'Estadio de Toronto', stadiumId: 'bmo', group: 'L', status: 'scheduled', homeScore: null, awayScore: null },
  // Fecha 3
  { id: 71, homeTeamCode: 'PA', awayTeamCode: 'GB-ENG', date: '2026-06-27T21:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'L', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 72, homeTeamCode: 'HR', awayTeamCode: 'GH', date: '2026-06-27T21:00:00Z', venue: 'Estadio Filadelfia', stadiumId: 'lincoln-financial', group: 'L', status: 'scheduled', homeScore: null, awayScore: null },

  // ══════════════════════════════════════════════════════════
  // FASE ELIMINATORIA
  // ══════════════════════════════════════════════════════════

  // ── Dieciseisavos de final (Round of 32) ─────────────────
  // Confirmados al 25-jun: 1A=MX, 2A=ZA, 1B=CH, 1C=BR, 2C=MA, 1D=US, 1J=AR, 1K=CO
  { id: 73, homeTeamCode: 'ZA',  awayTeamCode: 'CA',     date: '2026-06-28T19:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 74, homeTeamCode: 'BR',  awayTeamCode: '2F',     date: '2026-06-29T17:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 75, homeTeamCode: 'DE',  awayTeamCode: '3ABCDF', date: '2026-06-29T20:30:00Z', venue: 'Estadio Boston', stadiumId: 'gillette', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 76, homeTeamCode: '1F',  awayTeamCode: 'MA',     date: '2026-06-30T01:00:00Z', venue: 'Estadio Monterrey', stadiumId: 'bbva', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 77, homeTeamCode: 'CI',  awayTeamCode: '2I',     date: '2026-06-30T17:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 78, homeTeamCode: '1I',  awayTeamCode: '3CDFGH', date: '2026-06-30T21:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 79, homeTeamCode: 'MX',  awayTeamCode: '3CEFHI', date: '2026-07-01T01:00:00Z', venue: 'Estadio Ciudad de México', stadiumId: 'azteca', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 80, homeTeamCode: '1L',  awayTeamCode: '3EHIJK', date: '2026-07-01T16:00:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 81, homeTeamCode: '1G',  awayTeamCode: '3AEHIJ', date: '2026-07-01T20:00:00Z', venue: 'Estadio de Seattle', stadiumId: 'lumen', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 82, homeTeamCode: 'US',  awayTeamCode: '3BEFIJ', date: '2026-07-02T00:00:00Z', venue: 'Estadio de la Bahía de San Francisco', stadiumId: 'levis', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 83, homeTeamCode: '1H',  awayTeamCode: '2J',     date: '2026-07-02T19:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 84, homeTeamCode: '2K',  awayTeamCode: '2L',     date: '2026-07-02T23:00:00Z', venue: 'Estadio de Toronto', stadiumId: 'bmo', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 85, homeTeamCode: 'CH',  awayTeamCode: '3EFGIJ', date: '2026-07-03T03:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 86, homeTeamCode: '2D',  awayTeamCode: '2G',     date: '2026-07-03T18:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 87, homeTeamCode: 'AR',  awayTeamCode: '2H',     date: '2026-07-03T22:00:00Z', venue: 'Estadio Miami', stadiumId: 'hard-rock', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 88, homeTeamCode: 'CO',  awayTeamCode: '3DEIJL', date: '2026-07-04T01:30:00Z', venue: 'Estadio Kansas City', stadiumId: 'arrowhead', group: 'R32', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Octavos de final (Round of 16) ───────────────────────
  { id: 89, homeTeamCode: 'W73', awayTeamCode: 'W75', date: '2026-07-04T17:00:00Z', venue: 'Estadio Houston', stadiumId: 'nrg', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 90, homeTeamCode: 'W74', awayTeamCode: 'W77', date: '2026-07-04T21:00:00Z', venue: 'Estadio Filadelfia', stadiumId: 'lincoln-financial', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 91, homeTeamCode: 'W76', awayTeamCode: 'W78', date: '2026-07-05T20:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 92, homeTeamCode: 'W79', awayTeamCode: 'W80', date: '2026-07-06T00:00:00Z', venue: 'Estadio Ciudad de México', stadiumId: 'azteca', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 93, homeTeamCode: 'W83', awayTeamCode: 'W84', date: '2026-07-06T19:00:00Z', venue: 'Estadio Dallas', stadiumId: 'att', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 94, homeTeamCode: 'W81', awayTeamCode: 'W82', date: '2026-07-07T00:00:00Z', venue: 'Estadio de Seattle', stadiumId: 'lumen', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 95, homeTeamCode: 'W86', awayTeamCode: 'W88', date: '2026-07-07T16:00:00Z', venue: 'Estadio Atlanta', stadiumId: 'mercedes-benz', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 96, homeTeamCode: 'W85', awayTeamCode: 'W87', date: '2026-07-07T20:00:00Z', venue: 'Estadio BC Place Vancouver', stadiumId: 'bc-place', group: 'R16', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Cuartos de final (Quarterfinals) ─────────────────────
  { id: 97,  homeTeamCode: 'W89', awayTeamCode: 'W90', date: '2026-07-09T20:00:00Z', venue: 'Estadio Boston',    stadiumId: 'gillette',   group: 'QF', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 98,  homeTeamCode: 'W93', awayTeamCode: 'W94', date: '2026-07-10T19:00:00Z', venue: 'Estadio Los Ángeles', stadiumId: 'sofi',     group: 'QF', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 99,  homeTeamCode: 'W91', awayTeamCode: 'W92', date: '2026-07-11T21:00:00Z', venue: 'Estadio Miami',    stadiumId: 'hard-rock',  group: 'QF', status: 'scheduled', homeScore: null, awayScore: null },
  { id: 100, homeTeamCode: 'W95', awayTeamCode: 'W96', date: '2026-07-12T01:00:00Z', venue: 'Estadio Kansas City', stadiumId: 'arrowhead', group: 'QF', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Semifinales ───────────────────────────────────────────
  { id: 101, homeTeamCode: 'W97',  awayTeamCode: 'W98',  date: '2026-07-14T19:00:00Z', venue: 'Estadio Dallas',   stadiumId: 'att',          group: 'SF',  status: 'scheduled', homeScore: null, awayScore: null },
  { id: 102, homeTeamCode: 'W99',  awayTeamCode: 'W100', date: '2026-07-15T19:00:00Z', venue: 'Estadio Atlanta',  stadiumId: 'mercedes-benz', group: 'SF',  status: 'scheduled', homeScore: null, awayScore: null },

  // ── Tercer puesto ─────────────────────────────────────────
  { id: 103, homeTeamCode: 'RU101', awayTeamCode: 'RU102', date: '2026-07-18T21:00:00Z', venue: 'Estadio Miami', stadiumId: 'hard-rock', group: 'TPO', status: 'scheduled', homeScore: null, awayScore: null },

  // ── Final ─────────────────────────────────────────────────
  { id: 104, homeTeamCode: 'W101', awayTeamCode: 'W102', date: '2026-07-19T19:00:00Z', venue: 'Estadio Nueva York/Nueva Jersey', stadiumId: 'metlife', group: 'FIN', status: 'scheduled', homeScore: null, awayScore: null },
];

export function getNextMatchForTeam(teamCode: string, now = new Date()): StaticMatch | undefined {
  return staticMatches
    .filter(
      (m) =>
        (m.homeTeamCode === teamCode || m.awayTeamCode === teamCode) &&
        new Date(m.date) >= now
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

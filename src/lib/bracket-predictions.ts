// Equipos proyectados por grupo — solo se usan cuando ESPN aún no confirmó el grupo.
// El resultado real de resolveBracketCodes siempre tiene prioridad.

export const PREDICTED_TEAMS: Record<string, string> = {
  // ── Primeros de grupo ───────────────────────────────────────
  '1A': 'MX',
  '1C': 'BR',
  '1D': 'US',
  '1F': 'NL',
  '1G': 'BE',
  '1H': 'ES',
  '1I': 'FR',
  '1J': 'AR',
  '1K': 'PT',
  '1L': 'GB-ENG',

  // ── Segundos de grupo ───────────────────────────────────────
  '2A': 'ZA',
  '2C': 'MA',
  '2D': 'TR',
  '2F': 'SE',
  '2G': 'EG',
  '2H': 'UY',
  '2I': 'NO',
  '2J': 'AT',
  '2K': 'CO',
  '2L': 'HR',

  // ── Mejores terceros (predicción por slot) ──────────────────
  // id 75 → 1E(DE) vs 3ABCDF → DE vs PY
  '3ABCDF': 'PY',
  // id 78 → 1I(FR) vs 3CDFGH → FR vs AU
  '3CDFGH': 'AU',
  // id 79 → 1A(MX) vs 3CEFHI → MX vs SN
  '3CEFHI': 'SN',
  // id 80 → 1L(ENG) vs 3EHIJK → ENG vs JO
  '3EHIJK': 'JO',
  // id 81 → 1G(BE) vs 3AEHIJ → BE vs KR
  '3AEHIJ': 'KR',
  // id 82 → 1D(US) vs 3BEFIJ → US vs IQ
  '3BEFIJ': 'IQ',
  // id 85 → 1B(CH) vs 3EFGIJ → CH vs IR
  '3EFGIJ': 'IR',
  // id 88 → 1K(PT) vs 3DEIJL → PT vs GH
  '3DEIJL': 'GH',
};

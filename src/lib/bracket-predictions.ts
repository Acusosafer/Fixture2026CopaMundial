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
  '1K': 'CO',       // Colombia gana Grupo K
  '1L': 'GB-ENG',

  // ── Segundos de grupo ───────────────────────────────────────
  '2A': 'ZA',
  '2C': 'MA',
  '2D': 'AU',       // Australia 2do Grupo D (no Turquía)
  '2F': 'JP',       // Japón 2do Grupo F (no Suecia)
  '2G': 'EG',
  '2H': 'CV',       // Cabo Verde 2do Grupo H
  '2I': 'NO',
  '2J': 'AT',
  '2K': 'PT',       // Portugal 2do Grupo K (no Colombia)
  '2L': 'HR',

  // ── Mejores terceros (predicción por slot) ──────────────────
  // id 75 → 1E(DE) vs 3ABCDF → DE vs PY  (PY 3ro Grupo D)
  '3ABCDF': 'PY',
  // id 78 → 1I(FR) vs 3CDFGH → FR vs SE  (SE 3ro Grupo F)
  '3CDFGH': 'SE',
  // id 79 → 1A(MX) vs 3CEFHI → MX vs EC  (EC 3ro Grupo E)
  '3CEFHI': 'EC',
  // id 80 → 1L(ENG) vs 3EHIJK → ENG vs CD  (CD 3ro Grupo K)
  '3EHIJK': 'CD',
  // id 81 → 1G(BE) vs 3AEHIJ → BE vs SN  (SN 3ro Grupo I)
  '3AEHIJ': 'SN',
  // id 82 → 1D(US) vs 3BEFIJ → US vs BA  (BA 3ro Grupo B)
  '3BEFIJ': 'BA',
  // id 85 → 1B(CH) vs 3EFGIJ → CH vs DZ  (DZ 3ro Grupo J)
  '3EFGIJ': 'DZ',
  // id 88 → 1K(CO) vs 3DEIJL → CO vs GH  (GH 3ro Grupo L)
  '3DEIJL': 'GH',
};

// Resultados reales de la fase de grupos (completada el 28/6/2026).
// Actúan como fallback cuando el caché de ESPN aún no llegó al cliente.
// El resultado de resolveBracketCodes (ESPN) siempre tiene prioridad.

export const PREDICTED_TEAMS: Record<string, string> = {
  // ── Primeros de grupo — resultados reales ────────────────────
  '1A': 'MX',         // México  9pts
  '1B': 'CH',         // Suiza   7pts
  '1C': 'BR',         // Brasil  7pts
  '1D': 'US',         // USA     6pts
  '1E': 'DE',         // Alemania 6pts
  '1F': 'NL',         // Holanda  7pts
  '1G': 'BE',         // Bélgica  5pts
  '1H': 'ES',         // España   7pts
  '1I': 'FR',         // Francia  9pts
  '1J': 'AR',         // Argentina 9pts
  '1K': 'CO',         // Colombia 7pts
  '1L': 'GB-ENG',     // Inglaterra 7pts

  // ── Segundos de grupo — resultados reales ───────────────────
  '2A': 'ZA',         // Sudáfrica 4pts
  '2B': 'CA',         // Canadá    4pts
  '2C': 'MA',         // Marruecos 7pts
  '2D': 'AU',         // Australia 4pts
  '2E': 'CI',         // Costa de Marfil 6pts
  '2F': 'JP',         // Japón     5pts
  '2G': 'EG',         // Egipto    5pts
  '2H': 'CV',         // Cabo Verde 3pts
  '2I': 'NO',         // Noruega   6pts
  '2J': 'AT',         // Austria   4pts
  '2K': 'PT',         // Portugal  5pts
  '2L': 'HR',         // Croacia   6pts

  // ── Mejores terceros — 8 clasificados reales ─────────────────
  // Ranking: CD(+1) > SE(0,gf7) > EC(0,gf2) > GH(0,gf2) > BA(-1) > DZ(-2,gf5) > PY(-2,gf2) > SN(3pts)
  '3ABCDF': 'BA',     // Bosnia (3°B, 4pts)
  '3CDFGH': 'PY',     // Paraguay (3°D, 4pts)
  '3CEFHI': 'EC',     // Ecuador (3°E, 4pts)
  '3EHIJK': 'CD',     // Congo DR (3°K, 4pts, +1)
  '3AEHIJ': 'SN',     // Senegal (3°I, 3pts, +2)
  '3BEFIJ': 'SE',     // Suecia (3°F, 4pts, dg0, gf7)
  '3EFGIJ': 'DZ',     // Argelia (3°J, 4pts)
  '3DEIJL': 'GH',     // Ghana (3°L, 4pts)
};

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

  // ── Mejores terceros — slots oficiales FIFA 2026 ─────────────
  '3ABCDF': 'PY',     // Paraguay (3°D) → juega vs 1E (Alemania)
  '3CDFGH': 'SE',     // Suecia   (3°F) → juega vs 1I (Francia)
  '3CEFHI': 'EC',     // Ecuador  (3°E) → juega vs 1A (México)
  '3EHIJK': 'CD',     // Congo DR (3°K) → juega vs 1L (Inglaterra)
  '3AEHIJ': 'SN',     // Senegal  (3°I) → juega vs 1G (Bélgica)
  '3BEFIJ': 'BA',     // Bosnia   (3°B) → juega vs 1D (Estados Unidos)
  '3EFGIJ': 'DZ',     // Argelia  (3°J) → juega vs 1B (Suiza)
  '3DEIJL': 'GH',     // Ghana    (3°L) → juega vs 1K (Colombia)
};

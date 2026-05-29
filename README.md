# Mundial 2026 — PWA

App progresiva (PWA) para seguir el Mundial FIFA 2026 en tiempo real.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript** strict
- **Tailwind CSS v4** + CSS variables (tema oscuro/claro)
- **TanStack Query v5** para fetching con caché adaptativo
- **Framer Motion** para animaciones
- **Zustand** (persistido en localStorage)
- **next/font** — Bebas Neue + Inter

## Funcionalidades

| Sección | Estado |
|---------|--------|
| Home — próximo partido + cuenta regresiva | ✅ |
| Fixture completo (96 partidos) | ✅ |
| Grupos (12 grupos, scroll por chip) | ✅ |
| Noticias (RSS Olé / TyC / ESPN + Twitter) | ✅ |
| Sedes (16 estadios con fotos) | ✅ |
| Histórico (mundiales 1930–2022) | ✅ |
| Mi Selección (cualquier equipo como favorito) | ✅ |
| Detalle de partido con marcador en vivo | ✅ |
| Events timeline / lineups / estadísticas | ✅ |
| Head-to-head (H2H) | ✅ |
| Splash screen (animación al abrir) | ✅ |
| Tema oscuro / claro (toggle) | ✅ |
| PWA (manifest + service worker) | ✅ |
| Bracket de eliminación directa | 🔧 datos estáticos |
| Push notifications | ⏳ pendiente |

## Dev

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Variables de entorno

```env
MOCK_LIVE=true                    # scores en vivo simulados (para testing)
FOOTBALL_DATA_API_KEY=...         # football-data.org v4 (free tier)
RAPIDAPI_KEY=...                  # clima / weather
TWITTER_BEARER_TOKEN=...          # tweets @gastonedul (noticias)
```

## API Routes

| Route | Descripción |
|-------|-------------|
| `/api/live` | Live scores (polling cada 60s) |
| `/api/match-detail/[id]` | Detalle, eventos y alineaciones |
| `/api/h2h/[id]` | Head-to-head histórico |
| `/api/news` | Noticias (RSS + Twitter) |
| `/api/weather` | Clima del usuario |

## Notas

- Con `MOCK_LIVE=true`, los partidos 1–3 retornan scores falsos para testing sin esperar el Mundial.
- El tema se persiste en `localStorage` vía Zustand.
- Los emojis de banderas usan `flagcdn.com` (imágenes) para evitar problemas de fuentes en distintos OS.

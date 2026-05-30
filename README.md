# World Cup 2026 — PWA

App progresiva (PWA) para seguir el Mundial FIFA 2026 en tiempo real. Desarrollada con Next.js, orientada a mobile, instalable desde el navegador.

🌐 **[fixture2026-copa-mundial.vercel.app](https://fixture2026-copa-mundial.vercel.app)**

---

## Stack

| Tecnología | Uso |
|---|---|
| **Next.js 16** (App Router, Turbopack) | Framework principal |
| **TypeScript** strict | Tipado en todo el proyecto |
| **Tailwind CSS v4** + CSS variables | Estilos + tema oscuro/claro |
| **TanStack Query v5** | Fetching con caché adaptativo |
| **Framer Motion** | Animaciones y transiciones |
| **Zustand** (persistido en localStorage) | Estado global (Mi Selección, tema) |
| **web-push** + VAPID | Push notifications |
| **Vercel KV** (Upstash compatible) | Caché del servidor + suscripciones push |
| **Anton** (next/font) | Tipografía display del splash y logo |

---

## Funcionalidades

| Sección | Estado |
|---|---|
| Splash screen cinético — copa real + "WORLD CUP 2026" | ✅ |
| Home — próximo partido de Mi Selección + cuenta regresiva | ✅ |
| Fixture completo (96 partidos) | ✅ |
| Grupos (12 grupos, scroll por chip, tabla en vivo) | ✅ |
| Simulador de escenarios "¿Qué pasa si...?" | ✅ |
| Detalle de partido — marcador, eventos, lineups, stats | ✅ |
| Head-to-head histórico en Copas del Mundo | ✅ |
| Noticias — RSS (Olé, ESPN, TyC, Infobae) + tweets @gastonedul | ✅ |
| Filtro por fuente y buscador rápido en noticias | ✅ |
| Sedes — 16 estadios con fotos | ✅ |
| Histórico de mundiales 1930–2022 | ✅ |
| Mi Selección — cualquier equipo como favorito | ✅ |
| Tema oscuro / claro (toggle en TopBar) | ✅ |
| Push notifications (VAPID, botón 🔔 en TopBar) | ✅ |
| Modo TV — marcador gigante, wake lock | ✅ |
| PWA — manifest + service worker | ✅ |
| Bracket de eliminación directa | 🔧 datos estáticos |

---

## Dev

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

---

## Variables de entorno

Crear `.env.local` en la raíz (ver `.env.local.example`):

```env
# Scores en vivo simulados — poner false cuando empiece el torneo
MOCK_LIVE=true

# football-data.org v4 (free tier — live scores del Mundial)
FOOTBALL_DATA_API_KEY=...

# Tweets de @gastonedul (sección Noticias)
TWITTER_BEARER_TOKEN=...

# Web Push — generar con: node -e "require('web-push').generateVAPIDKeys()"
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
PUSH_INTERNAL_SECRET=...

# Vercel KV (o Upstash con mismo formato REST)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

---

## API Routes

| Route | Descripción | Caché |
|---|---|---|
| `GET /api/live` | Live scores del Mundial | 30s en vivo / 15min sin partido |
| `GET /api/match-detail/[id]` | Eventos, lineups y estadísticas | 30s en vivo / 24h finalizado |
| `GET /api/h2h/[id]` | Head-to-head histórico en Copas del Mundo | estático |
| `GET /api/news` | Noticias RSS + tweets @gastonedul | 5min |
| `GET /api/weather` | Clima del usuario (Open-Meteo) | 15min |
| `GET /api/fixtures` | Fixture completo (96 partidos) | 6h |
| `GET /api/standings` | Tablas de grupos | 30min |
| `POST /api/push/subscribe` | Guardar suscripción push en KV | — |
| `DELETE /api/push/subscribe` | Eliminar suscripción push | — |
| `POST /api/push/send` | Enviar push a todos los suscriptores (requiere `x-push-secret`) | — |

---

## Notas

- **MOCK_LIVE=true** devuelve scores falsos para los primeros 3 partidos, útil para testear la UI antes del 11 de junio.
- **Push notifications**: el botón 🔔 aparece en el TopBar. Las suscripciones se guardan en Vercel KV / Upstash. Sin KV configurado, el subscribe falla silenciosamente.
- **Tweets de @gastonedul**: requiere `TWITTER_BEARER_TOKEN` cargado en Vercel → Environment Variables.
- **Tema**: persiste en `localStorage` vía Zustand. El toggle sol/luna está en el TopBar.
- **Copa del Mundo**: la imagen del splash y del logo es `public/trophy.png`.

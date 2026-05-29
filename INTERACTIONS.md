# INTERACTIONS.md — Spec técnico de interacciones

> Este archivo es la fuente de verdad para TODAS las interacciones de la app.
> El agente debe implementar cada una exactamente como se describe aquí.
> No inventar variantes. Si algo no está claro, preguntar antes de asumir.

---

## Cómo leer este archivo

Cada interacción tiene este formato:

```
TRIGGER: qué lo dispara
CONDICIÓN: cuándo aplica (si no aplica siempre)
CAPA VISUAL: qué se ve en pantalla
CAPA FÍSICA: haptic / sonido
CAPA SISTEMA: push notification / estado global
ARCHIVO: dónde vive el código
CÓDIGO: implementación exacta o pseudocódigo
```

---

## 1. GOL — Mi Selección

```
TRIGGER: evento tipo "Goal" en feed del partido, teamId === userTeamId
CONDICIÓN: el usuario tiene configurada "Mi Selección" en Zustand store
CAPA VISUAL:
  - Flash dorado en toda la pantalla (200ms)
  - Score flip animation en el marcador (35ms, spring)
  - Confetti canvas con colores de la selección
  - Toast "⚽ GOOOL [equipo]!" con fondo --ember-dim, border --ember
CAPA FÍSICA:
  - navigator.vibrate([100, 50, 200])
CAPA SISTEMA:
  - Push notification: "⚽ GOOOL Argentina! ARG 2-1 MEX · min 73'"
  - Actualizar título de la pestaña: "⚽ 2-1 · ARG vs MEX"
ARCHIVO: src/hooks/useGoalEffect.ts + src/components/effects/ConfettiBurst.tsx
```

```ts
// src/hooks/useGoalEffect.ts
import confetti from 'canvas-confetti'

export function useGoalEffect() {
  const { myTeam } = usePreferencesStore()

  const triggerGoal = useCallback((scoringTeamId: number, teamColors: string[]) => {
    const isMyTeam = scoringTeamId === myTeam?.id

    if (isMyTeam) {
      // 1. Flash pantalla
      document.documentElement.style.setProperty('--flash-color', '#E85D2F')
      document.body.classList.add('goal-flash')
      setTimeout(() => document.body.classList.remove('goal-flash'), 220)

      // 2. Confetti
      confetti({
        particleCount: 140,
        spread: 90,
        startVelocity: 45,
        colors: teamColors.length ? teamColors : ['#E8A83E', '#FFFFFF', '#7B5EA7'],
        origin: { y: 0.6 },
      })

      // 3. Haptic
      navigator.vibrate?.([100, 50, 200])
    } else {
      navigator.vibrate?.([80])
    }
  }, [myTeam])

  return { triggerGoal }
}
```

```css
/* En globals.css */
@keyframes goalFlash {
  0%, 100% { filter: none; }
  40% { filter: brightness(1.5) saturate(1.3); }
}
.goal-flash { animation: goalFlash 0.22s ease; }
```

---

## 2. GOL — Equipo Rival

```
TRIGGER: evento tipo "Goal", teamId !== userTeamId
CONDICIÓN: siempre (dentro de un partido que el usuario está viendo)
CAPA VISUAL:
  - Score flip animation en el marcador del rival (color --text, NO ember)
  - Toast discreto: "[equipo] 1 · min 58'" — fondo --surface, sin color fuerte
CAPA FÍSICA:
  - navigator.vibrate([80])
CAPA SISTEMA:
  - Push si el usuario tiene activadas notificaciones del partido
  - NO cambiar título de pestaña
ARCHIVO: src/hooks/useGoalEffect.ts (mismo hook, rama else)
```

---

## 3. Score Flip Animation

```
TRIGGER: cualquier cambio en el marcador (gol de cualquier equipo)
ARCHIVO: src/components/match/ScoreDisplay.tsx
```

```tsx
// src/components/match/ScoreDisplay.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface ScoreDisplayProps {
  score: number
  color?: 'ember' | 'default'
}

export function ScoreDisplay({ score, color = 'default' }: ScoreDisplayProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={score}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: -90, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          display: 'inline-block',
          fontVariantNumeric: 'tabular-nums',
          color: color === 'ember' ? 'var(--ember)' : 'var(--text)',
        }}
      >
        {score}
      </motion.span>
    </AnimatePresence>
  )
}
```

---

## 4. TARJETA ROJA

```
TRIGGER: evento tipo "Red Card" en feed del partido
CONDICIÓN: siempre
CAPA VISUAL:
  - Card en el feed de eventos con borde izquierdo --red, fondo --ember-dim
  - Badge rojo pulsante en la línea del jugador en el lineup
  - Si es el equipo del usuario: toast con ícono de tarjeta roja
CAPA FÍSICA:
  - navigator.vibrate([150])
CAPA SISTEMA:
  - Push si es jugador de Mi Selección: "🟥 Tarjeta roja: [jugador] · min [X]"
ARCHIVO: src/components/match/EventCard.tsx
```

```tsx
// src/components/match/EventCard.tsx
const eventStyles = {
  Goal: { border: 'var(--ember)', bg: 'var(--ember-dim)', icon: 'ti-ball-football' },
  'Red Card': { border: 'var(--red)', bg: 'rgba(232,65,62,0.1)', icon: 'ti-rectangle-vertical' },
  'Yellow Card': { border: 'var(--gold)', bg: 'var(--gold-dim)', icon: 'ti-rectangle-vertical' },
  Substitution: { border: 'var(--plasma)', bg: 'var(--plasma-dim)', icon: 'ti-switch' },
}
```

---

## 5. TARJETA AMARILLA

```
TRIGGER: evento tipo "Yellow Card"
CONDICIÓN: siempre
CAPA VISUAL:
  - Card en feed con borde --gold, fondo --gold-dim
  - Si es segunda amarilla → misma animación que tarjeta roja
CAPA FÍSICA: navigator.vibrate([60])
CAPA SISTEMA: Push solo si es Mi Selección y es segunda amarilla
```

---

## 6. Countdown — Modo Urgente

```
TRIGGER: tiempo hasta el partido ≤ 60 minutos
CONDICIÓN: partido de Mi Selección
CAPA VISUAL:
  - Los dígitos del countdown cambian de --plasma a --ember
  - Los contenedores de dígitos cambian de --plasma-dim a --ember-dim
  - Border cambia de rgba(--plasma, 0.3) a rgba(--ember, 0.3)
  - Transition: all 0.6s ease
CAPA FÍSICA: ninguna
CAPA SISTEMA: ninguna (la push ya se envió al -60min)
ARCHIVO: src/components/match/CountdownHero.tsx
```

```tsx
// src/components/match/CountdownHero.tsx
const isUrgent = minutesRemaining <= 60
const accentColor = isUrgent ? 'var(--ember)' : 'var(--plasma)'
const accentDim = isUrgent ? 'var(--ember-dim)' : 'var(--plasma-dim)'
```

---

## 7. Countdown — Pulsación 5 minutos

```
TRIGGER: tiempo hasta el partido ≤ 5 minutos
CAPA VISUAL:
  - Toda la card del partido pulsa suavemente (scale 1 → 1.015 → 1, cada 2s)
  - Badge "PRONTO" aparece con animación fadeIn
CAPA FÍSICA: navigator.vibrate([50, 30, 50])
CAPA SISTEMA: Push "⏰ Arranca en 5 min: ARG vs MEX"
```

---

## 8. Partido Inicia

```
TRIGGER: tiempo hasta el partido = 0 / estado cambia a "1H"
CAPA VISUAL:
  - Countdown desaparece con fadeOut (300ms)
  - Marcador "0 - 0" aparece con scale 0.8 → 1 + fadeIn (400ms)
  - Badge "EN VIVO" aparece con el dot pulsante
  - Si el usuario está en Home: card del partido se expande (layout animation)
CAPA FÍSICA: navigator.vibrate([100])
CAPA SISTEMA:
  - Push: "🟢 ARG vs MEX acaba de comenzar"
  - Cambiar título pestaña a "🔴 0-0 · ARG vs MEX"
```

---

## 9. Partido Termina

```
TRIGGER: estado del partido cambia a "FT" (full time)
CAPA VISUAL:
  - Badge "FIN" en color --gold, reemplaza "EN VIVO"
  - Marcador final se "fija" (sin más animaciones de flip)
  - Sharing card se genera automáticamente:
    - Card con resultado, escudos, estadio, fecha
    - Botón "Compartir resultado" con Web Share API
  - Si ganó Mi Selección: confetti dorado (200 partículas, color --gold)
  - Si perdió Mi Selección: marcador del rival en --text-dim, el nuestro en --red
CAPA FÍSICA:
  - Ganamos: vibrate([200, 100, 200, 100, 400])
  - Perdimos: vibrate([200])
  - Empate: vibrate([100, 50, 100])
CAPA SISTEMA:
  - Push con resultado final
  - Invalidar cache del partido (TTL = 0, re-fetch inmediato de standings)
ARCHIVO: src/components/match/MatchResult.tsx + src/hooks/useShareResult.ts
```

```ts
// src/hooks/useShareResult.ts
export function useShareResult(match: FinishedMatch) {
  const share = async () => {
    const text = `${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name} | Mundial 2026`
    if (navigator.share) {
      await navigator.share({ title: 'Resultado Mundial 2026', text, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(text)
      // mostrar toast "Copiado al portapapeles"
    }
  }
  return { share }
}
```

---

## 10. Pull to Refresh

```
TRIGGER: el usuario hace pull-down en cualquier lista (fixture, en vivo, grupos)
CAPA VISUAL:
  - Spinner custom: el logo de la copa (SVG animado, rotación 360°)
  - NO usar el spinner nativo del sistema
  - Al completar: los nuevos items aparecen con fadeIn + translateY(8px → 0)
  - Si no hay datos nuevos: toast "Todo actualizado" que desaparece en 2s
ARCHIVO: src/components/shell/PullToRefresh.tsx
```

```tsx
// src/components/shell/PullToRefresh.tsx — usar react-pull-to-refresh o implementar custom
// Spinner: SVG del trofeo con animation="spin" de Tailwind
<svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24">
  {/* path del trofeo */}
</svg>
```

---

## 11. Tap en Jugador (Lineup)

```
TRIGGER: tap/click en un jugador en la vista de formaciones
CAPA VISUAL:
  - Bottom sheet sube desde abajo con spring animation
  - Fondo: backdrop-filter blur(12px) + overlay rgba(0,0,0,0.5)
  - Sheet contiene: foto (TheSportsDB), nombre, número, edad, goles en el torneo, tarjetas
  - Tap fuera del sheet → cierra con spring hacia abajo
CAPA FÍSICA: ninguna
ARCHIVO: src/components/match/PlayerSheet.tsx
```

```tsx
// Usar Framer Motion para el sheet
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', stiffness: 300, damping: 35 }}
  className="fixed bottom-0 left-0 right-0 z-50 bg-[--bg-2] rounded-t-[28px] p-6"
>
```

---

## 12. Clima en Sede — Cooling Break

```
TRIGGER: temperatura en la sede del partido ≥ 32°C OR humedad relativa ≥ 75%
CONDICIÓN: datos de Open-Meteo cargados para ese estadio
CAPA VISUAL:
  - WeatherChip cambia color de --frost a --ember
  - Aparece pill adicional: "⚠ Cooling break ~min 30 y 75"
  - En la página del partido: banner discreto arriba del marcador
ARCHIVO: src/components/weather/WeatherChip.tsx
```

```tsx
const isCoolingRisk = temperature >= 32 || humidity >= 75
return (
  <div style={{ color: isCoolingRisk ? 'var(--ember)' : 'var(--frost)' }}>
    <span>{temperature}°C · {condition}</span>
    {isCoolingRisk && (
      <span className="cooling-badge">⚠ Cooling break probable</span>
    )}
  </div>
)
```

---

## 13. Clima en Buenos Aires — Alerta Contextual

```
TRIGGER: temperatura local del usuario (Open-Meteo por coordenadas del usuario)
CONDICIÓN: hay un partido de Mi Selección en las próximas 6 horas
CAPA VISUAL: chip en la Home card del partido con texto contextual
REGLAS DE TEXTO:
  - temp < 8°C + partido nocturno → "🧥 [X]°C esta noche — llevá campera al bar"
  - temp < 8°C + partido de día → "🧥 [X]°C — abrigate antes de salir"
  - temp > 28°C + partido de mediodía → "🌡 [X]°C — prendé el aire para el partido"
  - lluvia prevista → "🌧 Lluvia — plan de sillón perfecto"
  - temp 15–25°C → no mostrar nada (clima neutro)
ARCHIVO: src/components/weather/ContextualWeatherAlert.tsx
```

```ts
// src/lib/getWeatherMessage.ts
export function getWeatherMessage(temp: number, condition: string, matchHour: number): string | null {
  const isNight = matchHour >= 19
  if (temp < 8 && isNight) return `🧥 ${temp}°C esta noche — llevá campera al bar`
  if (temp < 8 && !isNight) return `🧥 ${temp}°C — abrigate antes de salir`
  if (temp > 28 && matchHour < 15) return `🌡 ${temp}°C — prendé el aire para el partido`
  if (condition.includes('rain') || condition.includes('lluvia')) return `🌧 Lluvia — plan de sillón perfecto`
  return null
}
```

---

## 14. Tema Dinámico por Equipo

```
TRIGGER: usuario entra a /partido/[id] o /seleccion/[code]
CAPA VISUAL:
  - Las CSS vars --plasma y --plasma-dim se reemplazan con los colores del equipo
  - El fondo del header muestra la bandera del equipo con blur + overlay
  - La transición es de 400ms ease
TRIGGER DE SALIDA: usuario sale de la página → reset a colores default
ARCHIVO: src/hooks/useTeamTheme.ts
```

```ts
// src/hooks/useTeamTheme.ts
export function useTeamTheme(teamCode: string) {
  const team = TEAMS[teamCode]

  useEffect(() => {
    if (!team) return
    const root = document.documentElement
    root.style.setProperty('--plasma', team.primaryColor)
    root.style.setProperty('--plasma-dim', team.primaryColor + '26') // 15% opacity

    return () => {
      root.style.removeProperty('--plasma')
      root.style.removeProperty('--plasma-dim')
    }
  }, [teamCode])
}
```

---

## 15. Modo TV (TV Companion)

```
TRIGGER: tap en botón "Modo TV" dentro de un partido en vivo
CAPA VISUAL:
  - Nav inferior → oculta (display: none)
  - Top bar → oculta
  - Feed de eventos → oculta
  - Solo queda: marcador gigante centrado + minuto + nombre de equipos
  - Fondo: color muy oscuro (#060D15)
  - Tap en cualquier lugar → sale del modo TV
CAPA FÍSICA: ninguna
CAPA SISTEMA:
  - screen.orientation.lock('landscape') — solo si el usuario lo aprueba
  - document.documentElement.requestFullscreen() — pedir permiso
  - Mantener pantalla encendida: navigator.wakeLock.request('screen')
ARCHIVO: src/components/match/TVMode.tsx + src/hooks/useTVMode.ts
```

```ts
// src/hooks/useTVMode.ts
export function useTVMode() {
  const [isTV, setIsTV] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const enter = async () => {
    setIsTV(true)
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch { /* ignore if not supported */ }
  }

  const exit = () => {
    setIsTV(false)
    wakeLockRef.current?.release()
    wakeLockRef.current = null
  }

  return { isTV, enter, exit }
}
```

---

## 16. Clasificado / Eliminado en Grupos

```
TRIGGER: un equipo confirma clasificación o eliminación (standings actualizados)
CONDICIÓN: es Mi Selección
CAPA VISUAL:
  - Fila en tabla de grupos → fondo --lime-dim (clasificado) o --ember-dim + opacity 0.6 (eliminado)
  - Badge al lado del nombre: "CLASIF." (verde) o "ELIM." (rojo)
  - Animación: la fila hace un highlight flash de 1s al momento de confirmar
CAPA FÍSICA:
  - Clasificado: vibrate([200, 100, 200])
  - Eliminado: vibrate([300])
CAPA SISTEMA:
  - Clasificado push: "✅ Argentina CLASIFICÓ a Octavos de Final"
  - Eliminado push: "❌ Argentina quedó eliminada del Mundial"
ARCHIVO: src/components/group/GroupTable.tsx
```

---

## 17. Tap en Sede — Info Completa

```
TRIGGER: tap en card de sede (desde /sedes o desde un partido)
CAPA VISUAL:
  - Page transition: slide desde abajo (View Transitions API o Framer Motion)
  - Página de sede: foto hero del estadio, mapa Leaflet centrado, datos
  - Clima actual de la sede (Open-Meteo por lat/lng del estadio)
ARCHIVO: src/app/sedes/[id]/page.tsx
```

---

## 18. Notificaciones Push — Setup

```
ARCHIVO: src/app/api/push/subscribe/route.ts + src/hooks/usePushNotifications.ts
```

```ts
// src/hooks/usePushNotifications.ts
export function usePushNotifications() {
  const subscribe = async () => {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })
    // Enviar subscription al backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return { subscribe }
}
```

---

## 19. Simulador de Escenarios (Grupos)

```
TRIGGER: tap en "¿Qué pasa si...?" en la tabla de grupos
CAPA VISUAL:
  - Bottom sheet con toggles para simular resultados hipotéticos
  - La tabla de grupos se recalcula en tiempo real
  - Los cambios hipotéticos se muestran en --plasma (no en blanco) para distinguirlos
  - Botón "Resetear" vuelve a los datos reales
ARCHIVO: src/components/group/ScenarioSimulator.tsx
```

---

## 20. Toast System — Reglas globales

```
ARCHIVO: src/components/ui/Toaster.tsx (usar sonner o implementar custom)
```

Tipos de toast y su apariencia:

| Tipo | Color borde | Color fondo | Duración | Posición |
|------|-------------|-------------|----------|----------|
| GOL Mi Equipo | --ember | --ember-dim | 5s | top-center |
| GOL Rival | --text-mute | --surface | 3s | top-center |
| Tarjeta Roja | --red | rgba(red,0.1) | 4s | top-center |
| Info general | --frost | --frost-dim | 3s | bottom-center |
| Éxito (clasif.) | --lime | rgba(lime,0.1) | 5s | top-center |
| Error API | --red | rgba(red,0.08) | 5s | bottom-center |

---

## Checklist de implementación

Antes de cerrar el sprint de interacciones, verificar:

- [ ] `canvas-confetti` instalado y tipado
- [ ] `navigator.vibrate` con fallback (Safari no lo soporta)
- [ ] `navigator.wakeLock` con try/catch
- [ ] `screen.orientation.lock` con try/catch + user gesture
- [ ] `navigator.share` con fallback a clipboard
- [ ] Web Push VAPID keys generadas y en .env
- [ ] Service worker registrado y activo
- [ ] `prefers-reduced-motion`: todas las animaciones con `@media (prefers-reduced-motion: reduce)` que las desactiva o reduce
- [ ] Todos los efectos probados en iOS Safari (restricciones de autoplay, vibration, etc.)
- [ ] Los toasts no se apilan más de 3 a la vez

---

## Nota para el agente

Implementar las interacciones en este orden:
1. Score flip (más fácil, se ve en todas las pantallas)
2. Toast system (necesario para todo lo demás)
3. Goal effect (confetti + haptic + flash)
4. Countdown urgente (pura lógica CSS + condicional)
5. TV Mode (el más vistoso para demos)
6. Bottom sheets (jugador + simulador)
7. Push notifications (último, requiere backend)

# Design System — Mundial 2026

## Filosofía visual

**"El estadio en tu bolsillo."**
Dos modos que representan la misma emoción en contextos distintos:
- **Dark "Estadio Nocturno"**: el partido de noche, las luces encendidas, la atmósfera de la tribuna.
- **Light "Día de Partido"**: el asado antes del partido, el sol de la tarde, la previa en familia.

Ambas paletas comparten la misma lógica semántica. Cambiar de una a otra es cambiar la luz, no el lenguaje.

---

## Paleta 1 — "Estadio Nocturno" (Dark)

### Fondos
```css
--bg:       #0D1B2A;   /* fondo principal — azul noche profundo */
--bg-2:     #111C2D;   /* fondo elevado (cards) */
--bg-3:     #162033;   /* fondo tooltips, modals */
--surface:  rgba(255,255,255,0.04);  /* superficie sobre bg */
--surface-hover: rgba(255,255,255,0.07);
```

### Bordes
```css
--border:       rgba(255,255,255,0.07);
--border-hover: rgba(255,255,255,0.14);
--border-focus: rgba(123,94,167,0.5);
```

### Accent palette
```css
--plasma:     #7B5EA7;              /* violeta magnético — accent primario */
--plasma-dim: rgba(123,94,167,0.15);/* surface con plasma */

--ember:      #E85D2F;              /* naranja fuego — goles, alertas, EN VIVO */
--ember-dim:  rgba(232,93,47,0.14);

--frost:      #4AAED9;              /* azul helado — info, clima, estadísticas */
--frost-dim:  rgba(74,174,217,0.14);

--gold:       #E8A83E;              /* dorado copa — campeón, final, logros */
--gold-dim:   rgba(232,168,62,0.14);

--lime:       #7EC845;              /* verde clasificado — pase al siguiente */
--red:        #E8413E;              /* rojo tarjeta — expulsión, eliminado */
```

### Texto
```css
--text:      #EEF2F7;   /* texto principal */
--text-dim:  #7A8899;   /* texto secundario */
--text-mute: #3D4A58;   /* texto deshabilitado / timestamps */
```

---

## Paleta 2 — "Día de Partido" (Light)

### Fondos
```css
--light-bg:       #F5F2FF;   /* lavanda muy suave — no blanco puro */
--light-surface:  #FFFFFF;
--light-border:   rgba(0,0,0,0.08);
--light-text:     #1A1A2E;
--light-text-dim: #6B6B8A;
```

### Accent palette (versión light — más saturados para compensar el fondo claro)
```css
--light-plasma: #5B3FA6;   /* violeta royal */
--light-ember:  #D94F24;   /* terracota */
--light-frost:  #2B8AB5;   /* azul estadio */
--light-gold:   #C47A1A;   /* amber copa */
--light-lime:   #5A9E2F;
--light-red:    #C42B28;
```

---

## Semántica de color — cuándo usar cada uno

| Token | Dark | Light | Usar cuando |
|-------|------|-------|-------------|
| `--plasma` / `--light-plasma` | #7B5EA7 | #5B3FA6 | Botones CTA, tab activo, links, accent principal |
| `--ember` / `--light-ember` | #E85D2F | #D94F24 | GOL, tarjeta roja, EN VIVO badge, alertas críticas |
| `--frost` / `--light-frost` | #4AAED9 | #2B8AB5 | Clima, tiempo de partido, estadísticas neutras, info |
| `--gold` / `--light-gold` | #E8A83E | #C47A1A | Campeón, final, trofeo, máximo goleador, logros |
| `--lime` / `--light-lime` | #7EC845 | #5A9E2F | Clasificado, pasa de ronda, resultado positivo |
| `--red` / `--light-red` | #E8413E | #C42B28 | Tarjeta roja, eliminado del torneo |

---

## CSS completo — pegar en `src/styles/globals.css`

```css
:root {
  /* === DARK: Estadio Nocturno (default) === */
  --bg: #0D1B2A;
  --bg-2: #111C2D;
  --bg-3: #162033;
  --surface: rgba(255,255,255,0.04);
  --surface-hover: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.07);
  --border-hover: rgba(255,255,255,0.14);
  --border-focus: rgba(123,94,167,0.5);

  --plasma: #7B5EA7;
  --plasma-dim: rgba(123,94,167,0.15);
  --ember: #E85D2F;
  --ember-dim: rgba(232,93,47,0.14);
  --frost: #4AAED9;
  --frost-dim: rgba(74,174,217,0.14);
  --gold: #E8A83E;
  --gold-dim: rgba(232,168,62,0.14);
  --lime: #7EC845;
  --red: #E8413E;

  --text: #EEF2F7;
  --text-dim: #7A8899;
  --text-mute: #3D4A58;

  /* Radios */
  --r-sm: 8px;
  --r: 14px;
  --r-lg: 20px;
  --r-xl: 28px;
  --r-pill: 999px;
}

[data-theme="light"] {
  --bg: #F5F2FF;
  --bg-2: #FFFFFF;
  --bg-3: #EDE8FF;
  --surface: rgba(91,63,166,0.04);
  --surface-hover: rgba(91,63,166,0.07);
  --border: rgba(0,0,0,0.08);
  --border-hover: rgba(0,0,0,0.15);
  --border-focus: rgba(91,63,166,0.4);

  --plasma: #5B3FA6;
  --plasma-dim: rgba(91,63,166,0.1);
  --ember: #D94F24;
  --ember-dim: rgba(217,79,36,0.1);
  --frost: #2B8AB5;
  --frost-dim: rgba(43,138,181,0.1);
  --gold: #C47A1A;
  --gold-dim: rgba(196,122,26,0.1);
  --lime: #5A9E2F;
  --red: #C42B28;

  --text: #1A1A2E;
  --text-dim: #6B6B8A;
  --text-mute: #AAAACC;
}

/* Selecciones por equipo — se sobreescriben via JS */
[data-team="ARG"] { --plasma: #75AADB; --plasma-dim: rgba(117,170,219,0.15); }
[data-team="BRA"] { --plasma: #009C3B; --plasma-dim: rgba(0,156,59,0.15); }
[data-team="FRA"] { --plasma: #0055A4; --plasma-dim: rgba(0,85,164,0.15); }
[data-team="ENG"] { --plasma: #CF142B; --plasma-dim: rgba(207,20,43,0.15); }
[data-team="ESP"] { --plasma: #AA151B; --plasma-dim: rgba(170,21,27,0.15); }
[data-team="POR"] { --plasma: #006600; --plasma-dim: rgba(0,102,0,0.15); }
/* etc. para las 48 selecciones */
```

---

## Glassmorphism recipe

Cards sobre imágenes de fondo (bandera, estadio):
```css
.glass-card {
  background: rgba(13, 27, 42, 0.55);    /* dark: --bg al 55% */
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 0.5px solid rgba(255,255,255,0.09);
  border-radius: var(--r-xl);
}

/* Light */
[data-theme="light"] .glass-card {
  background: rgba(245, 242, 255, 0.65);
  border-color: rgba(91,63,166,0.1);
}
```

---

## Componentes — recetas

### Badge EN VIVO
```css
.badge-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  background: var(--ember-dim);
  border: 0.5px solid rgba(var(--ember), 0.3);
  color: var(--ember);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
}
.badge-live::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--ember);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
```

### Score flip animation
```css
@keyframes scoreFlip {
  0% { transform: rotateX(90deg); opacity: 0; }
  100% { transform: rotateX(0deg); opacity: 1; }
}
.score-new {
  animation: scoreFlip 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: inline-block;
  transform-origin: center;
}
```

### Confetti al gol (Framer Motion variant)
```ts
// Triggerear desde useGoalEffect.ts
const triggerGoal = (isMyTeam: boolean) => {
  if (isMyTeam) {
    confetti({ particleCount: 120, spread: 80, colors: ['#75AADB','#FFFFFF','#E8A83E'] })
    navigator.vibrate?.([100, 50, 200])
    // Flash overlay:
    document.body.classList.add('goal-flash')
    setTimeout(() => document.body.classList.remove('goal-flash'), 220)
  } else {
    navigator.vibrate?.([80])
  }
}
```

```css
.goal-flash { animation: flashGoal 0.22s ease; }
@keyframes flashGoal {
  0%, 100% { filter: none; }
  50% { filter: brightness(1.4) sepia(0.3) hue-rotate(10deg); }
}
```

---

## Sistema de interacciones completo

### Eventos → Acciones UI

| Evento | Condición | Acción visual | Acción física | Acción sistema |
|--------|-----------|---------------|---------------|----------------|
| GOL (mi equipo) | Siempre | Confetti + flash ember 200ms + score flip gold | Vibrar `[100,50,200]` | Push notif "⚽ GOOOL Argentina!" |
| GOL (rival) | Siempre | Score flip rojo + toast discreto | Vibrar `[80]` | Push notif si configurado |
| TARJETA ROJA | Siempre | Badge rojo + card en feed | Vibrar `[150]` | Push si es mi equipo |
| PARTIDO –60min | Notif ON | Countdown color: plasma→ember | — | Push "Empieza en 1h: ARG vs MEX" |
| PARTIDO –5min | Notif ON | Countdown pulsa + alerta | Vibrar `[50,30,50]` | Push urgente |
| PARTIDO INICIA | En pantalla | Marcador aparece con fade | Vibrar `[100]` | — |
| PARTIDO TERMINA | Siempre | Badge "FIN" gold + sharing card | Vibrar `[200]` | Push resultado final |
| TEMP SEDE ≥32°C | En partido | WeatherChip → ember + badge cooling | — | — |
| LLUVIA EN SEDE | En partido | Ícono lluvia + "Cancha pesada" | — | — |
| TEMP LOCAL <10°C | Home | Chip "Llevá campera" | — | — |
| CLASIFICADO | Al terminar | Row de tabla → fondo lime | — | Push "Argentina CLASIFICÓ" |
| ELIMINADO | Al terminar | Row de tabla → fondo red + opacidad 0.5 | — | — |
| PULL-TO-REFRESH | Siempre | Spinner copa + fade in nuevos datos | — | Re-fetch API |
| TAP JUGADOR | Lineup | Bottom sheet spring up + blur fondo | — | — |
| TAP SEDE | Sedes | Page transition + mapa Leaflet | — | — |
| MODO TV | Botón | Nav oculta + marcador fullscreen | — | `screen.orientation.lock('landscape')` |
| CAMBIAR SELECCIÓN | Settings | Theme vars →colores del equipo | — | Re-render sin reload |
| SELECCIÓN RIVAL | Fixture | Fondo: bandera rival con blur | — | — |

---

## Tipografía

```css
/* En next/font */
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans', weight: ['300','400','500','600','700'] })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500','700'] })

/* Marcador en vivo */
.live-score {
  font-family: var(--font-mono);
  font-size: clamp(48px, 14vw, 120px);
  font-weight: 700;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Countdown dígitos */
.countdown-digit {
  font-family: var(--font-mono);
  font-size: clamp(22px, 6vw, 40px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

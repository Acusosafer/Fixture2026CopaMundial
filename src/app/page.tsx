'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useMySelection } from '@/hooks/useMySelection';
import { useLiveScores } from '@/hooks/useLiveScores';
import { useBracketResolution } from '@/hooks/useBracketResolution';
import { useNextTeamMatch } from '@/hooks/useNextTeamMatch';
import { getTeamByCode, type Team } from '@/lib/teams';
import { staticMatches } from '@/lib/fixtures-static';
import { isActiveStatus } from '@/lib/live';
import { FlagBackground } from '@/components/team/FlagBackground';
import { WeatherChip } from '@/components/weather/WeatherChip';
import { CountdownHero } from '@/components/match/CountdownHero';
import { NextMatchCard } from '@/components/match/NextMatchCard';
import { LiveMatchSection } from '@/components/home/LiveMatchSection';

const ARGENTINA = getTeamByCode('AR')!;
const FINAL_DATE = new Date('2026-07-19T22:00:00Z');

const ART_OFFSET_MS = -3 * 60 * 60 * 1000;
function toART(date: Date): Date {
  return new Date(date.getTime() + ART_OFFSET_MS);
}

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const ROUND_LABELS: Record<string, string> = {
  'R32': '16vos de Final', 'R16': 'Octavos de Final', 'QF': 'Cuartos de Final',
  'SF': 'Semifinal', 'FIN': 'Final', 'TPO': '3er Puesto',
  'A': 'Grupo A', 'B': 'Grupo B', 'C': 'Grupo C', 'D': 'Grupo D',
  'E': 'Grupo E', 'F': 'Grupo F', 'G': 'Grupo G', 'H': 'Grupo H',
  'I': 'Grupo I', 'J': 'Grupo J', 'K': 'Grupo K', 'L': 'Grupo L',
};

const ROUND_SHORT: Record<string, string> = {
  'R32': '16vos', 'R16': 'Octavos', 'QF': 'Cuartos', 'SF': 'Semis',
  'FIN': 'Final', 'TPO': '3er Pto',
};

function daysUntil(d: Date): number {
  const todayART = toART(new Date());
  const matchART = toART(d);
  const todayDay = Date.UTC(todayART.getUTCFullYear(), todayART.getUTCMonth(), todayART.getUTCDate());
  const matchDay = Date.UTC(matchART.getUTCFullYear(), matchART.getUTCMonth(), matchART.getUTCDate());
  return Math.round((matchDay - todayDay) / (1000 * 60 * 60 * 24));
}

function formatMatchDate(date: Date): string {
  const d = toART(date);
  return `${DAYS_ES[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

function formatMatchTime(date: Date): string {
  const d = toART(date);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm} ART`;
}

function formatShortDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + ART_OFFSET_MS);
  const h  = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} · ${h}:${mi}`;
}

const TBD_TEAM: Team = {
  code: 'TBD',
  name: 'TBD',
  nameEs: 'Por definir',
  primaryColor: 'var(--text-mute)',
  secondaryColor: 'var(--text-dim)',
  flagUrl: 'https://flagcdn.com/w320/un.png',
  group: '',
};

// ── Upcoming matches (all rounds) ─────────────────────────────────────────────

function UpcomingMatchesSection({ reduceMotion }: { reduceMotion: boolean }) {
  const now = new Date();
  const { scores: liveScores } = useLiveScores();
  const { confirmed, predicted } = useBracketResolution();

  const resolveCode = (code: string) =>
    confirmed.get(code) ?? predicted.get(code) ?? code;

  const todayART = new Date(now.getTime() + ART_OFFSET_MS);
  const todayStr = `${todayART.getUTCFullYear()}-${String(todayART.getUTCMonth() + 1).padStart(2, '0')}-${String(todayART.getUTCDate()).padStart(2, '0')}`;

  const todayMatches = staticMatches.filter((m) => {
    const d = new Date(new Date(m.date).getTime() + ART_OFFSET_MS);
    const ds = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    return ds === todayStr && m.group !== 'TPO';
  });

  const upcoming = (todayMatches.length > 0
    ? todayMatches
    : staticMatches
        .filter((m) => new Date(m.date) > now && m.group !== 'TPO')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4)
  );

  const sectionTitle = todayMatches.length > 0 ? 'Hoy en la Copa' : 'Próximos partidos';

  return (
    <motion.div
      className="rounded-3xl p-4"
      style={cardStyle}
      initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.44 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          {sectionTitle}
        </h2>
        <Link href="/fixture" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          Ver todos →
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-mute)' }}>Sin partidos próximos</p>
      ) : (
        <div className="flex flex-col gap-1">
          {upcoming.map((m) => {
            const homeCode = resolveCode(m.homeTeamCode);
            const awayCode = resolveCode(m.awayTeamCode);
            const home = getTeamByCode(homeCode);
            const away = getTeamByCode(awayCode);
            const homeIsPred = !confirmed.has(m.homeTeamCode) && predicted.has(m.homeTeamCode);
            const awayIsPred = !confirmed.has(m.awayTeamCode) && predicted.has(m.awayTeamCode);

            const live       = liveScores.get(m.id);
            const isLive     = live ? isActiveStatus(live.status) : false;
            const isFinished = live?.status === 'FINISHED' || m.status === 'finished';
            const homeScore  = live?.homeScore ?? m.homeScore;
            const awayScore  = live?.awayScore ?? m.awayScore;

            const roundLabel = ROUND_SHORT[m.group] ?? m.group;

            return (
              <Link
                key={m.id}
                href={`/partido/${m.id}`}
                className="flex items-center justify-between gap-2 py-2 rounded-xl px-2 transition-all active:scale-[0.98] hover:bg-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                {/* Round badge */}
                <span
                  className="text-[8px] font-bold uppercase tracking-wide shrink-0 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-mute)', minWidth: 36, textAlign: 'center' }}
                >
                  {roundLabel}
                </span>

                {/* Home */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {home ? (
                    <div className="relative w-6 h-4 shrink-0">
                      <Image src={home.flagUrl} alt={home.nameEs} fill className="object-contain" unoptimized />
                    </div>
                  ) : null}
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: 'var(--text)', opacity: homeIsPred ? 0.65 : 1, fontStyle: homeIsPred ? 'italic' : 'normal' }}
                  >
                    {home?.nameEs ?? homeCode}
                    {homeIsPred && <span style={{ color: 'var(--text-mute)', fontSize: 9 }}> ?</span>}
                  </span>
                </div>

                {/* Score / time */}
                {isLive ? (
                  <div className="flex flex-col items-center shrink-0 gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: 'var(--live)' }} />
                      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--live)' }}>
                        {homeScore ?? 0} – {awayScore ?? 0}
                      </span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'var(--live)' }}>
                      {live?.status === 'PAUSED' ? 'ET'
                        : live?.status === 'PAUSED_ET' ? 'D.TE'
                        : live?.status === 'PENALTIES' ? 'PEN'
                        : live?.status === 'EXTRA_TIME'
                          ? (live.injuryTime > 0 ? `${live.minute}+${live.injuryTime}'` : `TE ${live.minute}'`)
                          : live?.injuryTime && live.injuryTime > 0
                            ? `${live.minute}+${live.injuryTime}'`
                            : `${live?.minute ?? 0}'`}
                    </span>
                  </div>
                ) : isFinished && homeScore !== null ? (
                  <span className="text-xs font-bold tabular-nums shrink-0 px-1.5 py-0.5 rounded" style={{ background: 'var(--border-color)', color: 'var(--accent)' }}>
                    {homeScore} – {awayScore}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded" style={{ background: 'var(--border-color)', color: 'var(--text-dim)' }}>
                    {formatShortDate(m.date)}
                  </span>
                )}

                {/* Away */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span
                    className="text-xs font-semibold truncate text-right"
                    style={{ color: 'var(--text)', opacity: awayIsPred ? 0.65 : 1, fontStyle: awayIsPred ? 'italic' : 'normal' }}
                  >
                    {awayIsPred && <span style={{ color: 'var(--text-mute)', fontSize: 9 }}>? </span>}
                    {away?.nameEs ?? awayCode}
                  </span>
                  {away ? (
                    <div className="relative w-6 h-4 shrink-0">
                      <Image src={away.flagUrl} alt={away.nameEs} fill className="object-contain" unoptimized />
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── "El camino" — bracket path ahead ──────────────────────────────────────────
// Shows the team's next 3 potential opponents through the bracket

interface PathStep {
  roundLabel: string;
  date: string;
  opponents: Array<{ team: Team | null; code: string; isPredicted: boolean }>;
  matchId: number;
}

function ElCaminoSection({
  nextMatchId,
  myTeamCode,
  reduceMotion,
  confirmed,
  predicted,
}: {
  nextMatchId: number;
  myTeamCode: string;
  reduceMotion: boolean;
  confirmed: Map<string, string>;
  predicted: Map<string, string>;
}) {
  const resolveCode = (code: string) =>
    confirmed.get(code) ?? predicted.get(code) ?? code;

  const steps = useMemo<PathStep[]>(() => {
    const path: PathStep[] = [];

    // Paso 0: el partido propio del equipo (ej. Argentina vs Cabo Verde)
    const ownMatch = staticMatches.find((m) => m.id === nextMatchId);
    if (ownMatch) {
      const rivalRaw =
        resolveCode(ownMatch.homeTeamCode) === myTeamCode
          ? ownMatch.awayTeamCode
          : ownMatch.homeTeamCode;
      const rivalCode = resolveCode(rivalRaw);
      path.push({
        roundLabel: ROUND_LABELS[ownMatch.group] ?? ownMatch.group,
        date: ownMatch.date,
        opponents: [
          { team: getTeamByCode(rivalCode) ?? null, code: rivalCode, isPredicted: !confirmed.has(rivalRaw) },
        ],
        matchId: ownMatch.id,
      });
    }

    let matchId = nextMatchId;

    for (let step = 0; step < 4; step++) {
      // Find the next-round match where W{matchId} appears
      const nextRound = staticMatches.find(
        (m) => m.homeTeamCode === `W${matchId}` || m.awayTeamCode === `W${matchId}`
      );
      if (!nextRound) break;
      // El final lo representa el trofeo al final — no lo agregamos como paso
      if (nextRound.group === 'FIN') break;

      // The rival is the other team in this next-round match
      const wCode = `W${matchId}`;
      const rivalWCode = nextRound.homeTeamCode === wCode
        ? nextRound.awayTeamCode
        : nextRound.homeTeamCode;

      // Expand the rival's match to show both potential teams
      const rivalMatchId = parseInt(rivalWCode.replace('W', ''));
      const rivalMatch = staticMatches.find((m) => m.id === rivalMatchId);

      let opponents: PathStep['opponents'] = [];

      if (rivalMatch) {
        // Show both teams that could be the rival
        const homeCode = resolveCode(rivalMatch.homeTeamCode);
        const awayCode = resolveCode(rivalMatch.awayTeamCode);
        opponents = [
          { team: getTeamByCode(homeCode) ?? null, code: homeCode, isPredicted: !confirmed.has(rivalMatch.homeTeamCode) },
          { team: getTeamByCode(awayCode) ?? null, code: awayCode, isPredicted: !confirmed.has(rivalMatch.awayTeamCode) },
        ];
      } else {
        // Could be a final/SF where rival is W-code
        const rivalCode = resolveCode(rivalWCode);
        opponents = [{ team: getTeamByCode(rivalCode) ?? null, code: rivalCode, isPredicted: true }];
      }

      path.push({
        roundLabel: ROUND_LABELS[nextRound.group] ?? nextRound.group,
        date: nextRound.date,
        opponents,
        matchId: nextRound.id,
      });

      matchId = nextRound.id;
    }
    return path;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextMatchId, myTeamCode, confirmed, predicted]);

  if (steps.length === 0) return null;

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.5 }}
    >
      <div className="rounded-3xl p-4" style={cardStyle}>
        <Link href="/bracket" className="flex items-center justify-between mb-3 group">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            El camino
          </h2>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Ver cruces →</span>
        </Link>
        <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar">
          {steps.map((step, idx) => (
            <Link
              key={step.matchId}
              href={`/partido/${step.matchId}`}
              className="flex flex-col items-center gap-1.5 shrink-0 rounded-2xl px-3 py-3 active:opacity-60 transition-opacity"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                minWidth: 80,
              }}
            >
              <span
                className="text-[8px] font-black uppercase tracking-wider"
                style={{ color: idx === 0 ? 'var(--accent)' : 'var(--text-mute)', opacity: idx === 0 ? 1 : 0.7 }}
              >
                {step.roundLabel}
              </span>

              {/* Rival flags */}
              <div className="flex items-center gap-1">
                {step.opponents.slice(0, 2).map((op, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ opacity: op.isPredicted ? 0.65 : 1 }}>
                    {op.team ? (
                      <div className="relative shrink-0" style={{ width: 22, height: 14 }}>
                        <Image src={op.team.flagUrl} alt={op.team.nameEs} fill className="object-contain" unoptimized />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center text-[8px] font-bold"
                        style={{ width: 22, height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 2, color: 'var(--text-mute)' }}
                      >
                        ?
                      </div>
                    )}
                    {i === 0 && step.opponents.length > 1 && (
                      <span style={{ fontSize: 6, color: 'var(--text-mute)', lineHeight: 1 }}>o</span>
                    )}
                  </div>
                ))}
              </div>

              <span className="text-[7.5px] text-center" style={{ color: 'var(--text-mute)' }}>
                {formatShortDate(step.date).split(' · ')[0]} {MONTHS_SHORT[new Date(new Date(step.date).getTime() + ART_OFFSET_MS).getUTCMonth()]}
              </span>
            </Link>
          ))}

          {/* Final destination */}
          <div
            className="flex flex-col items-center gap-1.5 shrink-0 rounded-2xl px-3 py-3"
            style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.15)',
              minWidth: 80,
            }}
          >
            <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: '#FFD700', opacity: 0.8 }}>
              Final
            </span>
            <div className="relative" style={{ width: 22, height: 28 }}>
              <Image src="/trophy.png" alt="Final" fill className="object-contain" unoptimized />
            </div>
            <span className="text-[7.5px] text-center" style={{ color: 'rgba(255,215,0,0.6)' }}>
              19 jul
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Live score in hero (when match is live) ───────────────────────────────────

function LiveHeroBadge({
  matchId,
  myTeam,
  rivalTeam,
}: {
  matchId: number;
  myTeam: Team;
  rivalTeam: Team;
}) {
  const { scores } = useLiveScores();
  const live = scores.get(matchId);
  if (!live || !isActiveStatus(live.status)) return null;

  const isHome = true; // We already know which side the team is on from caller
  void isHome;

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-4"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full animate-pulse-live" style={{ background: 'var(--live)' }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--live)' }}>
          En vivo
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>
          {live.injuryTime > 0
            ? `${live.minute}+${live.injuryTime}'`
            : live.status === 'PAUSED' ? 'ET' : `${live.minute}'`}
        </span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{myTeam.nameEs}</span>
        <span className="text-3xl font-black tabular-nums" style={{ color: 'var(--live)' }}>
          {live.homeScore} – {live.awayScore}
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{rivalTeam.nameEs}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export default function HomePage() {
  const { team } = useMySelection();
  const shouldReduceMotion = useReducedMotion();
  const { scores: liveScores } = useLiveScores();
  const { confirmed, predicted } = useBracketResolution();

  const myTeam = team ?? ARGENTINA;

  const nextTeamMatch = useNextTeamMatch(myTeam.code);
  const nextMatch     = nextTeamMatch?.match ?? null;
  const nextMatchDate = nextMatch ? new Date(nextMatch.date) : FINAL_DATE;
  const rival         = nextTeamMatch ? (getTeamByCode(nextTeamMatch.rivalCode) ?? TBD_TEAM) : TBD_TEAM;

  const liveMatch = nextMatch ? liveScores.get(nextMatch.id) : undefined;
  const isMatchLive = liveMatch ? isActiveStatus(liveMatch.status) : false;

  const daysAway = nextMatch ? daysUntil(nextMatchDate) : -1;

  const matchDayChip = daysAway === 0
    ? `Hoy juega ${myTeam.nameEs}`
    : daysAway === 1
    ? `Mañana juega ${myTeam.nameEs}`
    : daysAway === 2
    ? `Pasado juega ${myTeam.nameEs}`
    : null;

  const roundLabel = nextMatch ? (ROUND_LABELS[nextMatch.group] ?? 'Próximo partido') : 'Copa del Mundo 2026';

  const countdownLabel = isMatchLive
    ? 'EN CURSO'
    : nextMatch
    ? roundLabel.toUpperCase()
    : 'FINAL · 19 JUL';

  const fadeInUp = {
    initial: shouldReduceMotion ? {} : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* ── Hero ── */}
      <section className="relative min-h-[360px] rounded-3xl overflow-hidden flex flex-col justify-end p-6 gap-4">
        <FlagBackground flagUrl={myTeam.flagUrl} teamName={myTeam.nameEs} />

        <motion.div
          className="relative z-10 flex flex-col gap-4"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Match-proximity chip */}
          {matchDayChip && (
            <motion.div variants={fadeInUp} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: 'var(--accent)' }} />
                {matchDayChip}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.div variants={fadeInUp} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>
              Mi Selección
            </p>
            <h1
              className="text-4xl font-black tracking-tight leading-none neon-text hero-team-title"
              style={{ color: 'var(--accent)' }}
            >
              {myTeam.nameEs}
            </h1>
          </motion.div>

          {/* Weather */}
          <motion.div variants={fadeInUp} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            <WeatherChip />
          </motion.div>

          {/* Live score OR countdown */}
          <motion.div variants={fadeInUp} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            {isMatchLive && nextMatch ? (
              <LiveHeroBadge matchId={nextMatch.id} myTeam={myTeam} rivalTeam={rival} />
            ) : (
              <CountdownHero targetDate={nextMatchDate} label={countdownLabel} white />
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Next match card ── */}
      {nextMatch && !isMatchLive && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.32 }}
        >
          <Link href={`/partido/${nextMatch.id}`} className="block">
            <NextMatchCard
              myTeam={myTeam}
              rival={rival}
              venue={nextMatch.venue}
              dateLabel={formatMatchDate(nextMatchDate)}
              timeLabel={formatMatchTime(nextMatchDate)}
            />
          </Link>
        </motion.div>
      )}

      {/* ── Live matches section ── */}
      <LiveMatchSection />

      {/* ── El camino (bracket path) ── */}
      {nextMatch && nextMatch.group !== 'A' && (
        <ElCaminoSection
          nextMatchId={nextMatch.id}
          myTeamCode={myTeam.code}
          reduceMotion={!!shouldReduceMotion}
          confirmed={confirmed}
          predicted={predicted}
        />
      )}

      {/* ── Change team CTA ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.38 }}
      >
        <Link
          href="/seleccion"
          className="flex items-center justify-center w-full h-11 rounded-2xl font-semibold text-xs transition-all active:scale-95 gap-2"
          style={{
            background: 'var(--border-subtle)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-dim)',
          }}
        >
          Cambiar mi selección →
        </Link>
      </motion.div>

      {/* ── Upcoming matches (all rounds) ── */}
      <UpcomingMatchesSection reduceMotion={!!shouldReduceMotion} />

      {/* ── Fixture CTA ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.52 }}
      >
        <Link
          href="/fixture"
          className="flex items-center justify-center w-full h-12 rounded-2xl font-semibold text-sm transition-all active:scale-95"
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
          }}
        >
          Ver fixture completo →
        </Link>
      </motion.div>
    </div>
  );
}

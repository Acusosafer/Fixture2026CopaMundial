'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useMySelection } from '@/hooks/useMySelection';
import { useLiveScores } from '@/hooks/useLiveScores';
import { getTeamByCode, type Team } from '@/lib/teams';
import { getNextMatchForTeam, staticMatches } from '@/lib/fixtures-static';
import { isActiveStatus } from '@/lib/live';
import { FlagBackground } from '@/components/team/FlagBackground';
import { WeatherChip } from '@/components/weather/WeatherChip';
import { CountdownHero } from '@/components/match/CountdownHero';
import { NextMatchCard } from '@/components/match/NextMatchCard';
import { LiveMatchSection } from '@/components/home/LiveMatchSection';

const ARGENTINA = getTeamByCode('AR')!;
const TOURNAMENT_START = new Date('2026-06-12T21:00:00Z'); // apertura MX vs ZA

const ART_OFFSET_MS = -3 * 60 * 60 * 1000;
function toART(date: Date): Date {
  return new Date(date.getTime() + ART_OFFSET_MS);
}

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function isMatchDay(matchDate: Date): boolean {
  const todayART = toART(new Date());
  const matchART = toART(matchDate);
  return (
    todayART.getUTCFullYear() === matchART.getUTCFullYear() &&
    todayART.getUTCMonth() === matchART.getUTCMonth() &&
    todayART.getUTCDate() === matchART.getUTCDate()
  );
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
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const h  = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${h}:${mi}`;
}

const TBD_TEAM: Team = {
  code: 'TBD',
  name: 'TBD',
  nameEs: 'Por determinar',
  primaryColor: 'var(--text-mute)',
  secondaryColor: 'var(--text-dim)',
  flagUrl: 'https://flagcdn.com/w320/un.png',
  group: '',
};

function UpcomingMatchesSection({ reduceMotion }: { reduceMotion: boolean }) {
  const now = new Date();
  const { scores: liveScores } = useLiveScores();

  // Show today's group-stage matches; if none, show the next 4 upcoming
  const todayART = new Date(now.getTime() + ART_OFFSET_MS);
  const todayStr = `${todayART.getUTCFullYear()}-${String(todayART.getUTCMonth() + 1).padStart(2, '0')}-${String(todayART.getUTCDate()).padStart(2, '0')}`;

  const todayMatches = staticMatches.filter((m) => {
    const d = new Date(new Date(m.date).getTime() + ART_OFFSET_MS);
    const ds = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    return ds === todayStr && ['A','B','C','D','E','F','G','H','I','J','K','L'].includes(m.group);
  });

  const upcoming = (todayMatches.length > 0
    ? todayMatches
    : staticMatches
        .filter((m) => new Date(m.date) > now && ['A','B','C','D','E','F','G','H','I','J','K','L'].includes(m.group))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  ).slice(0, 4);

  const sectionTitle = todayMatches.length > 0 ? 'Grupos hoy' : 'Próximos partidos';

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
        <div className="flex flex-col gap-2">
          {upcoming.map((m) => {
            const home = getTeamByCode(m.homeTeamCode);
            const away = getTeamByCode(m.awayTeamCode);
            if (!home || !away) return null;
            const live       = liveScores.get(m.id);
            const isLive     = live ? isActiveStatus(live.status) : false;
            const isFinished = live?.status === 'FINISHED' || m.status === 'finished';
            const homeScore  = live?.homeScore ?? m.homeScore;
            const awayScore  = live?.awayScore ?? m.awayScore;

            return (
              <Link
                key={m.id}
                href={`/partido/${m.id}`}
                className="flex items-center justify-between gap-2 py-2 rounded-xl px-2 transition-all active:scale-[0.98] hover:bg-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="relative w-7 h-5 shrink-0">
                    <Image src={home.flagUrl} alt={home.nameEs} fill className="object-contain" unoptimized />
                  </div>
                  <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {home.nameEs}
                  </span>
                </div>

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

                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-xs font-semibold truncate text-right" style={{ color: 'var(--text)' }}>
                    {away.nameEs}
                  </span>
                  <div className="relative w-7 h-5 shrink-0">
                    <Image src={away.flagUrl} alt={away.nameEs} fill className="object-contain" unoptimized />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export default function HomePage() {
  const { team } = useMySelection();
  const shouldReduceMotion = useReducedMotion();

  const myTeam = team ?? ARGENTINA;

  const nextMatch = useMemo(
    () => getNextMatchForTeam(myTeam.code),
    [myTeam.code]
  );

  const nextMatchDate = nextMatch ? new Date(nextMatch.date) : TOURNAMENT_START;

  const rivalCode = nextMatch
    ? nextMatch.homeTeamCode === myTeam.code
      ? nextMatch.awayTeamCode
      : nextMatch.homeTeamCode
    : null;

  const rival = rivalCode ? (getTeamByCode(rivalCode) ?? TBD_TEAM) : TBD_TEAM;

  const fadeInUp = {
    initial: shouldReduceMotion ? {} : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.08 } },
  };

  const countdownLabel = nextMatch
    ? 'PRÓXIMO PARTIDO'
    : 'INICIO DEL TORNEO';

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* â”€â”€ Hero â”€â”€ */}
      <section className="relative min-h-[360px] rounded-3xl overflow-hidden flex flex-col justify-end p-6 gap-4">
        <FlagBackground flagUrl={myTeam.flagUrl} teamName={myTeam.nameEs} />

        <motion.div
          className="relative z-10 flex flex-col gap-4"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Match-day chip */}
          {isMatchDay(nextMatchDate) && (
            <motion.div variants={fadeInUp} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-live"
                  style={{ background: 'var(--accent)' }}
                />
                Hoy juega {myTeam.nameEs}
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

          {/* Countdown */}
          <motion.div variants={fadeInUp} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            <CountdownHero targetDate={nextMatchDate} label={countdownLabel} white />
          </motion.div>
        </motion.div>
      </section>

      {/* â”€â”€ Next match card â”€â”€ */}
      {nextMatch && (
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

      {/* â”€â”€ Live matches â”€â”€ */}
      <LiveMatchSection />

      {/* â”€â”€ Change team CTA â”€â”€ */}
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

      {/* â”€â”€ Upcoming matches â”€â”€ */}
      <UpcomingMatchesSection reduceMotion={!!shouldReduceMotion} />

      {/* â”€â”€ Fixture CTA â”€â”€ */}
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

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveScores } from '@/hooks/useLiveScores';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';

function minuteLabel(minute: number, injuryTime: number, status: string): string {
  if (status === 'PAUSED') return 'Entretiempo';
  if (status === 'FINISHED') return 'Finalizado';
  if (injuryTime > 0) return `${minute}+${injuryTime}'`;
  return `${minute}'`;
}

export function LiveMatchSection() {
  const { scores } = useLiveScores();

  const liveMatches = staticMatches
    .filter(m => {
      const s = scores.get(m.id);
      return s && (s.status === 'IN_PLAY' || s.status === 'PAUSED' || s.status === 'FINISHED');
    })
    .map(m => ({ match: m, score: scores.get(m.id)! }))
    .sort((a, b) => {
      // IN_PLAY first, then PAUSED, then FINISHED
      const order = { IN_PLAY: 0, PAUSED: 1, FINISHED: 2, SUSPENDED: 3 };
      return (order[a.score.status] ?? 3) - (order[b.score.status] ?? 3);
    });

  if (liveMatches.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="live-section"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse-live"
              style={{ background: 'var(--live)' }}
            />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--live)' }}>
              En vivo ahora
            </span>
          </div>
          <Link href="/fixture" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            Ver todos →
          </Link>
        </div>

        {liveMatches.map(({ match, score }) => {
          const home = getTeamByCode(match.homeTeamCode);
          const away = getTeamByCode(match.awayTeamCode);
          const isHalfTime = score.status === 'PAUSED';
          const isFinished = score.status === 'FINISHED';
          const label = minuteLabel(score.minute, score.injuryTime, score.status);

          return (
            <Link key={match.id} href={`/partido/${match.id}`} className="block">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isFinished
                    ? 'var(--bg-card)'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, var(--bg-card) 60%)',
                  border: isFinished
                    ? '1px solid var(--border-color)'
                    : '1px solid rgba(239,68,68,0.35)',
                  boxShadow: isFinished ? 'none' : '0 0 20px rgba(239,68,68,0.08)',
                }}
              >
                {/* Status bar */}
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5">
                    {!isFinished && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: 'var(--live)',
                          animation: isHalfTime ? 'none' : 'pulse-live 1.5s ease-in-out infinite',
                        }}
                      />
                    )}
                    <span
                      className="text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: isFinished ? 'var(--text-dim)' : 'var(--live)' }}
                    >
                      {label}
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>
                    {match.venue.split(',')[0]}
                  </span>
                </div>

                {/* Teams + score */}
                <div className="flex items-center px-4 py-4 gap-3">
                  {/* Home team */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {home?.flagUrl && (
                      <div className="relative w-9 h-6 shrink-0 rounded-sm overflow-hidden">
                        <Image src={home.flagUrl} alt={home.nameEs} fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <span
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {home?.nameEs ?? match.homeTeamCode}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 flex items-baseline gap-2 px-3 py-1.5 rounded-xl"
                    style={{
                      background: isFinished ? 'var(--border-subtle)' : 'rgba(239,68,68,0.12)',
                      border: isFinished ? '1px solid var(--border-color)' : '1px solid rgba(239,68,68,0.2)',
                    }}
                  >
                    <span
                      className="text-2xl font-black font-heading tabular-nums leading-none"
                      style={{ color: isFinished ? 'var(--text-dim)' : 'var(--live)' }}
                    >
                      {score.homeScore}
                    </span>
                    <span className="text-base font-bold" style={{ color: 'var(--text-mute)' }}>–</span>
                    <span
                      className="text-2xl font-black font-heading tabular-nums leading-none"
                      style={{ color: isFinished ? 'var(--text-dim)' : 'var(--live)' }}
                    >
                      {score.awayScore}
                    </span>
                  </div>

                  {/* Away team */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <span
                      className="text-sm font-bold truncate text-right"
                      style={{ color: 'var(--text)' }}
                    >
                      {away?.nameEs ?? match.awayTeamCode}
                    </span>
                    {away?.flagUrl && (
                      <div className="relative w-9 h-6 shrink-0 rounded-sm overflow-hidden">
                        <Image src={away.flagUrl} alt={away.nameEs} fill className="object-contain" unoptimized />
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA footer */}
                <div
                  className="flex items-center justify-center px-4 py-2 gap-1"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: isFinished ? 'var(--accent)' : 'var(--live)' }}>
                    {isFinished ? 'Ver resultado completo' : 'Ver detalles del partido'} →
                  </span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

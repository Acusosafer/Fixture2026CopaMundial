'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveScores } from '@/hooks/useLiveScores';
import { useBracketResolution } from '@/hooks/useBracketResolution';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';
import { isActiveStatus, type LiveScore } from '@/lib/live';

function minuteLabel(minute: number, injuryTime: number, status: LiveScore['status']): string {
  switch (status) {
    case 'PAUSED':    return 'Entretiempo';
    case 'PAUSED_ET': return 'Desc. T. Extra';
    case 'PENALTIES': return 'Penales';
    case 'FINISHED':  return 'Finalizado';
    case 'EXTRA_TIME':
    case 'IN_PLAY':
      return injuryTime > 0 ? `${minute}+${injuryTime}'` : `${minute}'`;
    default:          return `${minute}'`;
  }
}

const ART_OFFSET_MS = -3 * 60 * 60 * 1000;

function toARTDateStr(isoDate: string): string {
  const d = new Date(new Date(isoDate).getTime() + ART_OFFSET_MS);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function yesterdayARTStr(): string {
  const d = new Date(new Date().getTime() + ART_OFFSET_MS - 24 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function LiveMatchSection() {
  const { scores } = useLiveScores();
  const { confirmed } = useBracketResolution();
  const resolveCode = (code: string) => confirmed.get(code) ?? code;

  const yesterday = yesterdayARTStr();

  const liveMatches = staticMatches
    .filter(m => {
      const s = scores.get(m.id);
      if (!s) return false;
      if (isActiveStatus(s.status)) return true;
      // Finalizados: solo los de ayer
      if (s.status === 'FINISHED') return toARTDateStr(m.date) === yesterday;
      return false;
    })
    .map(m => ({ match: m, score: scores.get(m.id)! }))
    .sort((a, b) => {
      const order: Record<string, number> = { IN_PLAY: 0, EXTRA_TIME: 0, PENALTIES: 0, PAUSED: 1, PAUSED_ET: 1, FINISHED: 2, SUSPENDED: 3 };
      return (order[a.score.status] ?? 3) - (order[b.score.status] ?? 3);
    });

  if (liveMatches.length === 0) return null;

  const anyLive = liveMatches.some(({ score }) => isActiveStatus(score.status));

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
            {anyLive && (
              <span
                className="w-2 h-2 rounded-full animate-pulse-live"
                style={{ background: 'var(--live)' }}
              />
            )}
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: anyLive ? 'var(--live)' : 'var(--text-dim)' }}
            >
              {anyLive ? 'En vivo ahora' : 'Últimos resultados'}
            </span>
          </div>
          <Link href="/fixture" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            Ver todos →
          </Link>
        </div>

        {liveMatches.map(({ match, score }) => {
          const home = getTeamByCode(resolveCode(match.homeTeamCode));
          const away = getTeamByCode(resolveCode(match.awayTeamCode));
          const isHalfTime = score.status === 'PAUSED' || score.status === 'PAUSED_ET';
          const isFinished = score.status === 'FINISHED';
          const isActive = isActiveStatus(score.status);
          const label = minuteLabel(score.minute, score.injuryTime, score.status);

          return (
            <Link key={match.id} href={`/partido/${match.id}`} className="block">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, var(--bg-card) 60%)'
                    : 'var(--bg-card)',
                  border: isActive
                    ? '1px solid rgba(239,68,68,0.35)'
                    : '1px solid var(--border-color)',
                  boxShadow: isActive ? '0 0 20px rgba(239,68,68,0.08)' : 'none',
                }}
              >
                {/* Status bar */}
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5">
                    {isActive && (
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
                      style={{ color: isActive ? 'var(--live)' : 'var(--text-dim)' }}
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
                      background: isActive ? 'rgba(239,68,68,0.12)' : 'var(--border-subtle)',
                      border: isActive ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border-color)',
                    }}
                  >
                    <span
                      className="text-2xl font-black font-heading tabular-nums leading-none"
                      style={{ color: isActive ? 'var(--live)' : 'var(--text-dim)' }}
                    >
                      {score.homeScore}
                    </span>
                    <span className="text-base font-bold" style={{ color: 'var(--text-mute)' }}>–</span>
                    <span
                      className="text-2xl font-black font-heading tabular-nums leading-none"
                      style={{ color: isActive ? 'var(--live)' : 'var(--text-dim)' }}
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
                    {isActive ? 'Ver detalles del partido' : 'Ver resultado completo'} →
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

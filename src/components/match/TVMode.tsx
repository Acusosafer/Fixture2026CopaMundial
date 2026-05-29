'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tv, X } from 'lucide-react';
import { useTVMode } from '@/hooks/useTVMode';
import { useLiveScores } from '@/hooks/useLiveScores';
import { ScoreDisplay } from '@/components/match/ScoreDisplay';

interface TVModeProps {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamColor: string;
  awayTeamColor: string;
}

export function TVMode({
  matchId,
  homeTeamName,
  awayTeamName,
  homeTeamColor,
  awayTeamColor,
}: TVModeProps) {
  const { isTV, enter, exit } = useTVMode();
  const { scores } = useLiveScores();
  const live = scores.get(matchId);

  const isLive = live?.status === 'IN_PLAY' || live?.status === 'PAUSED';
  if (!isLive) return null;

  const homeScore = live?.homeScore ?? 0;
  const awayScore = live?.awayScore ?? 0;
  const minute = live?.minute ?? 0;
  const injuryTime = live?.injuryTime ?? 0;
  const minuteLabel =
    live?.status === 'PAUSED'
      ? 'Entretiempo'
      : injuryTime > 0
      ? `${minute}+${injuryTime}'`
      : `${minute}'`;

  return (
    <>
      {/* Botón de entrada */}
      <button
        onClick={enter}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-dim)',
        }}
        aria-label="Modo TV"
      >
        <Tv size={13} />
        Modo TV
      </button>

      {/* Overlay TV */}
      <AnimatePresence>
        {isTV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
            style={{ background: '#060D15' }}
            onClick={exit}
          >
            {/* Botón cerrar */}
            <button
              onClick={(e) => { e.stopPropagation(); exit(); }}
              className="absolute top-5 right-5 p-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
              aria-label="Salir del Modo TV"
            >
              <X size={18} />
            </button>

            {/* Minuto / estado */}
            <div className="flex items-center gap-2 mb-10">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'var(--ember)',
                  animation: 'pulse-live 1.4s ease-in-out infinite',
                }}
              />
              <span
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: 'var(--ember)' }}
              >
                {minuteLabel}
              </span>
            </div>

            {/* Marcador */}
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <ScoreDisplay score={homeScore} size="lg" color="default" className="!text-[96px]" />
                <span
                  className="text-base font-semibold uppercase tracking-wider text-center"
                  style={{ color: homeTeamColor, maxWidth: 120 }}
                >
                  {homeTeamName}
                </span>
              </div>

              <span
                className="text-5xl font-light"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                —
              </span>

              <div className="flex flex-col items-center gap-3">
                <ScoreDisplay score={awayScore} size="lg" color="default" className="!text-[96px]" />
                <span
                  className="text-base font-semibold uppercase tracking-wider text-center"
                  style={{ color: awayTeamColor, maxWidth: 120 }}
                >
                  {awayTeamName}
                </span>
              </div>
            </div>

            {/* Hint */}
            <p
              className="absolute bottom-8 text-xs"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              Toca para salir
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

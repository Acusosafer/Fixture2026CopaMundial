'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getTeamByCode } from '@/lib/teams';
import type { StaticMatch } from '@/lib/fixtures-static';

export type ResultOverride = 'home' | 'draw' | 'away';
export type SimulatedResults = Record<number, ResultOverride>;

interface ScenarioSimulatorProps {
  isOpen: boolean;
  pendingMatches: StaticMatch[];
  simulated: SimulatedResults;
  onChange: (matchId: number, result: ResultOverride) => void;
  onReset: () => void;
  onClose: () => void;
}

const RESULT_OPTS: { key: ResultOverride; label: string }[] = [
  { key: 'home', label: 'Local' },
  { key: 'draw', label: 'Empate' },
  { key: 'away', label: 'Visita' },
];

export function ScenarioSimulator({
  isOpen,
  pendingMatches,
  simulated,
  onChange,
  onReset,
  onClose,
}: ScenarioSimulatorProps) {
  const prefersReduced = useReducedMotion();
  const spring = prefersReduced
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 300, damping: 35 };

  const hasSimulated = Object.keys(simulated).length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            className="fixed left-0 right-0 z-50 rounded-t-[28px] px-5 pt-3 flex flex-col"
            style={{
              bottom: 'calc(4rem + env(safe-area-inset-bottom))',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderBottom: 'none',
              maxHeight: '74vh',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center mb-4 flex-shrink-0">
              <div className="rounded-full w-10 h-1" style={{ background: 'var(--border-color)' }} />
            </div>

            {/* Título + reset */}
            <div className="flex items-start justify-between mb-5 flex-shrink-0">
              <div>
                <h2 className="font-heading text-xl tracking-wide" style={{ color: 'var(--text)' }}>
                  ¿QUÉ PASA SI...?
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-mute)' }}>
                  Simulá resultados hipotéticos y mirá la tabla
                </p>
              </div>
              {hasSimulated && (
                <button
                  onClick={onReset}
                  className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity active:opacity-70"
                  style={{
                    background: 'var(--border-color)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-dim)',
                  }}
                >
                  Resetear
                </button>
              )}
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto pb-4">
              {pendingMatches.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: 'var(--text-mute)' }}>
                  Todos los partidos del grupo han sido jugados.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingMatches.map((match) => {
                    const home = getTeamByCode(match.homeTeamCode);
                    const away = getTeamByCode(match.awayTeamCode);
                    const selected = simulated[match.id] ?? null;

                    return (
                      <div
                        key={match.id}
                        className="rounded-2xl p-3.5"
                        style={{
                          background: selected
                            ? 'var(--plasma-dim, rgba(99,102,241,0.12))'
                            : 'var(--border-subtle)',
                          border: `1px solid ${selected ? 'var(--plasma, #6366f1)' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'background 0.2s, border-color 0.2s',
                        }}
                      >
                        {/* Equipos */}
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <span
                            className="text-xs font-semibold flex-1 truncate"
                            style={{ color: selected === 'home' ? 'var(--plasma, #6366f1)' : 'var(--text)' }}
                          >
                            {home?.nameEs ?? match.homeTeamCode}
                          </span>
                          <span className="text-[10px] flex-shrink-0 font-medium" style={{ color: 'var(--text-mute)' }}>
                            vs
                          </span>
                          <span
                            className="text-xs font-semibold flex-1 truncate text-right"
                            style={{ color: selected === 'away' ? 'var(--plasma, #6366f1)' : 'var(--text)' }}
                          >
                            {away?.nameEs ?? match.awayTeamCode}
                          </span>
                        </div>

                        {/* Botones de resultado */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {RESULT_OPTS.map(({ key, label }) => {
                            const isActive = selected === key;
                            return (
                              <button
                                key={key}
                                onClick={() => onChange(match.id, key)}
                                className="py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                style={{
                                  background: isActive
                                    ? 'var(--plasma, #6366f1)'
                                    : 'var(--bg-card)',
                                  border: `1px solid ${isActive ? 'var(--plasma, #6366f1)' : 'rgba(255,255,255,0.06)'}`,
                                  color: isActive ? '#fff' : 'var(--text-mute)',
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botón Confirmar — siempre visible */}
            <div className="flex-shrink-0 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                {hasSimulated ? 'Ver resultado ✓' : 'Cerrar'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

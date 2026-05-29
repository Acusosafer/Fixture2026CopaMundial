'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { LineupPlayer, MatchEvent } from '@/lib/live';

// ─── TheSportsDB ──────────────────────────────────────────────

interface TsdbPlayer {
  strThumb: string | null;
  dateBorn: string | null;
}

function calcAge(dateBorn: string | null): number | null {
  if (!dateBorn) return null;
  const birth = new Date(dateBorn);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

function usePlayerPhoto(name: string | null) {
  const [player, setPlayer] = useState<TsdbPlayer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!name) { setPlayer(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    setPlayer(null);

    fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`,
      { signal: ctrl.signal }
    )
      .then((r) => r.json())
      .then((json: { player?: TsdbPlayer[] | null }) => {
        setPlayer(json.player?.[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [name]);

  return { player, loading };
}

// ─── Stats derivados de los eventos ───────────────────────────

function playerStats(name: string, events: MatchEvent[]) {
  let goals = 0, ownGoals = 0, yellows = 0, reds = 0;
  for (const e of events) {
    const isPlayer = e.playerName === name;
    if (!isPlayer) continue;
    if (e.type === 'GOAL' || e.type === 'PENALTY') goals++;
    if (e.type === 'OWN_GOAL') ownGoals++;
    if (e.type === 'YELLOW_CARD') yellows++;
    if (e.type === 'RED_CARD' || e.type === 'YELLOW_RED_CARD') reds++;
  }
  return { goals, ownGoals, yellows, reds };
}

function positionLabel(pos: string): string {
  const p = pos.split('-')[0].toUpperCase();
  if (p === 'G' || p === 'GK') return 'Portero';
  if (p === 'DEF' || p === 'D') return 'Defensor';
  if (p === 'MID' || p === 'M') return 'Mediocampista';
  if (p === 'FWD' || p === 'F' || p === 'ATT') return 'Delantero';
  return pos;
}

// ─── PlayerSheet ───────────────────────────────────────────────

export interface PlayerSheetProps {
  player: LineupPlayer | null;
  events: MatchEvent[];
  onClose: () => void;
}

export function PlayerSheet({ player, events, onClose }: PlayerSheetProps) {
  const prefersReduced = useReducedMotion();
  const spring = prefersReduced
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 300, damping: 35 };

  const { player: tsdb, loading } = usePlayerPhoto(player?.name ?? null);
  const stats = player ? playerStats(player.name, events) : null;
  const age = calcAge(tsdb?.dateBorn ?? null);
  const thumb = tsdb?.strThumb ?? null;

  // Initials fallback
  const initials = player
    ? player.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <AnimatePresence>
      {player && (
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
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] px-5 pb-10 pt-3"
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderBottom: 'none',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center mb-5">
              <div className="rounded-full w-10 h-1" style={{ background: 'var(--border-color)' }} />
            </div>

            {/* Avatar + nombre */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="relative flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ width: 72, height: 72, background: 'var(--border-subtle)' }}
              >
                {loading && (
                  <div className="absolute inset-0 animate-pulse" style={{ background: 'var(--border-color)' }} />
                )}
                {!loading && thumb ? (
                  <Image src={thumb} alt={player.name} fill className="object-cover object-top" sizes="72px" />
                ) : !loading ? (
                  <span className="text-xl font-black" style={{ color: 'var(--text-dim)' }}>{initials}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-lg font-black leading-tight truncate" style={{ color: 'var(--text)' }}>
                  {player.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                  >
                    #{player.number}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {positionLabel(player.position)}
                  </span>
                  {age !== null && (
                    <span className="text-xs" style={{ color: 'var(--text-mute)' }}>
                      · {age} años
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats del partido */}
            {stats && (
              <div
                className="rounded-2xl p-4 grid grid-cols-4 gap-3 text-center"
                style={{ background: 'var(--bg-2, var(--border-subtle))', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <StatCell label="Goles" value={stats.goals} color={stats.goals > 0 ? 'var(--accent)' : undefined} icon="⚽" />
                <StatCell label="A. gol" value={stats.ownGoals} color={stats.ownGoals > 0 ? 'var(--live)' : undefined} icon="⚽" />
                <StatCell
                  label="Amarillas"
                  value={stats.yellows}
                  color={stats.yellows > 0 ? '#FFD700' : undefined}
                  icon={<CardIcon color="#FFD700" />}
                />
                <StatCell
                  label="Rojas"
                  value={stats.reds}
                  color={stats.reds > 0 ? 'var(--live)' : undefined}
                  icon={<CardIcon color="var(--live)" />}
                />
              </div>
            )}

            {/* Sin eventos: mensaje */}
            {stats && stats.goals === 0 && stats.ownGoals === 0 && stats.yellows === 0 && stats.reds === 0 && (
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-mute)' }}>
                Sin incidencias registradas en este partido
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CardIcon({ color }: { color: string }) {
  return (
    <span
      className="inline-block rounded-sm mx-auto"
      style={{ width: 10, height: 14, background: color, display: 'block' }}
    />
  );
}

function StatCell({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-base leading-none">{icon}</div>
      <span
        className="text-xl font-black tabular-nums"
        style={{ color: color ?? 'var(--text-mute)' }}
      >
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-mute)' }}>
        {label}
      </span>
    </div>
  );
}

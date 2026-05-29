'use client';

import { useLiveScores } from '@/hooks/useLiveScores';

interface LiveStatusBadgeProps {
  matchId: number;
  staticStatus: string;
}

export function LiveStatusBadge({ matchId, staticStatus }: LiveStatusBadgeProps) {
  const { scores } = useLiveScores();
  const live = scores.get(matchId);

  const isLive     = live?.status === 'IN_PLAY' || live?.status === 'PAUSED';
  const isFinished = live?.status === 'FINISHED' || staticStatus === 'finished';

  if (isLive) {
    const label = live?.status === 'PAUSED' ? 'Entretiempo' : 'En Vivo';
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{ background: 'var(--live-dim)', border: '1px solid var(--live-border)', color: 'var(--live)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: 'var(--live)' }} />
        {label}
      </div>
    );
  }

  if (isFinished) {
    return (
      <div
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
        style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-dim)' }}
      >
        Finalizado
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
    >
      Programado
    </div>
  );
}

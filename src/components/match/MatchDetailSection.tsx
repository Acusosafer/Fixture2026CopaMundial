'use client';

import { useLiveScores } from '@/hooks/useLiveScores';
import { useMatchDetail } from '@/hooks/useMatchDetail';
import { useH2H } from '@/hooks/useH2H';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { MatchStatsPanel } from '@/components/match/MatchStats';
import { HeadToHeadPanel } from '@/components/match/HeadToHead';

interface MatchDetailSectionProps {
  matchId: number;
  staticStatus: string;
  homeTeamName: string;
  awayTeamName: string;
}

function SkeletonCard({ height }: { height: number }) {
  return (
    <div
      className="rounded-2xl animate-pulse"
      style={{
        height,
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    />
  );
}

export function MatchDetailSection({
  matchId,
  staticStatus,
  homeTeamName,
  awayTeamName,
}: MatchDetailSectionProps) {
  const { scores } = useLiveScores();
  const live = scores.get(matchId);

  const isLive     = live?.status === 'IN_PLAY' || live?.status === 'PAUSED';
  const isFinished = live?.status === 'FINISHED' || staticStatus === 'finished';
  const showDetail = isLive || isFinished;

  const { detail, isLoading: loadingDetail } = useMatchDetail(matchId, isLive, isFinished);
  const { h2h, isLoading: loadingH2H }       = useH2H(matchId);

  // Partido aún no empezó — solo mostrar H2H
  if (!showDetail) {
    return (
      <div className="space-y-4">
        {loadingH2H ? (
          <SkeletonCard height={160} />
        ) : h2h ? (
          <HeadToHeadPanel h2h={h2h} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
        ) : (
          <>
            <div
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <h3 className="font-heading text-xl tracking-wide" style={{ color: 'var(--text-dim)' }}>
                HISTORIAL
              </h3>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
                Sin enfrentamientos oficiales registrados
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mute)' }}>
                {homeTeamName} y {awayTeamName} no se han enfrentado en una Copa del Mundo ni en competencias oficiales de la FIFA con datos disponibles.
              </p>
            </div>
            <div
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: 'var(--border-subtle)', border: '1px dashed var(--accent-border)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Próximamente</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mute)' }}>
                Eventos, alineaciones y estadísticas disponibles cuando comience el partido.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  // Cargando
  if (loadingDetail && !detail) {
    return (
      <div className="space-y-4">
        <SkeletonCard height={140} />
        <SkeletonCard height={200} />
        <SkeletonCard height={160} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {detail?.stats && (
        <MatchStatsPanel
          stats={detail.stats}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
        />
      )}

      {/* Events + Lineups */}
      {detail && (
        <MatchTimeline
          events={detail.events}
          homeLineup={detail.homeLineup}
          awayLineup={detail.awayLineup}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
        />
      )}

      {/* H2H */}
      {h2h ? (
        <HeadToHeadPanel h2h={h2h} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
      ) : (
        <div
          className="rounded-2xl p-4 flex flex-col gap-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="font-heading text-xl tracking-wide" style={{ color: 'var(--text-dim)' }}>
            HISTORIAL
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mute)' }}>
            {homeTeamName} y {awayTeamName} no tienen historial oficial registrado en Copas del Mundo.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { CountdownHero } from '@/components/match/CountdownHero';
import { ScoreDisplay } from '@/components/match/ScoreDisplay';
import { TVMode } from '@/components/match/TVMode';
import { useLiveScores } from '@/hooks/useLiveScores';
import { useGoalEffect } from '@/hooks/useGoalEffect';
import type { StaticMatch } from '@/lib/fixtures-static';
import type { Team } from '@/lib/teams';

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatMatchDateTimeART(date: Date): string {
  const d = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 || 12;
  return `${DAYS_ES[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]}, ${h12}:${m} ${ampm} (hora Argentina)`;
}

interface MatchDetailClientProps {
  match: StaticMatch;
  homeTeam: Team;
  awayTeam: Team;
}

export function MatchDetailClient({ match, homeTeam, awayTeam }: MatchDetailClientProps) {
  const { scores } = useLiveScores();
  const live = scores.get(match.id);
  const { triggerGoal } = useGoalEffect();

  const isLive     = live?.status === 'IN_PLAY' || live?.status === 'PAUSED';
  const isFinished = live?.status === 'FINISHED' || match.status === 'finished';
  const homeScore  = live?.homeScore ?? match.homeScore;
  const awayScore  = live?.awayScore ?? match.awayScore;
  const minute     = live?.minute ?? 0;
  const injuryTime = live?.injuryTime ?? 0;

  // Detect goals by comparing previous scores
  const prevHomeScore = useRef<number | null>(null);
  const prevAwayScore = useRef<number | null>(null);

  useEffect(() => {
    if (!isLive) return;
    const hs = homeScore ?? 0;
    const as_ = awayScore ?? 0;
    if (prevHomeScore.current !== null && hs > prevHomeScore.current) {
      const scoreLabel = `${homeTeam.nameEs} ${hs} – ${as_} ${awayTeam.nameEs}`;
      triggerGoal(match.homeTeamCode, homeTeam.nameEs, scoreLabel);
    }
    if (prevAwayScore.current !== null && as_ > prevAwayScore.current) {
      const scoreLabel = `${homeTeam.nameEs} ${hs} – ${as_} ${awayTeam.nameEs}`;
      triggerGoal(match.awayTeamCode, awayTeam.nameEs, scoreLabel);
    }
    prevHomeScore.current = hs;
    prevAwayScore.current = as_;
  }, [homeScore, awayScore, isLive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Upcoming match — show countdown
  if (!isLive && !isFinished) {
    const targetDate = new Date(match.date);
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <CountdownHero targetDate={targetDate} label="FALTAN PARA EL PARTIDO" />
        <p className="text-xs" style={{ color: 'var(--text-mute)' }}>
          {formatMatchDateTimeART(targetDate)}
        </p>
      </div>
    );
  }

  // Live match
  if (isLive) {
    const minuteLabel = live?.status === 'PAUSED'
      ? 'Entretiempo'
      : injuryTime > 0
      ? `${minute}+${injuryTime}'`
      : `${minute}'`;

    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse-live" style={{ background: 'var(--live)' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--live)' }}>
            {minuteLabel}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span style={{ color: homeTeam.primaryColor }}>
            <ScoreDisplay score={homeScore ?? 0} size="lg" />
          </span>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-mute)' }}>:</span>
          <span style={{ color: awayTeam.primaryColor }}>
            <ScoreDisplay score={awayScore ?? 0} size="lg" />
          </span>
        </div>
        <TVMode
          matchId={match.id}
          homeTeamName={homeTeam.nameEs}
          awayTeamName={awayTeam.nameEs}
          homeTeamColor={homeTeam.primaryColor}
          awayTeamColor={awayTeam.primaryColor}
        />
      </div>
    );
  }

  // Finished
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-mute)' }}>
        Resultado final
      </p>
      <div className="flex items-center gap-6">
        <ScoreDisplay
          score={homeScore ?? 0}
          size="lg"
          color={(homeScore ?? 0) > (awayScore ?? 0) ? 'gold' : 'default'}
        />
        <span className="text-3xl font-bold" style={{ color: 'var(--text-mute)' }}>:</span>
        <ScoreDisplay
          score={awayScore ?? 0}
          size="lg"
          color={(awayScore ?? 0) > (homeScore ?? 0) ? 'gold' : 'default'}
        />
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useBracketResolution } from '@/hooks/useBracketResolution';
import { getTeamByCode, type Team } from '@/lib/teams';
import { MatchDetailClient } from '@/components/match/MatchDetailClient';
import { MatchDetailSection } from '@/components/match/MatchDetailSection';
import type { StaticMatch } from '@/lib/fixtures-static';

const TBD: Team = {
  code: 'TBD',
  name: 'TBD',
  nameEs: 'Por determinar',
  primaryColor: '#4A5273',
  secondaryColor: '#8892B0',
  flagUrl: 'https://flagcdn.com/w320/un.png',
  group: '',
};

interface Props {
  match: StaticMatch;
}

export function PartidoTeams({ match }: Props) {
  const { confirmed } = useBracketResolution();

  const resolveCode = (code: string) => confirmed.get(code) ?? code;

  const homeTeam = getTeamByCode(resolveCode(match.homeTeamCode)) ?? TBD;
  const awayTeam = getTeamByCode(resolveCode(match.awayTeamCode)) ?? TBD;

  return (
    <>
      {/* Teams row */}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div
            className="relative w-16 h-16 rounded-full overflow-hidden"
            style={{ border: '2px solid var(--border-color)' }}
          >
            <Image src={homeTeam.flagUrl} alt={homeTeam.nameEs} fill unoptimized className="object-cover" />
          </div>
          <span className="text-sm font-semibold text-center leading-tight" style={{ color: 'var(--text)' }}>
            {homeTeam.nameEs}
          </span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-mute)' }}>
            Local
          </span>
        </div>

        {/* VS / Score */}
        <div className="flex flex-col items-center">
          {match.status === 'finished' ? (
            <div className="flex items-center gap-2 font-heading" style={{ fontSize: '2.5rem', color: 'var(--finished)' }}>
              <span>{match.homeScore}</span>
              <span style={{ color: 'var(--text-mute)', fontSize: '0.8em' }}>–</span>
              <span>{match.awayScore}</span>
            </div>
          ) : (
            <span className="font-heading text-3xl" style={{ color: 'var(--text-mute)' }}>VS</span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div
            className="relative w-16 h-16 rounded-full overflow-hidden"
            style={{ border: '2px solid var(--border-color)' }}
          >
            <Image src={awayTeam.flagUrl} alt={awayTeam.nameEs} fill unoptimized className="object-cover" />
          </div>
          <span className="text-sm font-semibold text-center leading-tight" style={{ color: 'var(--text)' }}>
            {awayTeam.nameEs}
          </span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-mute)' }}>
            Visitante
          </span>
        </div>
      </div>

      {/* Countdown / live score */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <MatchDetailClient match={match} homeTeam={homeTeam} awayTeam={awayTeam} />
      </div>

      {/* Events + Stats + H2H */}
      <MatchDetailSection
        matchId={match.id}
        staticStatus={match.status}
        homeTeamName={homeTeam.nameEs}
        awayTeamName={awayTeam.nameEs}
      />
    </>
  );
}

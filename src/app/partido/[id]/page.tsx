import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';
import { MatchDetailClient } from '@/components/match/MatchDetailClient';
import { LiveStatusBadge } from '@/components/match/LiveStatusBadge';
import { MatchDetailSection } from '@/components/match/MatchDetailSection';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PartidoPage({ params }: PageProps) {
  const { id } = await params;

  const match = staticMatches.find((m) => String(m.id) === id);
  if (!match) {
    notFound();
  }

  const TBD = {
    code: 'TBD',
    name: 'TBD',
    nameEs: 'Por determinar',
    primaryColor: '#4A5273',
    secondaryColor: '#8892B0',
    flagUrl: 'https://flagcdn.com/w320/un.png',
    group: '',
  };

  const homeTeam = getTeamByCode(match.homeTeamCode) ?? TBD;
  const awayTeam = getTeamByCode(match.awayTeamCode) ?? TBD;

  const matchDate = new Date(match.date);

  // Manual UTC-3 conversion — server may run in UTC, always display in ART
  const ART_OFFSET = -3 * 60 * 60 * 1000;
  const matchART = new Date(matchDate.getTime() + ART_OFFSET);
  const DAYS_ES   = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const hART  = matchART.getUTCHours().toString().padStart(2, '0');
  const miART = matchART.getUTCMinutes().toString().padStart(2, '0');
  const matchDateLabel = `${DAYS_ES[matchART.getUTCDay()]} ${matchART.getUTCDate()} de ${MONTHS_ES[matchART.getUTCMonth()]} de ${matchART.getUTCFullYear()}`;
  const matchTimeLabel = `${hART}:${miART} hs. (hora Argentina)`;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8">
      {/* Status */}
      <div className="flex justify-center pt-2">
        <LiveStatusBadge matchId={match.id} staticStatus={match.status} />
      </div>

      {/* Teams header */}
      <div
        className="rounded-3xl p-6 flex flex-col gap-4"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Teams row */}
        <div className="flex items-center justify-between gap-3">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-16 h-16 rounded-full overflow-hidden" style={{ border: '2px solid var(--border-color)' }}>
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

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-16 h-16 rounded-full overflow-hidden" style={{ border: '2px solid var(--border-color)' }}>
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

        {/* Countdown / Score detail */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          <MatchDetailClient match={match} homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      </div>

      {/* Match info */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-color)' }}
      >
        <h2 className="font-heading text-xl tracking-wide" style={{ color: 'var(--text-dim)' }}>
          INFORMACIÓN
        </h2>

        <div className="flex items-start gap-3">
          <MapPin size={16} style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0" />
          <div>
            <Link
              href={`/sedes#${match.stadiumId}`}
              className="text-sm font-medium underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              {match.venue}
            </Link>
            <p className="text-xs" style={{ color: 'var(--text-mute)' }}>Sede · ver info del estadio →</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar size={16} style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{matchDateLabel}</p>
            <p className="text-xs" style={{ color: 'var(--text-mute)' }}>{matchTimeLabel}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users size={16} style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {match.group === 'R32' ? 'Dieciseisavos de final' :
               match.group === 'R16' ? 'Octavos de final' :
               match.group === 'QF'  ? 'Cuartos de final' :
               match.group === 'SF'  ? 'Semifinal' :
               match.group === 'TPO' ? 'Tercer puesto' :
               match.group === 'FIN' ? 'Final' :
               `Grupo ${match.group} · Fase de Grupos`}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-mute)' }}>Fase del torneo</p>
          </div>
        </div>
      </div>

      {/* Events + Lineups */}
      <MatchDetailSection
        matchId={match.id}
        staticStatus={match.status}
        homeTeamName={homeTeam.nameEs}
        awayTeamName={awayTeam.nameEs}
      />
    </div>
  );
}

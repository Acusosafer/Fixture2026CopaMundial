import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';
import { staticMatches } from '@/lib/fixtures-static';
import { LiveStatusBadge } from '@/components/match/LiveStatusBadge';
import { PartidoTeams } from '@/components/match/PartidoTeams';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PartidoPage({ params }: PageProps) {
  const { id } = await params;

  const match = staticMatches.find((m) => String(m.id) === id);
  if (!match) {
    notFound();
  }

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
        <PartidoTeams match={match} />
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

    </div>
  );
}

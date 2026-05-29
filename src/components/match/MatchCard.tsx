'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTeamByCode } from '@/lib/teams';
import type { StaticMatch } from '@/lib/fixtures-static';
import type { LiveScore } from '@/lib/live';

const FLAG_EMOJI: Record<string, string> = {
  MA: '🇲🇦', CO: '🇨🇴', EC: '🇪🇨', NZ: '🇳🇿',
  PT: '🇵🇹', IR: '🇮🇷', PY: '🇵🇾', PA: '🇵🇦',
  FR: '🇫🇷', AU: '🇦🇺', ID: '🇮🇩', AE: '🇦🇪',
  JP: '🇯🇵', CI: '🇨🇮', RS: '🇷🇸', MT: '🇲🇹',
  BR: '🇧🇷', TN: '🇹🇳', KR: '🇰🇷', BH: '🇧🇭',
  NL: '🇳🇱', KE: '🇰🇪', TR: '🇹🇷', CN: '🇨🇳',
  ES: '🇪🇸', NG: '🇳🇬', EG: '🇪🇬', PE: '🇵🇪',
  'GB-ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', SN: '🇸🇳', DK: '🇩🇰', AL: '🇦🇱',
  AR: '🇦🇷', BA: '🇧🇦', CL: '🇨🇱', UZ: '🇺🇿',
  DE: '🇩🇪', UY: '🇺🇾', ZA: '🇿🇦', TH: '🇹🇭',
  MX: '🇲🇽', CA: '🇨🇦', CM: '🇨🇲', JM: '🇯🇲',
  BE: '🇧🇪', HR: '🇭🇷', 'GB-SCT': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', HN: '🇭🇳',
};

function TeamFlag({ code, name, size = 48 }: { code: string; name: string; size?: number }) {
  const team = getTeamByCode(code);
  const flagUrl = team?.flagUrl;

  if (!flagUrl) {
    return (
      <span className="text-3xl leading-none select-none" aria-label={name}>
        {FLAG_EMOJI[code] ?? '🏳️'}
      </span>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-sm flex-shrink-0"
      style={{ width: size, height: Math.round(size * 0.67) }}
    >
      <Image src={flagUrl} alt={name} fill className="object-contain" unoptimized sizes={`${size}px`} />
    </div>
  );
}

function PulseDot() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full animate-pulse-live"
      style={{ background: 'var(--live)' }}
      aria-hidden="true"
    />
  );
}

function formatMatchTime(isoDate: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

const GROUP_LABELS: Record<string, string> = {
  A: 'Grupo A', B: 'Grupo B', C: 'Grupo C', D: 'Grupo D',
  E: 'Grupo E', F: 'Grupo F', G: 'Grupo G', H: 'Grupo H',
  I: 'Grupo I', J: 'Grupo J', K: 'Grupo K', L: 'Grupo L',
  R32: 'Dieciseisavos', R16: 'Octavos de final',
  QF: 'Cuartos de final', SF: 'Semifinal',
  FIN: 'Final', TPO: 'Tercer puesto',
};

interface MatchCardProps {
  match: StaticMatch;
  liveScore?: LiveScore;
  compact?: boolean;
  index?: number;
}

export function MatchCard({ match, liveScore, compact = false, index = 0 }: MatchCardProps) {
  const isLive     = liveScore?.status === 'IN_PLAY' || liveScore?.status === 'PAUSED';
  const isHalfTime = liveScore?.status === 'PAUSED';
  const isFinished = liveScore?.status === 'FINISHED' || match.status === 'finished';
  const homeScore  = liveScore?.homeScore ?? match.homeScore;
  const awayScore  = liveScore?.awayScore ?? match.awayScore;
  const minute     = liveScore?.minute ?? 0;
  const injuryTime = liveScore?.injuryTime ?? 0;
  const homeTeam   = getTeamByCode(match.homeTeamCode);
  const awayTeam   = getTeamByCode(match.awayTeamCode);
  const homeNameEs = homeTeam?.nameEs ?? match.homeTeamCode;
  const awayNameEs = awayTeam?.nameEs ?? match.awayTeamCode;
  const groupLabel = GROUP_LABELS[match.group] ?? match.group;

  return (
    <Link href={`/partido/${match.id}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26, delay: index * 0.04 }}
        className={`rounded-2xl overflow-hidden w-full transition-all active:scale-[0.98] ${compact ? 'p-3' : 'p-4'}`}
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Live badge */}
        {isLive && (
          <div className="flex items-center gap-1.5 mb-3">
            <PulseDot />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--live)' }}>
              {isHalfTime ? 'Entretiempo' : injuryTime > 0 ? `${minute}+${injuryTime}'` : `${minute}'`}
            </span>
          </div>
        )}

        {/* Teams + score */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0" style={{ maxWidth: '40%' }}>
            <TeamFlag code={match.homeTeamCode} name={homeNameEs} size={compact ? 36 : 48} />
            <span
              className="text-xs font-semibold text-center leading-tight truncate w-full"
              style={{ color: 'var(--text)' }}
            >
              {homeNameEs}
            </span>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0 px-1">
            {(isFinished || isLive) && homeScore !== null && awayScore !== null ? (
              <div
                className="flex items-center gap-2 font-heading"
                style={{
                  color: isLive ? 'var(--live)' : 'var(--finished)',
                  fontSize: compact ? '1.5rem' : '2rem',
                  lineHeight: 1,
                }}
              >
                <span>{homeScore}</span>
                <span style={{ color: 'var(--text-mute)', fontSize: '0.8em' }}>–</span>
                <span>{awayScore}</span>
              </div>
            ) : (
              <>
                <span
                  className="font-bold tracking-wide"
                  style={{ color: 'var(--accent)', fontSize: compact ? '0.75rem' : '0.875rem' }}
                >
                  {formatMatchTime(match.date)}
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-mute)' }}>
                  hs. ARG
                </span>
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0" style={{ maxWidth: '40%' }}>
            <TeamFlag code={match.awayTeamCode} name={awayNameEs} size={compact ? 36 : 48} />
            <span
              className="text-xs font-semibold text-center leading-tight truncate w-full"
              style={{ color: 'var(--text)' }}
            >
              {awayNameEs}
            </span>
          </div>
        </div>

        {/* Footer */}
        {!compact && (
          <div
            className="mt-3 pt-3 flex items-center justify-between gap-2 text-[11px]"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <span className="truncate" style={{ color: 'var(--text-dim)' }}>
              📍 {match.venue}
            </span>
            <span className="flex-shrink-0 font-medium" style={{ color: 'var(--text-mute)' }}>
              {groupLabel}
            </span>
          </div>
        )}
      </motion.article>
    </Link>
  );
}

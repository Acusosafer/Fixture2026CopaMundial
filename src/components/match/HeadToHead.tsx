'use client';

import type { HeadToHead, H2HMatch } from '@/lib/live';
import { getTeamByCode } from '@/lib/teams';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(iso));
}

function H2HMatchRow({ match }: { match: H2HMatch }) {
  const home = getTeamByCode(match.homeTeamCode);
  const away = getTeamByCode(match.awayTeamCode);
  return (
    <div className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="text-[10px] flex-shrink-0 w-20" style={{ color: 'var(--text-mute)' }}>
        {formatDate(match.date)}
      </span>
      <span className="flex-1 text-xs text-right truncate" style={{ color: 'var(--text)' }}>
        {home?.nameEs ?? match.homeTeamCode}
      </span>
      <span
        className="flex-shrink-0 text-xs font-black tabular-nums px-2"
        style={{ color: 'var(--accent)', minWidth: 44, textAlign: 'center' }}
      >
        {match.homeScore} - {match.awayScore}
      </span>
      <span className="flex-1 text-xs truncate" style={{ color: 'var(--text)' }}>
        {away?.nameEs ?? match.awayTeamCode}
      </span>
    </div>
  );
}

interface HeadToHeadProps {
  h2h: HeadToHead;
  homeTeamName: string;
  awayTeamName: string;
}

export function HeadToHeadPanel({ h2h, homeTeamName, awayTeamName }: HeadToHeadProps) {
  const total = h2h.homeWins + h2h.awayWins + h2h.draws || 1;
  const homeBarPct = Math.round((h2h.homeWins / total) * 100);
  const drawBarPct = Math.round((h2h.draws / total) * 100);
  const awayBarPct = 100 - homeBarPct - drawBarPct;

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-color)' }}
    >
      <h3 className="font-heading text-xl tracking-wide" style={{ color: 'var(--text-dim)' }}>
        HISTORIAL
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span style={{ color: 'var(--accent)' }}>{h2h.homeWins} V</span>
          <span style={{ color: 'var(--text-mute)' }}>{h2h.draws} E</span>
          <span style={{ color: 'var(--live)' }}>{h2h.awayWins} V</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          <div style={{ width: `${homeBarPct}%`, background: 'var(--accent)', borderRadius: '999px 0 0 999px' }} />
          <div style={{ width: `${drawBarPct}%`, background: 'var(--border-color)' }} />
          <div style={{ width: `${awayBarPct}%`, background: 'rgba(255,59,92,0.7)', borderRadius: '0 999px 999px 0' }} />
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-mute)' }}>
          <span>{homeTeamName}</span>
          <span>{h2h.totalMatches} partidos</span>
          <span>{awayTeamName}</span>
        </div>
      </div>

      {h2h.matches.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-mute)' }}>
            Ultimos partidos
          </p>
          {h2h.matches.map((m, i) => (
            <H2HMatchRow key={i} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

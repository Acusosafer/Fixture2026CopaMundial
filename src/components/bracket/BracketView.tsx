'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { staticMatches } from '@/lib/fixtures-static';

const ROUNDS = [
  { key: 'R32',  label: 'Dieciseisavos', short: 'R32', matchCount: 16 },
  { key: 'R16',  label: 'Octavos',        short: 'R16', matchCount: 8 },
  { key: 'QF',   label: 'Cuartos',        short: 'CF',  matchCount: 4 },
  { key: 'SF',   label: 'Semifinal',      short: 'SF',  matchCount: 2 },
  { key: 'FIN',  label: 'Final',          short: 'F',   matchCount: 1 },
  { key: 'TPO',  label: '3er Puesto',     short: '3°',  matchCount: 1 },
] as const;

const ROUND_DATES: Record<string, string> = {
  R32: '4â€“6 jul',
  R16: '8â€“9 jul',
  QF:  '10â€“12 jul',
  SF:  '14â€“15 jul',
  FIN: '19 jul',
  TPO: '18 jul',
};

const ART = -3 * 60 * 60 * 1000;
const DAYS_SHORT  = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + ART);
  const h  = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} · ${h}:${mi} ART`;
}

function teamLabel(code: string): string {
  if (!code || code === 'TBD') return 'Por definir';
  // W73, W89, etc. â€” winner of match N
  if (/^W\d+$/.test(code)) return `Gan. P${code.slice(1)}`;
  // RU101 â€” runner-up of match N
  if (/^RU\d+$/.test(code)) return `Sub. P${code.slice(2)}`;
  // 1A â€” first place group A
  if (/^\d[A-L]$/.test(code)) return `${code[0]}° Grupo ${code[1]}`;
  // 3ABCDF â€” best 3rd-place from those groups
  if (/^\d[A-L]{2,}$/.test(code)) {
    const pos    = code[0];
    const groups = code.slice(1).split('');
    return `${pos}° 3ro (${groups.join('/')})`;
  }
  return code;
}

function MatchRow({ id, home, away, date, venue }: {
  id: number;
  home: string;
  away: string;
  date: string;
  venue: string;
}) {
  const isTBD = (c: string) => !c || c === 'TBD' || /^[W1-3]/.test(c);

  return (
    <Link
      href={`/partido/${id}`}
      className="rounded-2xl p-3.5 flex flex-col gap-2 transition-all active:scale-[0.98] hover:border-white/20"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
      }}
    >
      {/* Teams */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-sm font-semibold flex-1 truncate"
          style={{ color: isTBD(home) ? 'var(--text-mute)' : 'var(--text)' }}
        >
          {teamLabel(home)}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-md tabular-nums shrink-0"
          style={{
            background: 'var(--border-color)',
            color: 'var(--text-dim)',
          }}
        >
          VS
        </span>
        <span
          className="text-sm font-semibold flex-1 truncate text-right"
          style={{ color: isTBD(away) ? 'var(--text-mute)' : 'var(--text)' }}
        >
          {teamLabel(away)}
        </span>
      </div>

      {/* Date + venue */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: 'var(--text-mute)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-mute)' }}>
            {formatDate(date)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={11} style={{ color: 'var(--text-mute)' }} />
          <span className="text-[11px] truncate max-w-[140px]" style={{ color: 'var(--text-mute)' }}>
            {venue.replace('Estadio ', '')}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BracketView() {
  const [activeRound, setActiveRound] = useState<typeof ROUNDS[number]['key']>('R32');

  const roundMatches = staticMatches.filter((m) => m.group === activeRound);

  const isFinal   = activeRound === 'FIN';
  const isTercero = activeRound === 'TPO';

  return (
    <div className="flex flex-col gap-4">
      {/* Round tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ROUNDS.map((r) => {
          const active = activeRound === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setActiveRound(r.key)}
              className="flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl transition-all"
              style={
                active
                  ? {
                      background: r.key === 'FIN' ? 'rgba(255,215,0,0.15)' : 'var(--accent-dim)',
                      border: r.key === 'FIN'
                        ? '1px solid rgba(255,215,0,0.4)'
                        : '1px solid var(--accent-border)',
                      color: r.key === 'FIN' ? '#FFD700' : 'var(--accent)',
                    }
                  : {
                      background: 'var(--border-subtle)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'var(--text-mute)',
                    }
              }
            >
              <span className="text-xs font-black leading-none">{r.short}</span>
              <span className="text-[9px] mt-0.5 opacity-70">
                {ROUND_DATES[r.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Round title */}
      <div className="flex items-baseline justify-between">
        <h2
          className="text-base font-black"
          style={{ color: isFinal ? '#FFD700' : 'var(--text)' }}
        >
          {ROUNDS.find((r) => r.key === activeRound)?.label}
        </h2>
        <span className="text-xs" style={{ color: 'var(--text-mute)' }}>
          {roundMatches.length} partido{roundMatches.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Matches */}
      <div className="flex flex-col gap-2.5">
        {roundMatches.map((m) => (
          <MatchRow
            key={m.id}
            id={m.id}
            home={m.homeTeamCode}
            away={m.awayTeamCode}
            date={m.date}
            venue={m.venue}
          />
        ))}
      </div>

      {/* Info note */}
      {(isFinal || isTercero) && (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: isFinal ? 'rgba(255,215,0,0.05)' : 'rgba(19,24,41,0.5)',
            border: isFinal
              ? '1px solid rgba(255,215,0,0.15)'
              : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-xs" style={{ color: isFinal ? '#FFD700' : 'var(--text-dim)' }}>
            {isFinal
              ? 'MetLife Stadium, East Rutherford NJ · 19 de julio de 2026'
              : 'Hard Rock Stadium, Miami · 18 de julio de 2026'}
          </p>
        </div>
      )}
    </div>
  );
}

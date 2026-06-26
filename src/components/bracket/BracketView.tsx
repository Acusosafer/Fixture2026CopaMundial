'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ChevronRight, Trophy } from 'lucide-react';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';
import { useBracketResolution, type BracketResolution } from '@/hooks/useBracketResolution';

// ── Round config ──────────────────────────────────────────────────────────────

const ROUNDS = [
  { key: 'R32', label: 'Dieciseisavos', short: '16vos', matchCount: 16, dates: '4–6 jul',  color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)' },
  { key: 'R16', label: 'Octavos',       short: 'Octavos', matchCount: 8, dates: '8–9 jul', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  { key: 'QF',  label: 'Cuartos',       short: 'Cuartos', matchCount: 4, dates: '10–12 jul', color: '#FB923C', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)' },
  { key: 'SF',  label: 'Semifinal',     short: 'Semi',   matchCount: 2, dates: '14–15 jul', color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  { key: 'FIN', label: 'Final',         short: 'Final',  matchCount: 1, dates: '19 jul',   color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   border: 'rgba(255,215,0,0.35)' },
  { key: 'TPO', label: '3er Puesto',    short: '3° Pto', matchCount: 1, dates: '18 jul',   color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.25)' },
] as const;

type RoundKey = typeof ROUNDS[number]['key'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const ART = -3 * 60 * 60 * 1000;
const DAYS_SHORT   = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + ART);
  const h  = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} · ${h}:${mi} ART`;
}

function teamLabel(code: string): string {
  if (!code || code === 'TBD') return 'Por definir';
  if (/^W\d+$/.test(code))    return `Gan. P${code.slice(1)}`;
  if (/^RU\d+$/.test(code))   return `Sub. P${code.slice(2)}`;
  if (/^\d[A-L]$/.test(code)) return `${code[0]}° Grp ${code[1]}`;
  if (/^\d[A-L]{2,}$/.test(code)) {
    const pos    = code[0];
    const groups = code.slice(1).split('');
    return `${pos}° 3ro (${groups.join('/')})`;
  }
  const team = getTeamByCode(code);
  return team ? team.nameEs : code;
}

// ── Tournament flow bar ───────────────────────────────────────────────────────
// Shows R32 → R16 → QF → SF  in a horizontal flow, then Final + TPO side-by-side below

function TournamentFlow({ activeKey, onSelect }: { activeKey: RoundKey; onSelect: (k: RoundKey) => void }) {
  const mainRounds = ROUNDS.filter((r) => r.key !== 'FIN' && r.key !== 'TPO');
  const fin = ROUNDS.find((r) => r.key === 'FIN')!;
  const tpo = ROUNDS.find((r) => r.key === 'TPO')!;

  return (
    <div className="flex flex-col gap-2">
      {/* Main path: 16vos → Octavos → Cuartos → Semi */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {mainRounds.map((r, i) => {
          const active = activeKey === r.key;
          return (
            <div key={r.key} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onSelect(r.key)}
                className="flex flex-col items-center px-3 py-2 rounded-xl transition-all active:scale-95"
                style={{
                  background: active ? r.bg : 'var(--border-subtle)',
                  border: `1px solid ${active ? r.border : 'rgba(255,255,255,0.07)'}`,
                  minWidth: 68,
                }}
              >
                <span className="text-[11px] font-black leading-none" style={{ color: active ? r.color : 'var(--text-mute)' }}>
                  {r.short}
                </span>
                <span className="text-[9px] mt-0.5 opacity-60" style={{ color: active ? r.color : 'var(--text-mute)' }}>
                  {r.matchCount}P · {r.dates}
                </span>
              </button>
              {i < mainRounds.length - 1 && (
                <ChevronRight size={12} style={{ color: 'var(--border-color)', flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Final + 3er Puesto side-by-side */}
      <div className="flex gap-2">
        {/* FINAL — host countries gradient */}
        <button
          onClick={() => onSelect('FIN')}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
          style={{
            background: activeKey === 'FIN'
              ? 'linear-gradient(135deg, rgba(0,104,71,0.25), rgba(0,45,130,0.25), rgba(255,0,0,0.2))'
              : 'var(--border-subtle)',
            border: activeKey === 'FIN'
              ? '1px solid rgba(255,215,0,0.5)'
              : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Trophy
            size={14}
            style={{ color: activeKey === 'FIN' ? '#FFD700' : 'var(--text-mute)', flexShrink: 0 }}
          />
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-black leading-none" style={{ color: activeKey === 'FIN' ? '#FFD700' : 'var(--text-mute)' }}>
              Final
            </span>
            <span className="text-[9px] opacity-60" style={{ color: activeKey === 'FIN' ? '#FFD700' : 'var(--text-mute)' }}>
              19 jul · 1P
            </span>
          </div>
          {/* Mini host flag strip */}
          <div className="ml-auto flex gap-0.5">
            {[['#006847', '#CE1126'], ['#FF0000', '#FFFFFF'], ['#002868', '#BF0A30']].map(([a, b], i) => (
              <div key={i} className="w-1.5 h-4 rounded-sm overflow-hidden flex flex-col">
                <div style={{ flex: 1, background: a }} />
                <div style={{ flex: 1, background: b }} />
              </div>
            ))}
          </div>
        </button>

        {/* 3er Puesto */}
        <button
          onClick={() => onSelect('TPO')}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
          style={{
            background: activeKey === 'TPO' ? tpo.bg : 'var(--border-subtle)',
            border: `1px solid ${activeKey === 'TPO' ? tpo.border : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          <span className="text-sm leading-none" style={{ flexShrink: 0 }}>🥉</span>
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-black leading-none" style={{ color: activeKey === 'TPO' ? tpo.color : 'var(--text-mute)' }}>
              3er Puesto
            </span>
            <span className="text-[9px] opacity-60" style={{ color: activeKey === 'TPO' ? tpo.color : 'var(--text-mute)' }}>
              18 jul · 1P
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────

function TeamSide({ code, align }: { code: string; align: 'left' | 'right' }) {
  const team = getTeamByCode(code);
  const isPlaceholder = !code || code === 'TBD' || /^[W1-3]/.test(code);

  if (team) {
    return (
      <div className={`flex items-center gap-2 flex-1 min-w-0 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="relative overflow-hidden rounded-sm flex-shrink-0" style={{ width: 26, height: 17 }}>
          <Image src={team.flagUrl} alt={team.nameEs} fill className="object-cover" unoptimized />
        </div>
        <span
          className={`text-sm font-bold truncate ${align === 'right' ? 'text-right' : ''}`}
          style={{ color: 'var(--text)' }}
        >
          {team.nameEs}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`text-sm font-bold flex-1 truncate ${align === 'right' ? 'text-right' : ''}`}
      style={{ color: isPlaceholder ? 'var(--text-mute)' : 'var(--text)' }}
    >
      {teamLabel(code)}
    </span>
  );
}

function MatchRow({ id, home, away, date, venue, roundColor, resolution }: {
  id: number;
  home: string;
  away: string;
  date: string;
  venue: string;
  roundColor: string;
  resolution: BracketResolution;
}) {
  const { confirmed, predicted } = resolution;
  const resolvedHome = confirmed.get(home) ?? predicted.get(home) ?? home;
  const resolvedAway = confirmed.get(away) ?? predicted.get(away) ?? away;

  return (
    <Link
      href={`/partido/${id}`}
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all active:scale-[0.98]"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <TeamSide code={resolvedHome} align="left" />
        <span
          className="text-[11px] font-black px-2.5 py-1 rounded-lg tabular-nums shrink-0"
          style={{
            background: `color-mix(in srgb, ${roundColor} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${roundColor} 30%, transparent)`,
            color: roundColor,
          }}
        >
          VS
        </span>
        <TeamSide code={resolvedAway} align="right" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: 'var(--text-mute)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-mute)' }}>{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-1 min-w-0">
          <MapPin size={11} style={{ color: 'var(--text-mute)', flexShrink: 0 }} />
          <span className="text-[11px] truncate" style={{ color: 'var(--text-mute)', maxWidth: 130 }}>
            {venue.replace('Estadio ', '')}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BracketView() {
  const [activeRound, setActiveRound] = useState<RoundKey>('R32');
  const resolution = useBracketResolution(); // BracketResolution { confirmed, predicted }

  const round        = ROUNDS.find((r) => r.key === activeRound)!;
  const roundMatches = staticMatches.filter((m) => m.group === activeRound);
  const isFinal      = activeRound === 'FIN';
  const isTercero    = activeRound === 'TPO';

  return (
    <div className="flex flex-col gap-5">

      <TournamentFlow activeKey={activeRound} onSelect={setActiveRound} />

      {/* Round header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ background: round.bg, border: `1px solid ${round.border}` }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: round.color, opacity: 0.7 }}>
            {round.dates}
          </p>
          <h2 className="text-xl font-black" style={{ color: round.color }}>
            {round.label}
          </h2>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
          style={{ background: `color-mix(in srgb, ${round.color} 15%, transparent)` }}
        >
          <span className="text-2xl font-black leading-none" style={{ color: round.color }}>
            {roundMatches.length || round.matchCount}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: round.color, opacity: 0.7 }}>
            partidos
          </span>
        </div>
      </div>

      {/* Match list */}
      <div className="flex flex-col gap-2.5">
        {roundMatches.length > 0 ? (
          roundMatches.map((m) => (
            <MatchRow
              key={m.id}
              id={m.id}
              home={m.homeTeamCode}
              away={m.awayTeamCode}
              date={m.date}
              venue={m.venue}
              roundColor={round.color}
              resolution={resolution}
            />
          ))
        ) : (
          <div
            className="rounded-2xl px-4 py-10 flex flex-col items-center gap-2"
            style={{ background: round.bg, border: `1px solid ${round.border}` }}
          >
            <span className="text-3xl">🔒</span>
            <p className="text-sm font-semibold" style={{ color: round.color }}>Cruces por definir</p>
            <p className="text-xs text-center" style={{ color: 'var(--text-mute)' }}>
              Se definen al finalizar la fase de grupos el 2 de julio
            </p>
          </div>
        )}
      </div>

      {/* Venue note for final/3rd */}
      {(isFinal || isTercero) && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-2"
          style={{
            background: isFinal ? 'rgba(255,215,0,0.05)' : 'rgba(19,24,41,0.5)',
            border: isFinal ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <MapPin size={12} style={{ color: isFinal ? '#FFD700' : 'var(--text-mute)', flexShrink: 0 }} />
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

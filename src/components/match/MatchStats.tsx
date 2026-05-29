'use client';

import type { MatchStats } from '@/lib/live';

interface StatBarProps {
  label: string;
  home: number;
  away: number;
  isPercent?: boolean;
}

function StatBar({ label, home, away, isPercent }: StatBarProps) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text)' }}>
          {isPercent ? `${home}%` : home}
        </span>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-mute)' }}>
          {label}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text)' }}>
          {isPercent ? `${away}%` : away}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px" style={{ background: 'var(--border-color)' }}>
        <div
          className="rounded-full transition-all duration-700"
          style={{ width: `${homePct}%`, background: 'var(--accent)' }}
        />
        <div
          className="rounded-full flex-1 transition-all duration-700"
          style={{ background: 'rgba(255,59,92,0.6)' }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[9px]" style={{ color: 'var(--text-mute)' }}>{homePct}%</span>
        <span className="text-[9px]" style={{ color: 'var(--text-mute)' }}>{awayPct}%</span>
      </div>
    </div>
  );
}

interface MatchStatsProps {
  stats: MatchStats;
  homeTeamName: string;
  awayTeamName: string;
}

export function MatchStatsPanel({ stats, homeTeamName, awayTeamName }: MatchStatsProps) {
  const rows: Array<{ label: string; key: keyof MatchStats; isPercent?: boolean }> = [
    { label: 'Posesión', key: 'possession', isPercent: true },
    { label: 'Tiros', key: 'shots' },
    { label: 'Al arco', key: 'shotsOnTarget' },
    { label: 'Córners', key: 'corners' },
    { label: 'Faltas', key: 'fouls' },
    { label: 'Fuera de juego', key: 'offsides' },
    { label: 'Amarillas', key: 'yellowCards' },
    { label: 'Rojas', key: 'redCards' },
  ];

  const visibleRows = rows.filter((r) => stats[r.key] !== null);
  if (visibleRows.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-dim)' }}>
          {homeTeamName}
        </span>
        <span className="text-[10px] uppercase tracking-widest flex-shrink-0 mx-2" style={{ color: 'var(--text-mute)' }}>
          Estadísticas
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest truncate text-right" style={{ color: 'var(--text-dim)' }}>
          {awayTeamName}
        </span>
      </div>

      {visibleRows.map(({ label, key, isPercent }) => {
        const val = stats[key]!;
        return (
          <StatBar
            key={key}
            label={label}
            home={val.home}
            away={val.away}
            isPercent={isPercent}
          />
        );
      })}
    </div>
  );
}

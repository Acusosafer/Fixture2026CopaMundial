'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getTeamByCode } from '@/lib/teams';
import type { Group } from '@/lib/groups';
import type { StaticMatch } from '@/lib/fixtures-static';
import { ScenarioSimulator } from '@/components/group/ScenarioSimulator';
import type { SimulatedResults, ResultOverride } from '@/components/group/ScenarioSimulator';
import { useLiveScores } from '@/hooks/useLiveScores';
import type { LiveScore } from '@/lib/live';

const ART = -3 * 60 * 60 * 1000;
const DAYS_SHORT   = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatMatchTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + ART);
  const h  = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} · ${h}:${mi}`;
}

interface TeamStats {
  code: string;
  nameEs: string;
  flagUrl: string | null;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

// resultOverride → score pair [homeGoals, awayGoals]
const OVERRIDE_SCORE: Record<ResultOverride, [number, number]> = {
  home: [1, 0],
  draw: [0, 0],
  away: [0, 1],
};

function buildTable(
  group: Group,
  matches: StaticMatch[],
  simulated: SimulatedResults,
  liveScores: Map<number, LiveScore>,
): TeamStats[] {
  const statsMap = new Map<string, TeamStats>();

  for (const code of group.teams) {
    const team = getTeamByCode(code);
    statsMap.set(code, {
      code,
      nameEs: team?.nameEs ?? code,
      flagUrl: team?.flagUrl ?? null,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0,
    });
  }

  for (const match of matches) {
    let homeGoals: number | null = null;
    let awayGoals: number | null = null;

    const live = liveScores.get(match.id);

    // Prioridad: resultado en vivo/terminado > datos estáticos > simulación
    if (live?.status === 'FINISHED') {
      homeGoals = live.homeScore;
      awayGoals = live.awayScore;
    } else if (match.status === 'finished' && match.homeScore !== null && match.awayScore !== null) {
      homeGoals = match.homeScore;
      awayGoals = match.awayScore;
    } else if (simulated[match.id]) {
      [homeGoals, awayGoals] = OVERRIDE_SCORE[simulated[match.id]];
    }

    if (homeGoals === null || awayGoals === null) continue;

    const home = statsMap.get(match.homeTeamCode);
    const away = statsMap.get(match.awayTeamCode);
    if (!home || !away) continue;

    home.pj += 1; away.pj += 1;
    home.gf += homeGoals; home.gc += awayGoals;
    away.gf += awayGoals; away.gc += homeGoals;

    if (homeGoals > awayGoals) {
      home.pg += 1; home.pts += 3; away.pp += 1;
    } else if (homeGoals < awayGoals) {
      away.pg += 1; away.pts += 3; home.pp += 1;
    } else {
      home.pe += 1; home.pts += 1; away.pe += 1; away.pts += 1;
    }
  }

  const table = Array.from(statsMap.values()).map((s) => ({ ...s, dg: s.gf - s.gc }));
  table.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg)  return b.dg - a.dg;
    if (b.gf !== a.gf)  return b.gf - a.gf;
    return a.code.localeCompare(b.code);
  });
  return table;
}

// ─── Sub-componentes ──────────────────────────────────────────

function FlagCell({ flagUrl, nameEs }: { flagUrl: string | null; nameEs: string }) {
  if (!flagUrl) return <span className="text-lg leading-none">{nameEs.slice(0, 2)}</span>;
  return (
    <div className="relative w-6 h-4 flex-shrink-0 rounded-sm overflow-hidden">
      <Image src={flagUrl} alt={nameEs} fill className="object-contain" unoptimized sizes="24px" />
    </div>
  );
}

const CELL = 'text-center tabular-nums text-xs px-1 py-2.5';
const CELL_MUTE = `${CELL} text-[#4A5273]`;
const CELL_DIM  = `${CELL} text-[#8892B0]`;

// ─── GroupTable ───────────────────────────────────────────────

interface GroupTableProps {
  group: Group;
  matches: StaticMatch[];
  /** Códigos de equipos que son mejor-3ro clasificado (calculado globalmente) */
  bestThirds?: Set<string>;
}

export function GroupTable({ group, matches, bestThirds }: GroupTableProps) {
  const [simulated, setSimulated]   = useState<SimulatedResults>({});
  const [simOpen, setSimOpen]       = useState(false);
  const { scores: liveScores }      = useLiveScores();

  const groupMatches = useMemo(
    () => matches.filter((m) => m.group === group.name),
    [matches, group.name],
  );

  // Partidos pendientes: ni terminados estáticamente ni con resultado en vivo finalizado
  const pendingMatches = useMemo(
    () => groupMatches.filter((m) => {
      if (m.status === 'finished') return false;
      const live = liveScores.get(m.id);
      return live?.status !== 'FINISHED';
    }),
    [groupMatches, liveScores],
  );

  // Real table (sin simulación) — usado para detectar cambios
  const realTable = useMemo(
    () => buildTable(group, groupMatches, {}, liveScores),
    [group, groupMatches, liveScores],
  );

  // Tabla con simulación aplicada
  const table = useMemo(
    () => buildTable(group, groupMatches, simulated, liveScores),
    [group, groupMatches, simulated, liveScores],
  );

  // Mapa de stats reales por código de equipo (para highlight de cambios)
  const realByCode = useMemo(() => {
    const m = new Map<string, TeamStats>();
    realTable.forEach((t) => m.set(t.code, t));
    return m;
  }, [realTable]);

  const isSimulating = Object.keys(simulated).length > 0;

  function handleChange(matchId: number, result: ResultOverride) {
    setSimulated((prev) => ({ ...prev, [matchId]: result }));
  }

  function handleReset() {
    setSimulated({});
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden w-full"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px)',
          border: isSimulating
            ? '1px solid var(--plasma, rgba(99,102,241,0.5))'
            : '1px solid rgba(255,255,255,0.08)',
          transition: 'border-color 0.3s',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-black text-base tracking-widest" style={{ color: 'var(--accent)' }}>
              GRUPO {group.name}
            </span>
            {isSimulating && (
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'var(--plasma-dim, rgba(99,102,241,0.15))',
                  color: 'var(--plasma, #6366f1)',
                  border: '1px solid var(--plasma, #6366f1)',
                }}
              >
                Simulando
              </span>
            )}
          </div>

          {pendingMatches.length > 0 && (
            <button
              onClick={() => setSimOpen(true)}
              className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all active:scale-95"
              style={{
                background: isSimulating
                  ? 'var(--plasma-dim, rgba(99,102,241,0.15))'
                  : 'var(--border-subtle)',
                border: `1px solid ${isSimulating ? 'var(--plasma, #6366f1)' : 'rgba(255,255,255,0.08)'}`,
                color: isSimulating ? 'var(--plasma, #6366f1)' : 'var(--text-mute)',
              }}
            >
              ¿Qué pasa si...?
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[340px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th className="text-left pl-4 pr-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#4A5273] w-6">#</th>
                <th className="text-left px-1 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#4A5273]">Equipo</th>
                {['PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'PTS'].map((col) => (
                  <th key={col} className="text-center px-1 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#4A5273] w-8">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((team, idx) => {
                const pos = idx + 1;
                const isTop2      = pos <= 2;
                const isThird     = pos === 3;
                const isBest3rd   = isThird && bestThirds && bestThirds.size > 0 && bestThirds.has(team.code);
                const real        = realByCode.get(team.code);

                const changed = real
                  ? real.pts !== team.pts || real.pj !== team.pj || real.dg !== team.dg
                  : false;

                const plasma = 'var(--plasma, #6366f1)';

                let rowBorder = '';
                if (isTop2)    rowBorder = '2px solid rgba(16, 240, 160, 0.25)';
                if (isBest3rd) rowBorder = '2px solid rgba(251, 146, 60, 0.4)';
                else if (isThird && !isBest3rd && bestThirds && bestThirds.size > 0)
                  rowBorder = '2px solid rgba(255,255,255,0.06)';

                function cellColor(val: number, realVal: number, defaultColor: string) {
                  return isSimulating && changed && val !== realVal ? plasma : defaultColor;
                }

                return (
                  <tr
                    key={team.code}
                    style={{
                      borderLeft: rowBorder,
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s',
                    }}
                    className="hover:bg-white/[0.03]"
                  >
                    <td className="pl-4 pr-2 py-2.5 text-xs tabular-nums text-[#4A5273] font-medium w-6">{pos}</td>

                    <td className="px-1 py-2">
                      <div className="flex items-center gap-2">
                        <FlagCell flagUrl={team.flagUrl} nameEs={team.nameEs} />
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                          {team.nameEs}
                        </span>
                      </div>
                    </td>

                    <td className={CELL_DIM} style={{ color: cellColor(team.pj, real?.pj ?? team.pj, '#8892B0') }}>{team.pj}</td>
                    <td className={CELL_DIM} style={{ color: cellColor(team.pg, real?.pg ?? team.pg, '#8892B0') }}>{team.pg}</td>
                    <td className={CELL_MUTE} style={{ color: cellColor(team.pe, real?.pe ?? team.pe, '#4A5273') }}>{team.pe}</td>
                    <td className={CELL_MUTE} style={{ color: cellColor(team.pp, real?.pp ?? team.pp, '#4A5273') }}>{team.pp}</td>
                    <td className={CELL_DIM} style={{ color: cellColor(team.gf, real?.gf ?? team.gf, '#8892B0') }}>{team.gf}</td>
                    <td className={CELL_DIM} style={{ color: cellColor(team.gc, real?.gc ?? team.gc, '#8892B0') }}>{team.gc}</td>
                    <td
                      className={CELL}
                      style={{
                        color: isSimulating && changed && team.dg !== (real?.dg ?? team.dg)
                          ? plasma
                          : team.dg > 0 ? '#10F0A0' : team.dg < 0 ? 'var(--live)' : 'var(--text-dim)',
                      }}
                    >
                      {team.dg > 0 ? `+${team.dg}` : team.dg}
                    </td>
                    <td
                      className={`${CELL} font-bold`}
                      style={{
                        color: isSimulating && changed && team.pts !== (real?.pts ?? team.pts)
                          ? plasma
                          : 'var(--text)',
                      }}
                    >
                      {team.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda */}
        <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(16, 240, 160, 0.35)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>Clasifica directo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(251, 146, 60, 0.4)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>Mejor 3ro</span>
          </div>
          {isSimulating && (
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--plasma-dim, rgba(99,102,241,0.2))', border: '1px solid var(--plasma, #6366f1)' }} />
              <span className="text-[10px]" style={{ color: 'var(--plasma, #6366f1)' }}>Hipotético</span>
            </div>
          )}
        </div>

        {/* Partidos */}
        {groupMatches.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-mute)' }}>
              Partidos
            </p>
            {groupMatches.map((m) => {
              const home = getTeamByCode(m.homeTeamCode);
              const away = getTeamByCode(m.awayTeamCode);
              const live       = liveScores.get(m.id);
              const isFinished = m.status === 'finished' || live?.status === 'FINISHED';
              const isLive     = live?.status === 'IN_PLAY' || live?.status === 'PAUSED';
              const isHalfTime = live?.status === 'PAUSED';
              const simResult  = simulated[m.id];

              const displayHome = live ? live.homeScore : m.homeScore;
              const displayAway = live ? live.awayScore : m.awayScore;

              return (
                <Link
                  key={m.id}
                  href={`/partido/${m.id}`}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {home && (
                      <div className="relative w-5 h-3.5 shrink-0">
                        <Image src={home.flagUrl} alt={home.nameEs} fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <span className="text-xs truncate" style={{ color: 'var(--text)' }}>
                      {home?.nameEs ?? m.homeTeamCode}
                    </span>
                  </div>

                  <div className="flex flex-col items-center shrink-0 px-2 gap-0.5">
                    {isLive ? (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: 'var(--live)' }} />
                          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--live)' }}>
                            {displayHome ?? 0} – {displayAway ?? 0}
                          </span>
                        </div>
                        <span className="text-[9px]" style={{ color: 'var(--live)' }}>
                          {isHalfTime ? 'ET' : `${live?.minute ?? 0}'`}
                        </span>
                      </>
                    ) : isFinished && displayHome !== null ? (
                      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                        {displayHome} – {displayAway}
                      </span>
                    ) : simResult ? (
                      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--plasma, #6366f1)' }}>
                        {simResult === 'home' ? '1 – 0' : simResult === 'draw' ? '0 – 0' : '0 – 1'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-center" style={{ color: 'var(--text-mute)' }}>
                        {formatMatchTime(m.date)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                    <span className="text-xs truncate text-right" style={{ color: 'var(--text)' }}>
                      {away?.nameEs ?? m.awayTeamCode}
                    </span>
                    {away && (
                      <div className="relative w-5 h-3.5 shrink-0">
                        <Image src={away.flagUrl} alt={away.nameEs} fill className="object-contain" unoptimized />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <ScenarioSimulator
        isOpen={simOpen}
        pendingMatches={pendingMatches}
        simulated={simulated}
        onChange={handleChange}
        onReset={handleReset}
        onClose={() => setSimOpen(false)}
      />
    </>
  );
}

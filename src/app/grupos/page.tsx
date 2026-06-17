'use client';

import { useState, useMemo } from 'react';
import { groups } from '@/lib/groups';
import { useFixtures } from '@/hooks/useFixtures';
import { GroupTable } from '@/components/group/GroupTable';
import type { StaticMatch } from '@/lib/fixtures-static';
import type { Group } from '@/lib/groups';

// ── Compute 3rd-place stats for a single group ────────────────────────────────

interface ThirdStats { code: string; pts: number; dg: number; gf: number; }

function get3rdPlace(group: Group, matches: StaticMatch[]): ThirdStats | null {
  const statsMap = new Map<string, ThirdStats>();
  for (const code of group.teams) {
    statsMap.set(code, { code, pts: 0, dg: 0, gf: 0 });
  }

  for (const m of matches) {
    if (m.status !== 'finished' || m.homeScore === null || m.awayScore === null) continue;
    const home = statsMap.get(m.homeTeamCode);
    const away = statsMap.get(m.awayTeamCode);
    if (!home || !away) continue;

    const h = m.homeScore, a = m.awayScore;
    home.gf += h; home.dg += h - a;
    away.gf += a; away.dg += a - h;
    if (h > a) { home.pts += 3; }
    else if (h < a) { away.pts += 3; }
    else { home.pts += 1; away.pts += 1; }
  }

  const sorted = Array.from(statsMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg  !== a.dg)  return b.dg  - a.dg;
    return b.gf - a.gf;
  });

  return sorted.length >= 3 ? sorted[2] : null;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GruposPage() {
  const { matches, isLoading } = useFixtures();
  const [selectedGroup, setSelectedGroup] = useState<string>('A');

  const bestThirds = useMemo<Set<string>>(() => {
    const thirds: ThirdStats[] = [];
    for (const g of groups) {
      const gMatches = matches.filter((m) => m.group === g.name);
      const third = get3rdPlace(g, gMatches);
      if (third) thirds.push(third);
    }
    thirds.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg  !== a.dg)  return b.dg  - a.dg;
      return b.gf - a.gf;
    });
    return new Set(thirds.slice(0, 8).map((t) => t.code));
  }, [matches]);

  const visibleGroups = groups.filter((g) => g.name === selectedGroup);

  return (
    <main className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div
        className="sticky top-14 z-20 px-4 pt-4 pb-3 glass-nav"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <h1 className="font-heading text-4xl tracking-wide mb-3" style={{ color: 'var(--text)' }}>
          GRUPOS
        </h1>
        <div className="relative">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm font-bold transition-all"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border-color)',
              outline: 'none',
            }}
          >
            {groups.map((g) => (
              <option key={g.name} value={g.name} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>
                Grupo {g.name}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: 'var(--accent)' }}
          >
            ▼
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <GroupTableSkeleton />
        ) : (
          visibleGroups.map((group) => (
            <GroupTable key={group.name} group={group} matches={matches} bestThirds={bestThirds} />
          ))
        )}
      </div>
    </main>
  );
}

function GroupTableSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="rounded" style={{ width: 80, height: 18, background: 'var(--border-color)' }} />
      </div>
      <div className="px-4 py-2 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="rounded" style={{ width: 16, height: 14, background: 'var(--border-subtle)' }} />
            <div className="rounded-sm" style={{ width: 24, height: 16, background: 'var(--border-color)' }} />
            <div className="rounded flex-1" style={{ height: 14, background: 'var(--border-subtle)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

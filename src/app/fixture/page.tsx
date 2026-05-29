'use client';

import { useState, useMemo } from 'react';
import { useFixtures } from '@/hooks/useFixtures';
import { useLiveScores } from '@/hooks/useLiveScores';
import { usePreferences } from '@/store/preferences';
import { MatchCard } from '@/components/match/MatchCard';
import type { StaticMatch } from '@/lib/fixtures-static';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateHeader(isoDate: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(isoDate));
}

function getLocalDay(isoDate: string): string {
  // Returns YYYY-MM-DD in Argentina timezone for grouping
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoDate));
}

// ──────────────────────────────────────────────────────────
// Filter chips
// ──────────────────────────────────────────────────────────

type FilterValue = 'all' | 'today' | 'myteam' | (typeof GROUPS)[number];

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={
        active
          ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
          : { background: 'var(--border-subtle)', color: 'var(--text-dim)', border: '1px solid var(--border-color)' }
      }
    >
      {label}
    </button>
  );
}

// ──────────────────────────────────────────────────────────
// Skeleton card
// ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="rounded-sm" style={{ width: 48, height: 32, background: 'var(--border-color)' }} />
          <div className="rounded" style={{ width: 56, height: 10, background: 'var(--border-color)' }} />
        </div>
        <div className="rounded" style={{ width: 40, height: 24, background: 'var(--border-color)' }} />
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="rounded-sm" style={{ width: 48, height: 32, background: 'var(--border-color)' }} />
          <div className="rounded" style={{ width: 56, height: 10, background: 'var(--border-color)' }} />
        </div>
      </div>
      <div className="mt-3 pt-3 rounded" style={{ borderTop: '1px solid var(--border-subtle)', height: 12, background: 'var(--border-subtle)' }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────

export default function FixturePage() {
  const { matches, isLoading } = useFixtures();
  const { scores: liveScores, liveCount } = useLiveScores();
  const myTeamCode = usePreferences((s) => s.myTeamCode);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  // Today in ARG timezone
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }, []);

  const filtered = useMemo<StaticMatch[]>(() => {
    switch (activeFilter) {
      case 'today':
        return matches.filter((m) => getLocalDay(m.date) === todayStr);
      case 'myteam':
        return matches.filter(
          (m) =>
            m.homeTeamCode.toLowerCase() === myTeamCode.toLowerCase() ||
            m.awayTeamCode.toLowerCase() === myTeamCode.toLowerCase()
        );
      case 'all':
        return matches;
      default:
        // Group filter (A-L)
        return matches.filter((m) => m.group === activeFilter);
    }
  }, [matches, activeFilter, myTeamCode, todayStr]);

  // Group by local date
  const grouped = useMemo(() => {
    const map = new Map<string, StaticMatch[]>();
    for (const m of filtered) {
      const day = getLocalDay(m.date);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(m);
    }
    // Sort days
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const filters: Array<{ value: FilterValue; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'today', label: 'Hoy' },
    { value: 'myteam', label: 'Mi Selección' },
    ...GROUPS.map((g) => ({ value: g as FilterValue, label: `Grupo ${g}` })),
  ];

  return (
    <main className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-14 z-20 px-4 pt-4 pb-3 glass-nav"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-baseline gap-2 mb-3">
          <h1 className="font-heading text-4xl tracking-wide" style={{ color: 'var(--text)' }}>
            FIXTURE
          </h1>
          {!isLoading && (
            <span className="text-sm" style={{ color: 'var(--text-mute)' }}>
              {matches.length} partidos
            </span>
          )}
          {liveCount > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'var(--live-dim)', color: 'var(--live)', border: '1px solid var(--live-border)' }}
            >
              ● {liveCount} en vivo
            </span>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              active={activeFilter === f.value}
              onClick={() => setActiveFilter(f.value)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <span className="text-4xl">🔍</span>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              No hay partidos con este filtro
            </p>
          </div>
        ) : (
          grouped.map(([day, dayMatches]) => {
            const headerText = formatDateHeader(dayMatches[0].date);
            const capitalizedHeader =
              headerText.charAt(0).toUpperCase() + headerText.slice(1);

            return (
              <section key={day}>
                {/* Date header */}
                <h2
                  className="font-heading text-lg tracking-widest mb-3"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {capitalizedHeader.toUpperCase()}
                </h2>
                <div className="space-y-3">
                  {dayMatches.map((match, idx) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      liveScore={liveScores.get(match.id)}
                      index={idx}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

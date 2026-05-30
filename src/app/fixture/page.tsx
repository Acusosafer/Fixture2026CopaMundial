'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch } from 'lucide-react';
import { useFixtures } from '@/hooks/useFixtures';
import { useLiveScores } from '@/hooks/useLiveScores';
import { usePreferences } from '@/store/preferences';
import { MatchCard } from '@/components/match/MatchCard';
import type { StaticMatch } from '@/lib/fixtures-static';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

// Returns YYYY-MM-DD in Argentina timezone (UTC-3, no DST)
function getLocalDay(isoDate: string): string {
  const d = new Date(new Date(isoDate).getTime() - 3 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function formatDateHeader(isoDate: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(isoDate));
}

// ──────────────────────────────────────────────────────────
// Filter chips
// ──────────────────────────────────────────────────────────

type FilterValue = 'all' | 'today' | (typeof GROUPS)[number];

function FilterChip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
      style={
        active
          ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
          : { background: 'var(--border-subtle)', color: 'var(--text-dim)', border: '1px solid var(--border-color)' }
      }
    >
      {icon}
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
  usePreferences((s) => s.myTeamCode);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  // Today in ARG timezone (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, []);

  // Only group stage matches (A-L), sorted chronologically
  const groupMatches = useMemo(
    () => matches.filter((m) => GROUPS.includes(m.group as (typeof GROUPS)[number])),
    [matches]
  );

  const filtered = useMemo<StaticMatch[]>(() => {
    switch (activeFilter) {
      case 'today':
        return groupMatches.filter((m) => getLocalDay(m.date) === todayStr);
      case 'all':
        return groupMatches;
      default:
        return groupMatches.filter((m) => m.group === activeFilter);
    }
  }, [groupMatches, activeFilter, todayStr]);

  // Group by local date, sorted ascending
  const grouped = useMemo(() => {
    const map = new Map<string, StaticMatch[]>();
    for (const m of filtered) {
      const day = getLocalDay(m.date);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <main className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div
        className="sticky top-14 z-20 px-4 pt-4 pb-3 glass-nav"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="font-heading text-4xl tracking-wide" style={{ color: 'var(--text)' }}>
              FIXTURE
            </h1>
            {!isLoading && (
              <span className="text-sm" style={{ color: 'var(--text-mute)' }}>
                {groupMatches.length} partidos
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
          {/* Cruces shortcut */}
          <button
            onClick={() => router.push('/bracket')}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
            }}
          >
            <GitBranch size={11} />
            Cruces
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <FilterChip
            label="Hoy"
            active={activeFilter === 'today'}
            onClick={() => setActiveFilter('today')}
          />

          {/* Group divider label */}
          <span className="flex-shrink-0 self-center text-[10px] px-1" style={{ color: 'var(--text-mute)' }}>
            Grupo:
          </span>

          {GROUPS.map((g) => (
            <FilterChip
              key={g}
              label={g}
              active={activeFilter === g}
              onClick={() => setActiveFilter(activeFilter === g ? 'all' : g)}
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
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            {activeFilter === 'today' ? (
              <>
                <span className="text-4xl">📅</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
                  No hay partidos hoy
                </p>
                <p className="text-xs text-center" style={{ color: 'var(--text-mute)' }}>
                  El torneo comienza el 11 de junio de 2026
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="text-xs font-semibold px-4 py-2 rounded-xl mt-1"
                  style={{ background: 'var(--border-color)', color: 'var(--text)' }}
                >
                  Ver todos los partidos
                </button>
              </>
            ) : (
              <>
                <span className="text-4xl">🔍</span>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                  No hay partidos con este filtro
                </p>
              </>
            )}
          </div>
        ) : (
          grouped.map(([day, dayMatches]) => {
            const headerText = formatDateHeader(dayMatches[0].date);
            const capitalizedHeader = headerText.charAt(0).toUpperCase() + headerText.slice(1);

            return (
              <section key={day}>
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

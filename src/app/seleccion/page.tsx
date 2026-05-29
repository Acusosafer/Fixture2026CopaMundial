'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Search, ArrowLeft } from 'lucide-react';
import { teams } from '@/lib/teams';
import { useMySelection } from '@/hooks/useMySelection';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

const cardStyle: React.CSSProperties = {
  background: 'rgba(10,14,26,0.92)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

export default function SeleccionPage() {
  const router = useRouter();
  const { team: currentTeam, setTeamCode } = useMySelection();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase().trim();
  const filtered = q
    ? teams.filter(
        (t) =>
          t.nameEs.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q)
      )
    : teams;

  const grouped = GROUPS.map((g) => ({
    group: g,
    teams: filtered.filter((t) => t.group === g),
  })).filter((g) => g.teams.length > 0);

  function selectTeam(code: string) {
    setTeamCode(code);
    router.back();
  }

  return (
    <div className="flex flex-col min-h-screen pb-8" style={{ background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div className="sticky top-14 z-10 px-4 pt-4 pb-3" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full transition-colors hover:bg-white/5"
            aria-label="Volver"
          >
            <ArrowLeft size={20} style={{ color: 'var(--text-dim)' }} />
          </button>
          <div>
            <h1 className="text-xl font-black leading-none" style={{ color: 'var(--text)' }}>
              Mi Selección
            </h1>
            {currentTeam && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>
                Seleccionada: {currentTeam.nameEs}
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-mute)' }}
          />
          <input
            type="text"
            placeholder="Buscar selección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#4A5273]"
            style={{
              background: 'var(--border-color)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text)',
            }}
          />
        </div>
      </div>

      {/* Teams grouped by group */}
      <div className="px-4 pt-4 flex flex-col gap-6">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-4xl">🔍</span>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              No se encontró ninguna selección
            </p>
          </div>
        ) : (
          grouped.map(({ group, teams: groupTeams }) => (
            <section key={group}>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-dim)' }}
              >
                Grupo {group}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {groupTeams.map((team) => {
                  const isSelected = team.code === currentTeam?.code;
                  return (
                    <button
                      key={team.code}
                      onClick={() => selectTeam(team.code)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all active:scale-95 text-left"
                      style={{
                        background: isSelected
                          ? 'var(--accent-dim)'
                          : 'var(--bg-card)',
                        border: isSelected
                          ? '1px solid var(--accent-border)'
                          : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="relative w-10 h-7 rounded-sm overflow-hidden shrink-0 ring-1 ring-white/10">
                        <Image
                          src={team.flagUrl}
                          alt={team.nameEs}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span
                        className="text-xs font-semibold leading-tight flex-1 min-w-0"
                        style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}
                      >
                        {team.nameEs}
                      </span>
                      {isSelected && (
                        <Check size={14} style={{ color: 'var(--accent)' }} className="shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

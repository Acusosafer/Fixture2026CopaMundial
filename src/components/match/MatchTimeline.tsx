'use client';

import { useState } from 'react';
import type { MatchEvent, LineupPlayer, TeamLineup } from '@/lib/live';
import { PlayerSheet } from '@/components/match/PlayerSheet';

function EventIcon({ type }: { type: MatchEvent['type'] }) {
  switch (type) {
    case 'GOAL':
    case 'OWN_GOAL':
    case 'PENALTY':
      return <span className="text-base leading-none">⚽</span>;
    case 'YELLOW_CARD':
      return <span className="inline-block rounded-sm" style={{ width: 10, height: 14, background: '#FFD700', flexShrink: 0 }} />;
    case 'RED_CARD':
      return <span className="inline-block rounded-sm" style={{ width: 10, height: 14, background: 'var(--live)', flexShrink: 0 }} />;
    case 'YELLOW_RED_CARD':
      return (
        <span className="flex gap-0.5">
          <span className="inline-block rounded-sm" style={{ width: 8, height: 12, background: '#FFD700' }} />
          <span className="inline-block rounded-sm" style={{ width: 8, height: 12, background: 'var(--live)' }} />
        </span>
      );
    case 'SUBSTITUTION':
      return <span className="text-sm leading-none">🔄</span>;
  }
}

function eventLabel(e: MatchEvent): string {
  if (e.type === 'OWN_GOAL')    return `${e.playerName} (AG)`;
  if (e.type === 'PENALTY')     return `${e.playerName} (P)`;
  if (e.type === 'SUBSTITUTION') return `↑ ${e.playerInName ?? ''} / ↓ ${e.playerName}`;
  return e.playerName;
}

function minuteLabel(e: MatchEvent): string {
  return e.injuryTime > 0 ? `${e.minute}+${e.injuryTime}'` : `${e.minute}'`;
}

function EventRow({ event }: { event: MatchEvent }) {
  const isHome = event.team === 'home';
  return (
    <div className={`flex items-center gap-2 py-1.5 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="flex-shrink-0 flex items-center justify-center w-6">
        <EventIcon type={event.type} />
      </div>
      <div className={`flex flex-col flex-1 min-w-0 ${isHome ? 'items-start' : 'items-end'}`}>
        <span className="text-xs font-semibold truncate max-w-full" style={{ color: 'var(--text)' }}>
          {eventLabel(event)}
        </span>
        {event.assistName && (
          <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>
            Asistencia: {event.assistName}
          </span>
        )}
      </div>
      <span
        className="flex-shrink-0 text-[10px] font-bold tabular-nums"
        style={{ color: 'var(--text-dim)', minWidth: 32, textAlign: 'center' }}
      >
        {minuteLabel(event)}
      </span>
    </div>
  );
}

function PlayerButton({
  player,
  align,
  onSelect,
}: {
  player: LineupPlayer | undefined;
  align: 'left' | 'right';
  onSelect: (p: LineupPlayer) => void;
}) {
  if (!player) return <span className="flex-1" />;
  return (
    <button
      onClick={() => onSelect(player)}
      className={`flex-1 text-[11px] truncate text-${align} rounded transition-opacity active:opacity-60`}
      style={{ color: 'var(--text)', textAlign: align }}
    >
      {player.number}. {player.name}
    </button>
  );
}

function LineupSection({
  home,
  away,
  onSelectPlayer,
}: {
  home: TeamLineup;
  away: TeamLineup;
  onSelectPlayer: (p: LineupPlayer) => void;
}) {
  const max = Math.max(home.startingXI.length, away.startingXI.length);
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{home.formation}</span>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-mute)' }}>Formacion</span>
        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{away.formation}</span>
      </div>
      <div className="space-y-1">
        {Array.from({ length: max }).map((_, i) => {
          const hp = home.startingXI[i];
          const ap = away.startingXI[i];
          return (
            <div key={i} className="flex items-center gap-2">
              <PlayerButton player={hp} align="left" onSelect={onSelectPlayer} />
              <span className="text-[9px] flex-shrink-0 px-1.5 py-0.5 rounded" style={{ background: 'var(--border-subtle)', color: 'var(--text-mute)' }}>
                {hp?.position?.split('-')[0]?.slice(0, 3).toUpperCase() ?? ap?.position?.split('-')[0]?.slice(0, 3).toUpperCase() ?? ''}
              </span>
              <PlayerButton player={ap} align="right" onSelect={onSelectPlayer} />
            </div>
          );
        })}
      </div>
      {(home.substitutes.length > 0 || away.substitutes.length > 0) && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-mute)' }}>Suplentes</p>
          <div className="flex gap-4">
            <div className="flex-1 space-y-0.5">
              {home.substitutes.map((p) => (
                <button
                  key={p.number}
                  onClick={() => onSelectPlayer(p)}
                  className="block w-full text-left text-[11px] truncate transition-opacity active:opacity-60"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {p.number}. {p.name}
                </button>
              ))}
            </div>
            <div className="flex-1 space-y-0.5 text-right">
              {away.substitutes.map((p) => (
                <button
                  key={p.number}
                  onClick={() => onSelectPlayer(p)}
                  className="block w-full text-right text-[11px] truncate transition-opacity active:opacity-60"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {p.number}. {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MatchTimelineProps {
  events: MatchEvent[];
  homeLineup: TeamLineup | null;
  awayLineup: TeamLineup | null;
  homeTeamName: string;
  awayTeamName: string;
}

export function MatchTimeline({ events, homeLineup, awayLineup, homeTeamName, awayTeamName }: MatchTimelineProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);

  const cardStyle = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--border-color)',
  };

  return (
    <>
      <div className="space-y-4">
        {events.length > 0 && (
          <div className="rounded-2xl p-4" style={cardStyle}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest truncate flex-1" style={{ color: 'var(--text-dim)' }}>
                {homeTeamName}
              </span>
              <span className="font-heading text-base flex-shrink-0 mx-2" style={{ color: 'var(--text-mute)' }}>
                EVENTOS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest truncate flex-1 text-right" style={{ color: 'var(--text-dim)' }}>
                {awayTeamName}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {events.map((e, i) => (
                <EventRow key={i} event={e} />
              ))}
            </div>
          </div>
        )}

        {homeLineup && awayLineup && (
          <div className="rounded-2xl p-4" style={cardStyle}>
            <h3 className="font-heading text-xl tracking-wide mb-3" style={{ color: 'var(--text-dim)' }}>
              ALINEACIONES
            </h3>
            <p className="text-[10px] mb-3" style={{ color: 'var(--text-mute)' }}>
              Tocá un jugador para ver su info
            </p>
            <LineupSection
              home={homeLineup}
              away={awayLineup}
              onSelectPlayer={setSelectedPlayer}
            />
          </div>
        )}
      </div>

      <PlayerSheet
        player={selectedPlayer}
        events={events}
        onClose={() => setSelectedPlayer(null)}
      />
    </>
  );
}

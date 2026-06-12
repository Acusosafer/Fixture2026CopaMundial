'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';

const STORAGE_KEY = 'matchday-banner-dismissed';

function todayDateKey() {
  // Use local date in Argentina time (UTC-3)
  const now = new Date();
  const art = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return art.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function isToday(isoUtc: string) {
  const matchDate = new Date(isoUtc);
  const art = new Date(matchDate.getTime() - 3 * 60 * 60 * 1000);
  return art.toISOString().slice(0, 10) === todayDateKey();
}

function formatTimeART(isoUtc: string) {
  const d = new Date(isoUtc);
  const art = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return art.toISOString().slice(11, 16); // 'HH:MM'
}

export function MatchDayBanner() {
  const [visible, setVisible] = useState(false);

  const todayMatches = useMemo(
    () => staticMatches.filter((m) => isToday(m.date) && m.status !== 'finished'),
    []
  );

  useEffect(() => {
    if (todayMatches.length === 0) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === todayDateKey()) return;
    // Small delay so it doesn't overlap the splash
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [todayMatches]);

  if (!visible || todayMatches.length === 0) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, todayDateKey());
    setVisible(false);
  }

  const first = todayMatches[0];
  const home = getTeamByCode(first.homeTeamCode);
  const away = getTeamByCode(first.awayTeamCode);

  return (
    <div
      className="fixed left-3 right-3 z-[65] rounded-2xl overflow-hidden"
      style={{
        top: 'calc(3.75rem + env(safe-area-inset-top) + 8px)',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2a45 100%)',
        border: '1px solid rgba(255,215,0,0.35)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Gold top bar */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)' }} />

      <div className="px-4 py-3.5 flex items-center gap-3">
        {/* Trophy + text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: '#FFD700' }}>
            🏆 HOY EMPIEZA EL MUNDIAL
          </p>
          {/* Match row */}
          <div className="flex items-center gap-2 mt-1.5">
            {home?.flagUrl && (
              <div className="relative rounded-sm overflow-hidden shrink-0" style={{ width: 24, height: 16 }}>
                <Image src={home.flagUrl} alt={home.nameEs} fill className="object-cover" unoptimized />
              </div>
            )}
            <span className="text-sm font-bold truncate" style={{ color: '#fff' }}>
              {home?.nameEs ?? first.homeTeamCode}
            </span>
            <span className="text-xs font-semibold shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }}>vs</span>
            {away?.flagUrl && (
              <div className="relative rounded-sm overflow-hidden shrink-0" style={{ width: 24, height: 16 }}>
                <Image src={away.flagUrl} alt={away.nameEs} fill className="object-cover" unoptimized />
              </div>
            )}
            <span className="text-sm font-bold truncate" style={{ color: '#fff' }}>
              {away?.nameEs ?? first.awayTeamCode}
            </span>
            <span className="text-xs font-semibold shrink-0 ml-1" style={{ color: '#FFD700' }}>
              {formatTimeART(first.date)} ART
            </span>
          </div>
          {todayMatches.length > 1 && (
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              +{todayMatches.length - 1} partido{todayMatches.length - 1 > 1 ? 's' : ''} más hoy
            </p>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/fixture"
          onClick={dismiss}
          className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.96]"
          style={{ background: '#FFD700', color: '#0a1628' }}
        >
          Ver fixture
        </Link>

        {/* Close */}
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

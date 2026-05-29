'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Team } from '@/lib/teams';

interface NextMatchCardProps {
  myTeam: Team;
  rival: Team;
  venue: string;
  dateLabel: string;
  timeLabel: string;
}

const shouldReduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function NextMatchCard({ myTeam, rival, venue, dateLabel, timeLabel }: NextMatchCardProps) {
  return (
    <motion.div
      initial={shouldReduceMotion() ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.2 }}
      className="w-full rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-widest mb-4 text-center"
        style={{ color: 'var(--text-dim)' }}
      >
        Próximo partido
      </p>

      <div className="flex items-center justify-between gap-4">
        {/* My team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-12 relative">
            <Image
              src={myTeam.flagUrl}
              alt={myTeam.nameEs}
              fill
              className="object-contain rounded-sm"
              unoptimized
            />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {myTeam.nameEs}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-lg font-black"
            style={{ color: 'var(--accent)' }}
          >
            VS
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>
            {timeLabel}
          </span>
        </div>

        {/* Rival */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-12 relative">
            <Image
              src={rival.flagUrl}
              alt={rival.nameEs}
              fill
              className="object-contain rounded-sm"
              unoptimized
            />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {rival.nameEs}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1">
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          📍 {venue}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-mute)' }}>
          {dateLabel}
        </span>
      </div>
    </motion.div>
  );
}

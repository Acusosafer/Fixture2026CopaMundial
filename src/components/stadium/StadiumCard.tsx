'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Hammer } from 'lucide-react';
import type { Stadium } from '@/lib/stadiums';

const countryFlag: Record<Stadium['country'], string> = {
  USA: '🇺🇸',
  Canada: '🇨🇦',
  Mexico: '🇲🇽',
};

const countryLabel: Record<Stadium['country'], string> = {
  USA: 'Estados Unidos',
  Canada: 'Canadá',
  Mexico: 'México',
};

const timezoneLabel: Record<string, string> = {
  'America/New_York': 'Hora del Este',
  'America/Chicago': 'Hora Central',
  'America/Denver': 'Hora de la Montaña',
  'America/Los_Angeles': 'Hora del Pacífico',
  'America/Vancouver': 'Hora del Pacífico',
  'America/Toronto': 'Hora del Este',
  'America/Mexico_City': 'Hora del Centro (MX)',
  'America/Monterrey': 'Hora del Centro (MX)',
};

const gradientByCountry: Record<Stadium['country'], string> = {
  USA: 'linear-gradient(135deg, #1a2a4a 0%, #0d1b3e 100%)',
  Canada: 'linear-gradient(135deg, #3a1010 0%, #1a0808 100%)',
  Mexico: 'linear-gradient(135deg, #0a2a1a 0%, #051a0d 100%)',
};

function formatCapacity(n: number): string {
  return new Intl.NumberFormat('es-AR').format(n);
}

export function StadiumCard({ stadium }: { stadium: Stadium }) {
  const [imgError, setImgError] = useState(false);
  const flag = countryFlag[stadium.country];
  const country = countryLabel[stadium.country];
  const tz = timezoneLabel[stadium.timezone] ?? stadium.timezone;
  const gradient = gradientByCountry[stadium.country];

  return (
    <div
      id={stadium.id}
      className="rounded-2xl overflow-hidden flex flex-col scroll-mt-32"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Image */}
      <div
        className="relative w-full h-40 flex items-end p-3 overflow-hidden"
        style={{ background: gradient }}
      >
        {!imgError && (
          <Image
            src={stadium.imageUrl}
            alt={stadium.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => setImgError(true)}
          />
        )}
        {/* City chip */}
        <div
          className="relative z-10 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <MapPin size={10} />
          {stadium.city}
        </div>

        {/* New construction badge */}
        {stadium.isNewConstruction && (
          <div
            className="relative z-10 ml-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: 'var(--lime)',
              border: '1px solid var(--lime)',
            }}
          >
            <Hammer size={9} />
            Nuevo
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-bold leading-tight" style={{ color: 'var(--text)' }}>
            {stadium.name}
          </h2>
          <span
            className="flex-shrink-0 text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded"
            style={{ background: 'var(--border-subtle)', color: 'var(--text-mute)' }}
          >
            {stadium.builtYear}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-base">{flag}</span>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {country}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {stadium.description}
        </p>

        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-mute)' }}>
              Capacidad
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
              {formatCapacity(stadium.capacity)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-mute)' }}>
              Zona horaria
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
              {tz}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

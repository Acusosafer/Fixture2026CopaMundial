import { MapPin } from 'lucide-react';
import { stadiums, type Stadium } from '@/lib/stadiums';
import { StadiumCard } from '@/components/stadium/StadiumCard';

export const metadata = {
  title: 'Sedes · Mundial 2026',
};

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

export default function SedesPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-2">
        <div className="flex items-center gap-2">
          <MapPin size={22} style={{ color: 'var(--accent)' }} strokeWidth={2} />
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Sedes
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          {stadiums.length} estadios · 3 países
        </p>
      </div>

      {/* Country summary */}
      <div className="flex gap-3">
        {(['USA', 'Canada', 'Mexico'] as Stadium['country'][]).map((c) => {
          const count = stadiums.filter((s) => s.country === c).length;
          return (
            <div
              key={c}
              className="flex-1 rounded-xl px-3 py-2.5 flex flex-col items-center gap-1"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="text-xl">{countryFlag[c]}</span>
              <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {count}
              </span>
              <span className="text-[10px] text-center" style={{ color: 'var(--text-mute)' }}>
                {countryLabel[c]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stadiums.map((stadium) => (
          <StadiumCard key={stadium.id} stadium={stadium} />
        ))}
      </div>
    </div>
  );
}

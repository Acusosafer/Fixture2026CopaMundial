import { BookOpen, Trophy } from 'lucide-react';

export const metadata = {
  title: 'Histórico · Mundial 2026',
};

interface WorldCup {
  year: number;
  host: string;
  champion: string;
  runnerUp: string;
  topScorer: string;
  topScorerGoals: number;
  isArgentina?: boolean;
}

const worldCups: WorldCup[] = [
  {
    year: 2022,
    host: 'Qatar',
    champion: 'Argentina',
    runnerUp: 'Francia',
    topScorer: 'Kylian Mbappé (FRA)',
    topScorerGoals: 8,
    isArgentina: true,
  },
  {
    year: 2018,
    host: 'Rusia',
    champion: 'Francia',
    runnerUp: 'Croacia',
    topScorer: 'Harry Kane (ENG)',
    topScorerGoals: 6,
  },
  {
    year: 2014,
    host: 'Brasil',
    champion: 'Alemania',
    runnerUp: 'Argentina',
    topScorer: 'James Rodríguez (COL)',
    topScorerGoals: 6,
  },
  {
    year: 2010,
    host: 'Sudáfrica',
    champion: 'España',
    runnerUp: 'Países Bajos',
    topScorer: 'Thomas Müller (GER)',
    topScorerGoals: 5,
  },
  {
    year: 2006,
    host: 'Alemania',
    champion: 'Italia',
    runnerUp: 'Francia',
    topScorer: 'Miroslav Klose (GER)',
    topScorerGoals: 5,
  },
  {
    year: 2002,
    host: 'Corea / Japón',
    champion: 'Brasil',
    runnerUp: 'Alemania',
    topScorer: 'Ronaldo (BRA)',
    topScorerGoals: 8,
  },
  {
    year: 1998,
    host: 'Francia',
    champion: 'Francia',
    runnerUp: 'Brasil',
    topScorer: 'Davor Šuker (CRO)',
    topScorerGoals: 6,
  },
  {
    year: 1994,
    host: 'Estados Unidos',
    champion: 'Brasil',
    runnerUp: 'Italia',
    topScorer: 'Hristo Stoichkov (BUL) / Oleg Salenko (RUS)',
    topScorerGoals: 6,
  },
  {
    year: 1990,
    host: 'Italia',
    champion: 'Alemania',
    runnerUp: 'Argentina',
    topScorer: 'Salvatore Schillaci (ITA)',
    topScorerGoals: 6,
  },
  {
    year: 1986,
    host: 'México',
    champion: 'Argentina',
    runnerUp: 'Alemania',
    topScorer: 'Gary Lineker (ENG)',
    topScorerGoals: 6,
    isArgentina: true,
  },
  {
    year: 1982,
    host: 'España',
    champion: 'Italia',
    runnerUp: 'Alemania',
    topScorer: 'Paolo Rossi (ITA)',
    topScorerGoals: 6,
  },
  {
    year: 1978,
    host: 'Argentina',
    champion: 'Argentina',
    runnerUp: 'Países Bajos',
    topScorer: 'Mario Kempes (ARG)',
    topScorerGoals: 6,
    isArgentina: true,
  },
  {
    year: 1974,
    host: 'Alemania',
    champion: 'Alemania',
    runnerUp: 'Países Bajos',
    topScorer: 'Grzegorz Lato (POL)',
    topScorerGoals: 7,
  },
  {
    year: 1970,
    host: 'México',
    champion: 'Brasil',
    runnerUp: 'Italia',
    topScorer: 'Gerd Müller (GER)',
    topScorerGoals: 10,
  },
  {
    year: 1966,
    host: 'Inglaterra',
    champion: 'Inglaterra',
    runnerUp: 'Alemania',
    topScorer: 'Eusébio (POR)',
    topScorerGoals: 9,
  },
  {
    year: 1962,
    host: 'Chile',
    champion: 'Brasil',
    runnerUp: 'Checoslovaquia',
    topScorer: 'Varios con 4 goles',
    topScorerGoals: 4,
  },
  {
    year: 1958,
    host: 'Suecia',
    champion: 'Brasil',
    runnerUp: 'Suecia',
    topScorer: 'Just Fontaine (FRA)',
    topScorerGoals: 13,
  },
  {
    year: 1954,
    host: 'Suiza',
    champion: 'Alemania',
    runnerUp: 'Hungría',
    topScorer: 'Sándor Kocsis (HUN)',
    topScorerGoals: 11,
  },
  {
    year: 1950,
    host: 'Brasil',
    champion: 'Uruguay',
    runnerUp: 'Brasil',
    topScorer: 'Ademir (BRA)',
    topScorerGoals: 9,
  },
  {
    year: 1938,
    host: 'Francia',
    champion: 'Italia',
    runnerUp: 'Hungría',
    topScorer: 'Leônidas (BRA)',
    topScorerGoals: 7,
  },
  {
    year: 1934,
    host: 'Italia',
    champion: 'Italia',
    runnerUp: 'Checoslovaquia',
    topScorer: 'Oldřich Nejedlý (TCH)',
    topScorerGoals: 5,
  },
  {
    year: 1930,
    host: 'Uruguay',
    champion: 'Uruguay',
    runnerUp: 'Argentina',
    topScorer: 'Guillermo Stábile (ARG)',
    topScorerGoals: 8,
  },
];

function WorldCupCard({ wc }: { wc: WorldCup }) {
  const isGolden = wc.isArgentina;

  return (
    <div
      className="rounded-2xl p-4 flex gap-4 items-start"
      style={{
        background: isGolden
          ? 'rgba(255, 215, 0, 0.06)'
          : 'var(--bg-card)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: isGolden
          ? '1px solid rgba(255,215,0,0.35)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Year */}
      <div className="flex flex-col items-center shrink-0 min-w-[48px]">
        <span
          className="text-xl font-black tabular-nums"
          style={{ color: isGolden ? '#FFD700' : 'var(--accent)' }}
        >
          {wc.year}
        </span>
        <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-mute)' }}>
          {wc.host}
        </span>
      </div>

      {/* Divider */}
      <div
        className="w-px self-stretch"
        style={{ background: isGolden ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.07)' }}
      />

      {/* Info */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {/* Champion */}
        <div className="flex items-center gap-2">
          {isGolden ? (
            <Trophy size={14} style={{ color: '#FFD700' }} strokeWidth={2} />
          ) : (
            <span className="text-sm">🏆</span>
          )}
          <span
            className="text-sm font-bold truncate"
            style={{ color: isGolden ? '#FFD700' : 'var(--text)' }}
          >
            {wc.champion}
            {isGolden && (
              <span className="ml-2 text-[10px] font-semibold" style={{ color: '#FFD700' }}>
                Campeón
              </span>
            )}
          </span>
        </div>

        {/* Runner up */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-mute)' }}>
            Subcampeón:
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
            {wc.runnerUp}
          </span>
        </div>

        {/* Top scorer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px]" style={{ color: 'var(--text-mute)' }}>
            Goleador:
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>
            {wc.topScorer}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums"
            style={{
              background: 'rgba(16,240,160,0.1)',
              color: '#10F0A0',
            }}
          >
            {wc.topScorerGoals} goles
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HistoricoPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-2">
        <div className="flex items-center gap-2">
          <BookOpen size={22} style={{ color: 'var(--accent)' }} strokeWidth={2} />
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Histórico
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Mundiales 1930 â€“ 2022
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ediciones', value: '22' },
          { label: 'Brasil', value: '5 🏆' },
          { label: 'Argentina', value: '3 🏆' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl px-3 py-2.5 flex flex-col items-center gap-0.5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="text-base font-bold" style={{ color: 'var(--accent)' }}>
              {value}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-mute)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {worldCups.map((wc) => (
          <WorldCupCard key={wc.year} wc={wc} />
        ))}
      </div>
    </div>
  );
}

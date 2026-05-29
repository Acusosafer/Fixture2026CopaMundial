import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      {/* Ball */}
      <span className="text-6xl select-none" aria-hidden="true">
        âš½
      </span>

      {/* 404 */}
      <div
        className="text-7xl font-black tracking-tight leading-none"
        style={{
          color: 'var(--accent)',
          textShadow: '0 0 40px var(--accent-border)',
        }}
      >
        404
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          Esta página no existe en el fixture
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          La URL que buscás no corresponde a ningún partido.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="flex items-center justify-center h-12 px-8 rounded-2xl font-semibold text-sm transition-all active:scale-95"
        style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-border)',
          color: 'var(--accent)',
        }}
      >
        Volver al home
      </Link>
    </div>
  );
}

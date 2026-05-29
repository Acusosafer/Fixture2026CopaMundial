export default function FixtureLoading() {
  return (
    <main className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header skeleton */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-3"
        style={{
          background: 'rgba(10,14,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-baseline gap-3 mb-3">
          <div
            className="rounded animate-pulse"
            style={{ width: 96, height: 28, background: 'var(--border-color)' }}
          />
          <div
            className="rounded animate-pulse"
            style={{ width: 64, height: 16, background: 'var(--border-subtle)' }}
          />
        </div>
        {/* Filter chips skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {[80, 56, 112, 72, 72, 72, 72].map((w, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-full animate-pulse"
              style={{ width: w, height: 30, background: 'var(--border-color)' }}
            />
          ))}
        </div>
      </div>

      {/* Match skeletons */}
      <div className="px-4 pt-4 space-y-6">
        {/* Date header skeleton */}
        <section>
          <div
            className="rounded animate-pulse mb-3"
            style={{ width: 160, height: 12, background: 'var(--border-color)' }}
          />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <div
            className="rounded animate-pulse mb-3"
            style={{ width: 140, height: 12, background: 'var(--border-color)' }}
          />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MatchCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div
            className="rounded-sm"
            style={{ width: 48, height: 32, background: 'rgba(255,255,255,0.07)' }}
          />
          <div
            className="rounded"
            style={{ width: 60, height: 10, background: 'rgba(255,255,255,0.05)' }}
          />
        </div>

        {/* Center */}
        <div
          className="rounded"
          style={{ width: 36, height: 22, background: 'rgba(255,255,255,0.07)' }}
        />

        {/* Away */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div
            className="rounded-sm"
            style={{ width: 48, height: 32, background: 'rgba(255,255,255,0.07)' }}
          />
          <div
            className="rounded"
            style={{ width: 60, height: 10, background: 'rgba(255,255,255,0.05)' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-3 pt-3 flex justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div
          className="rounded"
          style={{ width: 140, height: 10, background: 'var(--border-subtle)' }}
        />
        <div
          className="rounded"
          style={{ width: 56, height: 10, background: 'var(--border-subtle)' }}
        />
      </div>
    </div>
  );
}

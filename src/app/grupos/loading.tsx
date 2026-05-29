export default function GruposLoading() {
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
        <div className="mb-1">
          <div
            className="rounded animate-pulse"
            style={{ width: 88, height: 28, background: 'var(--border-color)' }}
          />
          <div
            className="rounded animate-pulse mt-1"
            style={{ width: 144, height: 12, background: 'var(--border-subtle)' }}
          />
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-2 mt-3 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-10 h-10 rounded-full animate-pulse"
              style={{ background: 'var(--border-color)' }}
            />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="px-4 pt-4 space-y-4">
        <GroupTableLoadingSkeleton />
        {/* Show 2 columns on desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {Array.from({ length: 11 }).map((_, i) => (
            <GroupTableLoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

function GroupTableLoadingSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Group label */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="rounded"
          style={{ width: 72, height: 18, background: 'var(--border-color)' }}
        />
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-2 flex gap-3 items-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="rounded" style={{ width: 12, height: 10, background: 'rgba(255,255,255,0.05)' }} />
        <div className="rounded flex-1" style={{ height: 10, background: 'var(--border-subtle)' }} />
        {Array.from({ length: 8 }).map((_, j) => (
          <div key={j} className="rounded" style={{ width: 20, height: 10, background: 'var(--border-subtle)' }} />
        ))}
      </div>

      {/* Team rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-2.5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="rounded" style={{ width: 12, height: 12, background: 'rgba(255,255,255,0.05)' }} />
          <div className="rounded-sm" style={{ width: 24, height: 16, background: 'rgba(255,255,255,0.07)' }} />
          <div className="rounded" style={{ width: 72, height: 12, background: 'rgba(255,255,255,0.05)', flex: 1 }} />
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="rounded" style={{ width: 20, height: 12, background: 'var(--border-subtle)' }} />
          ))}
        </div>
      ))}

      {/* Legend */}
      <div className="px-4 py-2.5 flex gap-4">
        <div className="rounded" style={{ width: 80, height: 10, background: 'var(--border-subtle)' }} />
        <div className="rounded" style={{ width: 120, height: 10, background: 'var(--border-subtle)' }} />
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function ErrorPage({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    console.error('[Mundial 2026] Error:', error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center"
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-full text-4xl"
        style={{
          background: 'rgba(255, 59, 92, 0.12)',
          border: '1px solid rgba(255, 59, 92, 0.25)',
        }}
        aria-hidden="true"
      >
        😕
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Algo salió mal
        </h1>
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-dim)' }}>
          {error.message
            ? error.message
            : 'Ocurrió un error inesperado. Por favor intentá de nuevo.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: 'var(--text-mute)' }}>
            ID: {error.digest}
          </p>
        )}
      </div>

      {/* Retry button */}
      <button
        onClick={() => unstable_retry()}
        className="h-12 px-8 rounded-2xl font-semibold text-sm transition-all active:scale-95"
        style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-border)',
          color: 'var(--accent)',
        }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

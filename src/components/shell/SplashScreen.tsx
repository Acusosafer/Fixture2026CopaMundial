'use client';

import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');

  useEffect(() => {
    // Show splash every session (not just first visit — nice branding)
    const shown = sessionStorage.getItem('splash-shown');
    if (shown) { setPhase('done'); return; }

    const outTimer = setTimeout(() => setPhase('out'), 2200);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('splash-shown', '1');
    }, 2700);

    return () => { clearTimeout(outTimer); clearTimeout(doneTimer); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none ${phase === 'out' ? 'splash-out' : ''}`}
      style={{ background: '#071426' }}
    >
      {/* Trophy — falls from top */}
      <div className="splash-trophy" style={{ fontSize: 72, lineHeight: 1, marginBottom: -8, filter: 'drop-shadow(0 8px 24px rgba(255,107,43,0.5))' }}>
        🏆
      </div>

      {/* Title */}
      <div className="splash-title flex flex-col items-center gap-1 mt-4">
        <span
          className="font-heading"
          style={{ fontSize: '4rem', lineHeight: 1, color: '#FFFFFF', letterSpacing: '0.04em' }}
        >
          MUNDIAL
        </span>
        <span
          className="font-heading"
          style={{ fontSize: '5rem', lineHeight: 0.9, color: '#FF6B2B', letterSpacing: '0.06em' }}
        >
          2026
        </span>
      </div>

      {/* Ball — rolls in from right */}
      <div className="splash-ball mt-8" style={{ fontSize: 40, lineHeight: 1 }}>
        ⚽
      </div>

      {/* Subtitle */}
      <p
        className="splash-title mt-6 text-xs font-semibold uppercase tracking-[0.25em]"
        style={{ color: 'rgba(255,255,255,0.4)', animationDelay: '1.2s' }}
      >
        FIFA World Cup™
      </p>
    </div>
  );
}

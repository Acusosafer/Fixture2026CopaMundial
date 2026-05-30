'use client';

import { useEffect, useMemo, useState } from 'react';

const CONFETTI_COLORS = ['#75AADB', '#FFFFFF', '#E8A83E', '#A9D2F0', '#FFD36B'];

export function SplashScreen() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');
  const [confetti, setConfetti] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const shown = sessionStorage.getItem('splash-shown');
    if (shown) { setPhase('done'); return; }

    const pieces: React.CSSProperties[] = Array.from({ length: 34 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 240;
      return {
        left: '50%',
        top: '42%',
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        ['--dx' as string]: Math.cos(angle) * dist + 'px',
        ['--dy' as string]: Math.sin(angle) * dist - 80 + 'px',
        animation: `splash-burst ${0.9 + Math.random() * 0.7}s cubic-bezier(0.2,0.7,0.3,1) ${1.1 + Math.random() * 0.25}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
    });
    setConfetti(pieces);

    const outTimer = setTimeout(() => setPhase('out'), 2900);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('splash-shown', '1');
    }, 3650);
    return () => { clearTimeout(outTimer); clearTimeout(doneTimer); };
  }, []);

  const word1 = useMemo(() => 'WORLD'.split(''), []);
  const word2 = useMemo(() => 'CUP'.split(''), []);

  if (phase === 'done') return null;

  return (
    <div className={`splash ${phase === 'out' ? 'splash-out' : ''}`}>
      <div className="splash-beams" />
      <div className="splash-confetti">
        {confetti.map((style, i) => <i key={i} style={style} />)}
      </div>

      <div className="splash-stack">
        <div className="splash-hero">
          <span className="splash-trophy">
            <span className="t-glow" />
            <svg viewBox="0 0 160 300" width="92" height="173" aria-hidden="true">
              <defs>
                <linearGradient id="trGold" x1="0.1" y1="0" x2="0.92" y2="1">
                  <stop offset="0" stopColor="#FFF1BE" />
                  <stop offset="0.34" stopColor="#F3C95E" />
                  <stop offset="0.7" stopColor="#D89A2E" />
                  <stop offset="1" stopColor="#9C6716" />
                </linearGradient>
                <radialGradient id="trGlobe" cx="0.38" cy="0.34" r="0.85">
                  <stop offset="0" stopColor="#FFECAE" />
                  <stop offset="0.5" stopColor="#E9B240" />
                  <stop offset="1" stopColor="#A26E1B" />
                </radialGradient>
                <linearGradient id="trBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F1C75D" />
                  <stop offset="1" stopColor="#7E5212" />
                </linearGradient>
              </defs>
              <ellipse cx="80" cy="288" rx="46" ry="8" fill="#000" opacity="0.35" />
              <path d="M42,275 Q80,288 118,275 L121,290 Q80,303 39,290 Z" fill="url(#trBase)" stroke="#6e4910" strokeWidth="1.2" />
              <ellipse cx="80" cy="275" rx="39" ry="9" fill="url(#trGold)" />
              <path d="M51,261 Q80,271 109,261 L112,272 Q80,282 48,272 Z" fill="url(#trBase)" />
              <ellipse cx="80" cy="261" rx="30" ry="7" fill="url(#trGold)" />
              <ellipse cx="80" cy="261" rx="30" ry="7" fill="none" stroke="#5e3f0e" strokeWidth="1.3" opacity="0.55" />
              <path d="M80,108 C58,120 66,152 55,184 C49,208 60,238 70,260 L90,260 C100,238 111,208 105,184 C94,152 102,120 80,108 Z" fill="url(#trGold)" stroke="#7a4f12" strokeWidth="1.2" />
              <path d="M74,118 C60,150 66,150 60,186 C55,214 64,238 72,256" fill="none" stroke="#8a5a12" strokeWidth="2" opacity="0.4" />
              <path d="M86,118 C100,150 94,150 100,186 C105,214 96,238 88,256" fill="none" stroke="#8a5a12" strokeWidth="2" opacity="0.4" />
              <path d="M70,124 C58,156 64,200 70,250" fill="none" stroke="#FFF4CE" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
              <circle cx="80" cy="66" r="44" fill="url(#trGlobe)" stroke="#7a4f12" strokeWidth="1.4" />
              <g fill="none" stroke="#8a5a12" strokeWidth="1.4" opacity="0.5">
                <ellipse cx="80" cy="66" rx="17" ry="44" />
                <ellipse cx="80" cy="66" rx="44" ry="15" />
                <path d="M40,48 H120" />
                <path d="M44,84 H116" />
              </g>
              <ellipse cx="64" cy="50" rx="13" ry="9" fill="#FFFFFF" opacity="0.4" />
              <path d="M70,46 q10,-4 16,2 q-2,8 -10,8 q-8,-2 -6,-10z" fill="#9C6716" opacity="0.32" />
              <path d="M86,72 q8,2 8,10 q-8,4 -12,-2z" fill="#9C6716" opacity="0.28" />
            </svg>
          </span>

          <div className="splash-title">
            <div className="splash-word">
              {word1.map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.5 + i * 0.04}s` }}>{ch}</span>
              ))}
            </div>
            <div className="splash-word">
              {word2.map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.72 + i * 0.04}s` }}>{ch}</span>
              ))}
            </div>
            <div className="splash-2026">2026</div>
            <div className="splash-sheen" />
          </div>
        </div>

        <div className="splash-sub">
          <span className="splash-line" />
          <span className="splash-ball-mini">
            <svg width="22" height="22" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="45" fill="#fff" stroke="#0b1726" strokeWidth="5" />
              <polygon points="50,29 68,42 61,63 39,63 32,42" fill="#0b1726" />
              <path d="M50,29 L50,9 M68,42 L86,35 M61,63 L74,82 M39,63 L26,82 M32,42 L14,35" stroke="#0b1726" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          <span className="splash-line splash-line-r" />
        </div>
        <div className="splash-tag">FIFA WORLD CUP™</div>
      </div>

      <div className="splash-load"><i /></div>
      <div className="splash-vignette" />
    </div>
  );
}

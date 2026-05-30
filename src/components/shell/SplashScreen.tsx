'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

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
            <Image
              src="/trophy.png"
              alt="Copa del Mundo"
              width={92}
              height={173}
              priority
              style={{ display: 'block', position: 'relative', zIndex: 1 }}
              className="splash-trophy-img"
            />
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

'use client';

import { useEffect, useRef } from 'react';

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const prevTrigger = useRef(false);

  useEffect(() => {
    if (!trigger || prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    let done = false;

    async function launch() {
      const confetti = (await import('canvas-confetti')).default;

      const duration = 2500;
      const end = Date.now() + duration;

      const colors = ['var(--accent)', '#ffffff', '#FFD700', '#FF6B6B'];

      const frame = () => {
        if (Date.now() > end) {
          if (!done) {
            done = true;
            onComplete?.();
          }
          return;
        }

        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });

        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
    }

    launch().catch(() => {
      onComplete?.();
    });
  }, [trigger, onComplete]);

  return null;
}

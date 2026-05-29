'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownHeroProps {
  targetDate: Date;
  label: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const digits: (keyof TimeLeft)[] = ['days', 'hours', 'minutes', 'seconds'];
const digitLabels: Record<keyof TimeLeft, string> = {
  days: 'DÍAS',
  hours: 'HORAS',
  minutes: 'MIN',
  seconds: 'SEG',
};

const shouldReduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CountdownHero({ targetDate, label }: CountdownHeroProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(shouldReduceMotion());
    setTimeLeft(calculateTimeLeft(targetDate));
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const minutesRemaining = timeLeft
    ? timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes
    : Infinity;

  const isUrgent  = minutesRemaining <= 60;
  const isPulsing = minutesRemaining <= 5;

  const accentColor  = isUrgent ? 'var(--ember)'           : 'var(--plasma)';
  const accentDim    = isUrgent ? 'var(--ember-dim)'        : 'var(--plasma-dim)';
  const accentBorder = isUrgent ? 'rgba(232,93,47,0.3)'     : 'rgba(123,94,167,0.3)';
  const accentGlow   = isUrgent ? 'rgba(232,93,47,0.25)'    : 'rgba(123,94,167,0.2)';

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-xs font-medium uppercase tracking-widest transition-colors duration-[600ms]"
        style={{ color: isUrgent ? accentColor : 'var(--text-dim)' }}
      >
        {label}
      </p>

      {isPulsing && (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
          style={{ background: accentDim, border: `1px solid ${accentBorder}`, color: accentColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: accentColor }} />
          PRONTO
        </div>
      )}

      <div className="flex items-center gap-2">
        {digits.map((key) => (
          <div key={key} className="flex flex-col items-center">
            <div
              className="relative flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-[600ms]"
              style={{
                width: 64,
                height: 72,
                background: accentDim,
                backdropFilter: 'blur(24px) saturate(180%)',
                border: `1px solid ${accentBorder}`,
                boxShadow: `0 8px 32px -8px ${accentGlow}`,
              }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={timeLeft ? timeLeft[key] : '--'}
                  initial={reduceMotion ? {} : { y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? {} : { y: 20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="countdown-digit transition-colors duration-[600ms]"
                  style={{ color: accentColor }}
                >
                  {timeLeft ? String(timeLeft[key]).padStart(2, '0') : '--'}
                </motion.span>
              </AnimatePresence>
            </div>
            <span
              className="mt-1 text-[9px] font-semibold uppercase tracking-wider transition-colors duration-[600ms]"
              style={{ color: isUrgent ? accentColor : 'var(--text-mute)' }}
            >
              {digitLabels[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

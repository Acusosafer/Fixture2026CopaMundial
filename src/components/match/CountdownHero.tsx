'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownHeroProps {
  targetDate: Date;
  label: string;
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }

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
  days: 'DÍAS', hours: 'HORAS', minutes: 'MIN', seconds: 'SEG',
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

  const isUrgent = minutesRemaining <= 60;
  const isPulsing = minutesRemaining <= 5;

  const accent = isUrgent ? 'var(--ember)' : 'var(--accent)';

  return (
    <div className="cd-hero">
      <p className="cd-hero-label" style={{ color: isUrgent ? accent : undefined }}>
        {label}
      </p>

      {isPulsing && (
        <div className="cd-soon" style={{ color: accent, borderColor: accent }}>
          <span className="cd-soon-dot" style={{ background: accent }} />
          PRONTO
        </div>
      )}

      <div className="cd-row">
        {digits.map((key) => (
          <div key={key} className="cd-cell">
            <div className="cd-box" style={{ ['--cd-accent' as string]: accent }}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={timeLeft ? timeLeft[key] : '--'}
                  initial={reduceMotion ? {} : { y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? {} : { y: 20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="cd-value"
                >
                  {timeLeft ? String(timeLeft[key]).padStart(2, '0') : '--'}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="cd-cap">{digitLabels[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

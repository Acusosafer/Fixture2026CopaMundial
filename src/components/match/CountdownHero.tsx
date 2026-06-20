'use client';

import { useState, useEffect } from 'react';
import { AnimateNumber } from '@/components/ui/animated-blur-number';

interface CountdownHeroProps {
  targetDate: Date;
  label: string;
  white?: boolean;
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


export function CountdownHero({ targetDate, label, white = false }: CountdownHeroProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const minutesRemaining = timeLeft
    ? timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes
    : Infinity;

  const isUrgent = minutesRemaining <= 60;
  const isPulsing = minutesRemaining <= 5;

  const accent = white ? '#ffffff' : isUrgent ? 'var(--ember)' : 'var(--accent)';

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
              {timeLeft ? (
                <AnimateNumber
                  value={timeLeft[key]}
                  format={{ minimumIntegerDigits: 2, useGrouping: false }}
                  locale="en-US"
                  duration={400}
                  blur={16}
                  className="cd-value"
                  style={{ color: accent }}
                />
              ) : (
                <span className="cd-value">--</span>
              )}
            </div>
            <span className="cd-cap">{digitLabels[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

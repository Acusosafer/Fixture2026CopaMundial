'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  color?: 'ember' | 'plasma' | 'gold' | 'default';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<string, string> = {
  ember:   'var(--ember)',
  plasma:  'var(--plasma)',
  gold:    'var(--gold)',
  default: 'var(--text)',
};

export function ScoreDisplay({ score, color = 'default', className, size = 'md' }: ScoreDisplayProps) {
  const sizeClass = size === 'lg' ? 'text-6xl' : size === 'sm' ? 'text-2xl' : 'text-4xl';

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={score}
        initial={{ rotateX: 90, opacity: 0, scale: 0.9 }}
        animate={{ rotateX: 0, opacity: 1, scale: 1 }}
        exit={{ rotateX: -90, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          display: 'inline-block',
          fontVariantNumeric: 'tabular-nums',
          color: colorMap[color] ?? colorMap.default,
          transformOrigin: 'center center',
          fontWeight: 900,
        }}
        className={`${sizeClass} ${className ?? ''}`}
      >
        {score}
      </motion.span>
    </AnimatePresence>
  );
}

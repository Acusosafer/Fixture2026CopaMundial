'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface ScoreFlipProps {
  score: number;
  color?: string;
}

export function ScoreFlip({ score, color = '#ffffff' }: ScoreFlipProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [key, setKey] = useState(0);
  const prevScore = useRef(score);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      setKey((k) => k + 1);
      setDisplayScore(score);
    }
  }, [score]);

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { rotateX: -90, opacity: 0, transformOrigin: 'center bottom' },
        animate: { rotateX: 0, opacity: 1, transformOrigin: 'center bottom' },
        exit: { rotateX: 90, opacity: 0, transformOrigin: 'center top' },
      };

  return (
    <div
      style={{
        perspective: '400px',
        display: 'inline-block',
        lineHeight: 1,
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={key}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{
            display: 'inline-block',
            fontSize: 'clamp(64px, 18vw, 144px)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color,
            backfaceVisibility: 'hidden',
          }}
        >
          {displayScore}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

'use client';

import { ReactNode, useCallback, useRef, useState } from 'react';
import { showToast } from '@/lib/toast';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const PULL_THRESHOLD = 72; // px needed to trigger refresh
const MAX_PULL = 120; // px max visual pull distance

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Only allow pull when scrolled to top
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isPulling.current || startY.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const delta = currentY - startY.current;

      if (delta <= 0) {
        setPullDistance(0);
        return;
      }

      // Prevent native scroll while pulling
      if (delta > 8) {
        e.preventDefault();
      }

      // Apply rubber-band damping
      const damped = Math.min(delta * 0.5, MAX_PULL);
      setPullDistance(damped);
    },
    [isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    startY.current = null;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.6);
      try {
        await onRefresh();
        showToast.info('Todo actualizado');
      } catch {
        showToast.apiError('Error al actualizar. Intentá de nuevo.');
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  const showIndicator = pullDistance > 8 || isRefreshing;
  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const isReady = progress >= 1;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: pullDistance > 0 ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <div
        style={{
          overflow: 'hidden',
          height: showIndicator ? `${Math.max(pullDistance, isRefreshing ? 44 : 0)}px` : '0px',
          transition: isPulling.current ? 'none' : 'height 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid #00D9FF',
            borderTopColor: isReady || isRefreshing ? 'var(--accent)' : 'transparent',
            transform: isRefreshing
              ? undefined
              : `rotate(${progress * 360}deg)`,
            animation: isRefreshing ? 'ptr-spin 0.7s linear infinite' : 'none',
            transition: isPulling.current ? 'none' : 'transform 0.2s ease',
            opacity: isReady || isRefreshing ? 1 : 0.5 + progress * 0.5,
          }}
        />
      </div>

      <style>{`
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {children}
    </div>
  );
}

'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useMySelection } from '@/hooks/useMySelection';

export function useGoalEffect() {
  const { team } = useMySelection();

  const triggerGoal = useCallback(
    async (scoringTeamCode: string, scoringTeamName: string, newScore: string) => {
      const isMyTeam = !!team && team.code === scoringTeamCode;

      if (isMyTeam) {
        // Flash pantalla
        document.body.classList.add('goal-flash');
        setTimeout(() => document.body.classList.remove('goal-flash'), 220);

        // Confetti
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          const confetti = (await import('canvas-confetti')).default;
          const colors = [
            team.primaryColor,
            team.secondaryColor ?? '#FFFFFF',
            '#E8A83E',
          ];
          confetti({
            particleCount: 140,
            spread: 90,
            startVelocity: 45,
            colors,
            origin: { y: 0.6 },
          });
        }

        // Haptic
        navigator.vibrate?.([100, 50, 200]);

        // Toast
        toast(`⚽ GOOOL ${scoringTeamName}!`, {
          description: newScore,
          duration: 5000,
          position: 'top-center',
          style: {
            background: 'var(--ember-dim)',
            border: '1px solid var(--ember)',
            color: 'var(--ember)',
          },
        });
      } else {
        navigator.vibrate?.([80]);

        toast(`${scoringTeamName} marcó`, {
          description: newScore,
          duration: 3000,
          position: 'top-center',
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
          },
        });
      }
    },
    [team]
  );

  const triggerRedCard = useCallback(
    (teamCode: string, playerName: string, minute: number) => {
      navigator.vibrate?.([150]);
      const isMyTeam = !!team && team.code === teamCode;
      if (isMyTeam) {
        toast(`🟥 Tarjeta roja: ${playerName}`, {
          description: `min ${minute}'`,
          duration: 4000,
          position: 'top-center',
          style: {
            background: 'rgba(232,65,62,0.1)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
          },
        });
      }
    },
    [team]
  );

  return { triggerGoal, triggerRedCard };
}

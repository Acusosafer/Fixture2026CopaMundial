'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun } from 'lucide-react';
import { usePreferences } from '@/store/preferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { getTeamByCode } from '@/lib/teams';

function TeamChip({ teamCode }: { teamCode: string }) {
  const team = getTeamByCode(teamCode);
  return (
    <Link
      href="/seleccion"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
      style={{
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-border)',
        color: 'var(--accent)',
      }}
    >
      {team?.flagUrl ? (
        <div className="relative overflow-hidden rounded-sm flex-shrink-0" style={{ width: 20, height: 14 }}>
          <Image src={team.flagUrl} alt={team.nameEs} fill className="object-cover" unoptimized />
        </div>
      ) : null}
      <span className="max-w-[72px] truncate">{team?.nameEs ?? 'Mi Selección'}</span>
    </Link>
  );
}

function PushIconButton() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported || permission === 'unsupported' || permission === 'denied') return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className="p-2 rounded-full transition-colors disabled:opacity-40"
      style={{ color: isSubscribed ? 'var(--accent)' : 'var(--text-dim)' }}
      aria-label={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
      title={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
    >
      <span className="text-lg leading-none">{isSubscribed ? '🔔' : '🔕'}</span>
    </button>
  );
}

export function TopBar() {
  const { theme, toggleTheme, myTeamCode } = usePreferences();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 glass-nav"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <Link href="/" className="wc-logo" aria-label="World Cup 2026">
        <span className="wc-logo-ball">
          <Image
            src="/trophy.png"
            alt="Copa del Mundo"
            width={60}
            height={112}
            priority
            style={{ objectFit: 'contain' }}
          />
        </span>
        <span className="wc-logo-text">
          WORLD CUP <span className="wc-logo-year">2026</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <PushIconButton />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-colors"
          style={{ color: 'var(--text-dim)' }}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark'
            ? <Sun size={18} />
            : <Moon size={18} />
          }
        </button>

        <TeamChip teamCode={myTeamCode} />
      </div>
    </header>
  );
}

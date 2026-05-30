'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun } from 'lucide-react';
import { usePreferences } from '@/store/preferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';

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
  const { theme, toggleTheme } = usePreferences();

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
            width={26}
            height={49}
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

        <Link
          href="/seleccion"
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
          }}
        >
          Mi Selección
        </Link>
      </div>
    </header>
  );
}

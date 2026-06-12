'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const STORAGE_KEY = 'notif-prompt-shown';

export function NotificationPrompt() {
  const { permission, subscribe, isSupported } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported || permission !== 'default') return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [isSupported, permission]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  async function handleActivate() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    await subscribe();
  }

  return (
    <div
      className="fixed left-4 right-4 z-[60] rounded-2xl px-4 py-4 flex gap-3 items-start"
      style={{
        bottom: 'calc(5rem + env(safe-area-inset-bottom) + 8px)',
        background: 'var(--bg-card)',
        border: '1px solid var(--accent-border)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent-dim)' }}
      >
        <Bell size={18} style={{ color: 'var(--accent)' }} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            Activá las notificaciones
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-mute)' }}>
            Recibí alertas de goles y resultados en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleActivate}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Activar
          </button>
          <button
            onClick={dismiss}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
            style={{ background: 'var(--border-subtle)', color: 'var(--text-mute)' }}
          >
            Ahora no
          </button>
        </div>
      </div>

      <button
        onClick={dismiss}
        className="shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: 'var(--text-mute)' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

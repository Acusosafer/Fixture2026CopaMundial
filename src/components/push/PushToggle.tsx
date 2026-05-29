'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushToggle() {
  const { permission, isSubscribed, isLoading, isSupported, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported || permission === 'unsupported') return null;
  if (permission === 'denied') {
    return (
      <p className="text-xs" style={{ color: 'var(--text-mute)' }}>
        Notificaciones bloqueadas en tu navegador
      </p>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
      style={{
        background: isSubscribed ? 'var(--plasma-dim, rgba(99,102,241,0.12))' : 'var(--border-subtle)',
        border: `1px solid ${isSubscribed ? 'var(--plasma, #6366f1)' : 'rgba(255,255,255,0.06)'}`,
        color: isSubscribed ? 'var(--plasma, #6366f1)' : 'var(--text-mute)',
      }}
    >
      {isLoading ? (
        <span className="animate-spin text-base leading-none">⏳</span>
      ) : (
        <span className="text-base leading-none">{isSubscribed ? '🔔' : '🔕'}</span>
      )}
      {isSubscribed ? 'Notificaciones activas' : 'Activar notificaciones'}
    </button>
  );
}

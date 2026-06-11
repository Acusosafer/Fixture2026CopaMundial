'use client';

import { useState } from 'react';
import { Megaphone, Lock } from 'lucide-react';
import { sendMundialStartNotification } from '@/app/actions/push';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? 'fas2026';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function handleUnlock() {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  async function handleBroadcast() {
    setBroadcasting(true);
    setResult(null);
    const r = await sendMundialStartNotification();
    setBroadcasting(false);
    if (r.ok) {
      setResult(`✓ Enviado a ${r.sent} suscriptor${r.sent === 1 ? '' : 'es'}${r.failed ? ` (${r.failed} fallaron)` : ''}`);
    } else {
      setResult(`✗ ${r.error}`);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={18} style={{ color: 'var(--accent)' }} />
            <span className="font-heading text-xl tracking-widest" style={{ color: 'var(--text)' }}>ADMIN</span>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="PIN de acceso"
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${pinError ? 'var(--live)' : 'var(--border-color)'}`,
              color: 'var(--text)',
            }}
            autoFocus
          />
          {pinError && (
            <p className="text-xs" style={{ color: 'var(--live)' }}>PIN incorrecto</p>
          )}
          <button
            onClick={handleUnlock}
            className="w-full py-3 rounded-2xl text-sm font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Acceder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6 max-w-sm mx-auto">
      <h1 className="font-heading text-3xl tracking-widest" style={{ color: 'var(--text)' }}>
        ADMIN
      </h1>

      <div
        className="rounded-2xl p-4 flex flex-col gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
          Difundir notificación push
        </p>
        <div
          className="rounded-xl px-3 py-3 text-xs"
          style={{ background: 'var(--border-subtle)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-mute)' }}
        >
          <span className="font-bold block mb-0.5" style={{ color: 'var(--text)' }}>
            🏆 ¡HOY EMPIEZA EL MUNDIAL!
          </span>
          México vs Sudáfrica · 16:00 ART · Estadio Ciudad de México
        </div>
        <button
          onClick={handleBroadcast}
          disabled={broadcasting}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          <Megaphone size={16} />
          {broadcasting ? 'Enviando...' : 'Difundir a todos'}
        </button>
        {result && (
          <p className="text-xs text-center font-semibold" style={{ color: result.startsWith('✓') ? '#10F0A0' : 'var(--live)' }}>
            {result}
          </p>
        )}
      </div>
    </div>
  );
}

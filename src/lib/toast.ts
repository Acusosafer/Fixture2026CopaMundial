import { toast } from 'sonner';

// Paleta de toasts según INTERACTIONS.md
// El <Toaster> vive en src/components/shell/Providers.tsx

const base = {
  borderRadius: 'var(--r, 16px)',
  fontSize: '13px',
  color: 'var(--text)',
  fontWeight: '500',
};

export const showToast = {
  // ⚽ Gol de Mi Selección — ember, 5s, top
  goal: (msg: string) =>
    toast(msg, {
      duration: 5000,
      style: { ...base, background: 'var(--ember-dim)', border: '1px solid var(--ember)' },
    }),

  // ⚽ Gol rival — neutro, 3s, top
  rivalGoal: (msg: string) =>
    toast(msg, {
      duration: 3000,
      style: { ...base, background: 'var(--bg-card)', border: '1px solid var(--text-mute)' },
    }),

  // 🟥 Tarjeta roja — red, 4s, top
  redCard: (msg: string) =>
    toast(msg, {
      duration: 4000,
      style: { ...base, background: 'rgba(232,65,62,0.10)', border: '1px solid var(--red)' },
    }),

  // ✅ Clasificación / éxito — lime, 5s, top
  success: (msg: string) =>
    toast(msg, {
      duration: 5000,
      style: { ...base, background: 'rgba(132,204,22,0.10)', border: '1px solid var(--lime)' },
    }),

  // ℹ️ Info general — frost, 3s, bottom
  info: (msg: string) =>
    toast(msg, {
      duration: 3000,
      position: 'bottom-center',
      style: { ...base, background: 'var(--frost-dim, rgba(96,165,250,0.12))', border: '1px solid var(--frost, #60a5fa)' },
    }),

  // ❌ Error de API — red tenue, 5s, bottom
  apiError: (msg: string) =>
    toast(msg, {
      duration: 5000,
      position: 'bottom-center',
      style: { ...base, background: 'rgba(232,65,62,0.08)', border: '1px solid var(--red)' },
    }),
};

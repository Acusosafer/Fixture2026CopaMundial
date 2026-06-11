'use server';

export interface BroadcastResult {
  ok: boolean;
  sent?: number;
  failed?: number;
  error?: string;
}

export async function sendMundialStartNotification(): Promise<BroadcastResult> {
  const secret = process.env.PUSH_INTERNAL_SECRET;
  if (!secret) {
    return { ok: false, error: 'PUSH_INTERNAL_SECRET no configurado' };
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-push-secret': secret,
      },
      body: JSON.stringify({
        title: '🏆 ¡HOY EMPIEZA EL MUNDIAL!',
        body: 'México vs Sudáfrica · 16:00 ART · Estadio Ciudad de México',
        tag: 'mundial-start-2026',
        data: { url: '/partido/1' },
      }),
    });

    const json = await res.json() as { sent?: number; failed?: number; error?: string };

    if (!res.ok) return { ok: false, error: json.error ?? 'Error del servidor' };

    return { ok: true, sent: json.sent ?? 0, failed: json.failed ?? 0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

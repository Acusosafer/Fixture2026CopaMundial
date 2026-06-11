'use server';

import webpush from 'web-push';
import { getAllSubs } from '@/lib/push-store';

export interface BroadcastResult {
  ok: boolean;
  sent?: number;
  failed?: number;
  error?: string;
}

export async function sendMundialStartNotification(): Promise<BroadcastResult> {
  const publicKey  = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return { ok: false, error: 'VAPID keys no configuradas en Vercel' };
  }

  webpush.setVapidDetails('mailto:fernandoacusosa10@gmail.com', publicKey, privateKey);

  const payload = JSON.stringify({
    title: '🏆 ¡HOY EMPIEZA EL MUNDIAL!',
    body: 'México vs Sudáfrica · 16:00 ART · Estadio Ciudad de México',
    tag: 'mundial-start-2026',
    data: { url: '/partido/1' },
  });

  try {
    const subs = await getAllSubs();

    if (subs.length === 0) {
      return { ok: true, sent: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(sub as Parameters<typeof webpush.sendNotification>[0], payload)
      )
    );

    const sent   = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    return { ok: true, sent, failed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

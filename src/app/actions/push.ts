'use server';

import webpush from 'web-push';
import { kv } from '@vercel/kv';

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

  webpush.setVapidDetails(
    'mailto:fernandoacusosa10@gmail.com',
    publicKey,
    privateKey,
  );

  const payload = JSON.stringify({
    title: '🏆 ¡HOY EMPIEZA EL MUNDIAL!',
    body: 'México vs Sudáfrica · 16:00 ART · Estadio Ciudad de México',
    tag: 'mundial-start-2026',
    data: { url: '/partido/1' },
  });

  try {
    const keys = await kv.keys('push:sub:*');

    if (keys.length === 0) {
      return { ok: true, sent: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      keys.map(async (key) => {
        const raw = await kv.get<string>(key);
        if (!raw) return;
        const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
        await webpush.sendNotification(sub, payload);
      })
    );

    const sent   = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    return { ok: true, sent, failed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

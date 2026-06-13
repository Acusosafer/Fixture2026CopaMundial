'use server';

import webpush from 'web-push';
import { getAllSubs, deleteSub, type PushSub } from '@/lib/push-store';

export interface BroadcastResult {
  ok: boolean;
  sent?: number;
  failed?: number;
  removed?: number;
  error?: string;
}

async function broadcast(payload: object): Promise<BroadcastResult> {
  const publicKey  = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return { ok: false, error: 'VAPID keys no configuradas en Vercel' };
  webpush.setVapidDetails('mailto:fernandoacusosa10@gmail.com', publicKey, privateKey);
  try {
    const subs = await getAllSubs() as PushSub[];
    if (subs.length === 0) return { ok: true, sent: 0, failed: 0, removed: 0 };

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(sub.subscription as Parameters<typeof webpush.sendNotification>[0], JSON.stringify(payload))
      )
    );

    let sent = 0;
    let failed = 0;
    let removed = 0;
    const removePromises: Promise<void>[] = [];

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled') {
        sent++;
      } else {
        failed++;
        // 410 Gone = suscripción expirada/revocada → borrar de Supabase
        const statusCode = (r.reason as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          removed++;
          removePromises.push(deleteSub(subs[i].endpoint).catch(() => {}));
        }
      }
    }

    await Promise.all(removePromises);
    return { ok: true, sent, failed, removed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function sendSecondHalfNotification(matchTitle: string, matchId: number): Promise<BroadcastResult> {
  return broadcast({
    title: `⚽ ¡Comienza el 2do tiempo!`,
    body: matchTitle,
    tag: `second-half-${matchId}`,
    data: { url: `/partido/${matchId}` },
  });
}

export async function sendCustomNotification(title: string, body: string, url?: string): Promise<BroadcastResult> {
  if (!title.trim() || !body.trim()) return { ok: false, error: 'Título y mensaje son requeridos' };
  return broadcast({
    title: title.trim(),
    body: body.trim(),
    tag: `custom-${Date.now()}`,
    data: { url: url ?? '/' },
  });
}

export async function sendMundialStartNotification(): Promise<BroadcastResult> {
  return broadcast({
    title: '🏆 ¡HOY EMPIEZA EL MUNDIAL!',
    body: 'México vs Sudáfrica · 16:00 ART · Estadio Ciudad de México',
    tag: 'mundial-start-2026',
    data: { url: '/partido/1' },
  });
}

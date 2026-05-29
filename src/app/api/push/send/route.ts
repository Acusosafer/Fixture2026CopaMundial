import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { kv } from '@vercel/kv';

webpush.setVapidDetails(
  'mailto:fernandoacusosa10@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, string>;
}

// POST /api/push/send — enviar push a todos los suscriptores
// Body: { title, body, tag?, data? }
// Solo accesible con secret interno (x-push-secret header)

export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get('x-push-secret');
  if (secret !== process.env.PUSH_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json() as PushPayload;
  if (!payload?.title || !payload?.body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  // Obtener todas las suscripciones guardadas en KV
  const keys = await kv.keys('push:sub:*');
  if (keys.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const results = await Promise.allSettled(
    keys.map(async (key) => {
      const raw = await kv.get<string>(key);
      if (!raw) return;

      const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
      await webpush.sendNotification(sub, JSON.stringify(payload));
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed });
}

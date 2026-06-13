import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllSubs } from '@/lib/push-store';

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

export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get('x-push-secret');
  if (secret !== process.env.PUSH_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json() as PushPayload;
  if (!payload?.title || !payload?.body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  const subs = await getAllSubs();
  if (subs.length === 0) return NextResponse.json({ sent: 0 });

  const results = await Promise.allSettled(
    subs.map((sub) => webpush.sendNotification(sub.subscription as unknown as Parameters<typeof webpush.sendNotification>[0], JSON.stringify(payload)))
  );

  const sent   = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed });
}

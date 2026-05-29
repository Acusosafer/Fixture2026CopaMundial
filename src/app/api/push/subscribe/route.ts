import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// ── POST /api/push/subscribe — guardar suscripción ────────────────────────────

export async function POST(request: Request): Promise<Response> {
  try {
    const subscription = await request.json() as PushSubscription;
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const key = `push:sub:${Buffer.from(subscription.endpoint).toString('base64').slice(0, 64)}`;
    await kv.set(key, JSON.stringify(subscription), { ex: 60 * 60 * 24 * 90 }); // 90 días

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push] subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ── DELETE /api/push/subscribe — eliminar suscripción ────────────────────────

export async function DELETE(request: Request): Promise<Response> {
  try {
    const { endpoint } = await request.json() as { endpoint: string };
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const key = `push:sub:${Buffer.from(endpoint).toString('base64').slice(0, 64)}`;
    await kv.del(key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push] unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

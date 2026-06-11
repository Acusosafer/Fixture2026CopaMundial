import { NextResponse } from 'next/server';

function kvAvailable() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  const { kv } = await import('@vercel/kv');
  return kv;
}

// ── POST /api/push/subscribe — guardar suscripción ────────────────────────────

export async function POST(request: Request): Promise<Response> {
  if (!kvAvailable()) {
    return NextResponse.json({ error: 'KV no configurado — ver instrucciones en /ajustes' }, { status: 503 });
  }
  try {
    const subscription = await request.json() as PushSubscription;
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    const kv = await getKv();
    const key = `push:sub:${Buffer.from(subscription.endpoint).toString('base64').slice(0, 64)}`;
    await kv.set(key, JSON.stringify(subscription), { ex: 60 * 60 * 24 * 90 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push] subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ── DELETE /api/push/subscribe — eliminar suscripción ────────────────────────

export async function DELETE(request: Request): Promise<Response> {
  if (!kvAvailable()) {
    return NextResponse.json({ ok: true }); // sin KV, nada que borrar
  }
  try {
    const { endpoint } = await request.json() as { endpoint: string };
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }
    const kv = await getKv();
    const key = `push:sub:${Buffer.from(endpoint).toString('base64').slice(0, 64)}`;
    await kv.del(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push] unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

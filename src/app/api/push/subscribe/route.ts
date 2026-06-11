import { NextResponse } from 'next/server';
import { saveSub, deleteSub } from '@/lib/push-store';

export async function POST(request: Request): Promise<Response> {
  try {
    const subscription = await request.json() as { endpoint: string };
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    await saveSub(subscription as object & { endpoint: string });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push] subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const { endpoint } = await request.json() as { endpoint: string };
    if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    await deleteSub(endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push] unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

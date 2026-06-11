import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url   = process.env.SUPABASE_PUSH_URL!;
  const key   = process.env.SUPABASE_PUSH_ANON_KEY!;
  return createClient(url, key);
}

export interface PushSub {
  endpoint: string;
  subscription: object;
}

export async function saveSub(sub: object & { endpoint: string }) {
  const { error } = await getClient()
    .from('push_subscriptions')
    .upsert({ endpoint: sub.endpoint, subscription: sub }, { onConflict: 'endpoint' });
  if (error) throw error;
}

export async function deleteSub(endpoint: string) {
  const { error } = await getClient()
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  if (error) throw error;
}

export async function getAllSubs(): Promise<object[]> {
  const { data, error } = await getClient()
    .from('push_subscriptions')
    .select('subscription');
  if (error) throw error;
  return (data ?? []).map((r) => r.subscription as object);
}

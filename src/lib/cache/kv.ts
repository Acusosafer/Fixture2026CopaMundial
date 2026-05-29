import { kv } from '@vercel/kv';

const memoryCache = new Map<string, { data: unknown; expiry: number }>();

function isKvAvailable(): boolean {
  return Boolean(process.env.KV_REST_API_URL);
}

export async function cached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  // Try to get from cache
  if (isKvAvailable()) {
    const hit = await kv.get<T>(key);
    if (hit !== null && hit !== undefined) return { data: hit, cached: true };
  } else {
    const entry = memoryCache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return { data: entry.data as T, cached: true };
    }
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Store in cache
  if (isKvAvailable()) {
    await kv.set(key, fresh, { ex: ttl });
  } else {
    memoryCache.set(key, { data: fresh, expiry: Date.now() + ttl * 1000 });
  }

  return { data: fresh, cached: false };
}

export async function invalidate(key: string): Promise<void> {
  if (isKvAvailable()) {
    await kv.del(key);
  } else {
    memoryCache.delete(key);
  }
}

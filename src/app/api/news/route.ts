import { NextResponse } from 'next/server';
import { cached } from '@/lib/cache/kv';
import { TTL } from '@/lib/cache/ttls';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  sourceType: 'rss' | 'twitter';
}

interface RssSource {
  url: string;
  name: string;
}

const RSS_SOURCES: RssSource[] = [
  { url: 'https://www.ole.com.ar/rss/ultimas-noticias/', name: 'Olé' },
  { url: 'https://www.tycsports.com/rss/', name: 'TyC Sports' },
  { url: 'https://espndeportes.espn.com/espn/rss/news', name: 'ESPN Deportes' },
  { url: 'https://www.infobae.com/rss/deportes/', name: 'Infobae Deportes' },
];

const FOOTBALL_KEYWORDS = [
  'fútbol', 'futbol', 'football', 'soccer', 'mundial', 'world cup',
  'copa del mundo', 'fifa', 'copa', 'selección', 'seleccion',
  'liga', 'champions', 'gol', 'golazo', 'partido', 'fixture',
  'delantero', 'portero', 'arquero', 'mediocampista', 'defensor',
  'técnico', 'entrenador', 'dt ', 'convocatoria', 'amistoso',
  'eliminatoria', 'primera división', 'primera division',
  'premier league', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
  'champions league', 'libertadores', 'sudamericana',
  'messi', 'ronaldo', 'mbappé', 'mbappe', 'haaland', 'neymar', 'scaloni',
  'penal', 'arbitro', 'árbitro', 'tarjeta', 'expulsión', 'expulsion',
  'offside', 'fuera de juego', 'corner', 'tiro libre',
  'octavos', 'cuartos', 'semifinal', 'final', 'grupo ',
  'albiceleste', 'canarinha', 'la roja', 'azzurri', 'oranje',
];

function isFootballItem(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return FOOTBALL_KEYWORDS.some((kw) => text.includes(kw));
}

// ─── RSS ───────────────────────────────────────────────────

function extractTagContent(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i').exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  if (plainMatch) return plainMatch[1].trim();
  return '';
}

function parseItems(xml: string, sourceName: string): NewsItem[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const items: NewsItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTagContent(itemXml, 'title');
    const link = extractTagContent(itemXml, 'link');
    const pubDate = extractTagContent(itemXml, 'pubDate');
    const description = extractTagContent(itemXml, 'description');

    if (!title || !link) continue;

    const raw = `${sourceName}:${link}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
    }
    const id = `${Math.abs(hash).toString(36)}-${raw.length.toString(36)}`;

    if (!isFootballItem(title, description)) continue;

    items.push({ id, title, link, pubDate, description, source: sourceName, sourceType: 'rss' });
  }

  return items;
}

async function fetchRssFeed(source: RssSource): Promise<NewsItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'Mundial2026-App/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return parseItems(xml, source.name);
  } catch {
    return [];
  }
}

// ─── Twitter / X — Gastón Edul (@gastonedul) ───────────────

const EDUL_USERNAME = 'gastonedul';
const TWITTER_API = 'https://api.twitter.com/2';

async function getEdulUserId(bearerToken: string): Promise<string | null> {
  return cached<string | null>(
    'twitter:userid:gastonedul',
    60 * 60 * 24, // 24h — el ID no cambia
    async () => {
      const res = await fetch(`${TWITTER_API}/users/by/username/${EDUL_USERNAME}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const json = await res.json() as { data?: { id: string } };
      return json.data?.id ?? null;
    }
  ).then((r) => r.data);
}

// Palabras clave para filtrar tweets sobre selecciones y mundial
const SELECCION_KEYWORDS = [
  // Torneo
  'mundial', 'world cup', 'copa del mundo', 'fifa', 'eliminatori',
  // Selecciones genérico
  'selección', 'seleccion', 'selecciones', 'albiceleste', 'la tri',
  'canarinha', 'la roja', 'mannschaft', 'celeste', 'oranje', 'azzurri',
  // Argentina
  'argentina', 'scaloni', 'afa',
  // Jugadores AR más mencionados por Edul
  'messi', 'de paul', 'otamendi', 'romero', 'lautaro', 'mac allister',
  'enzo fernández', 'di maría', 'molina', 'tagliafico', 'acuña', 'paredes',
  'dybala', 'almada', 'pezzella', 'fernández',
  // Contexto de selecciones
  'convocatoria', 'convocado', 'concentración', 'dt ', 'técnico',
  'entrenamiento', 'amistoso', 'eliminatoria', 'grupo ',
  // Primicias típicas de Edul
  'primicia', 'confirmado', 'viaja', 'lista', 'baja ', 'lesión', 'no llega',
];

function isSoccerNationalTeamTweet(text: string): boolean {
  const lower = text.toLowerCase();
  return SELECCION_KEYWORDS.some((kw) => lower.includes(kw));
}

async function fetchEdulTweets(bearerToken: string): Promise<NewsItem[]> {
  try {
    const userId = await getEdulUserId(bearerToken);
    if (!userId) return [];

    const params = new URLSearchParams({
      max_results: '50', // traemos más para poder filtrar
      'tweet.fields': 'created_at,text',
      exclude: 'retweets,replies',
    });

    const res = await fetch(`${TWITTER_API}/users/${userId}/tweets?${params}`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const json = await res.json() as { data?: Array<{ id: string; text: string; created_at: string }> };
    const tweets = json.data ?? [];

    return tweets
      .map((t) => ({
        id: `tweet-${t.id}`,
        title: t.text.replace(/https:\/\/t\.co\/\S+/g, '').trim(),
        link: `https://x.com/${EDUL_USERNAME}/status/${t.id}`,
        pubDate: t.created_at,
        description: '',
        source: 'Gastón Edul · X',
        sourceType: 'twitter' as const,
      }));
  } catch {
    return [];
  }
}

// ─── Merge ─────────────────────────────────────────────────

async function fetchAllNews(): Promise<NewsItem[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  const rssPromises = RSS_SOURCES.map(fetchRssFeed);
  const twitterPromise = bearerToken ? fetchEdulTweets(bearerToken) : Promise.resolve([]);

  const results = await Promise.allSettled([...rssPromises, twitterPromise]);
  const allItems: NewsItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  allItems.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  return allItems;
}

// ─── Route ─────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  try {
    const result = await cached<NewsItem[]>('news:all', TTL.NEWS, fetchAllNews);

    return NextResponse.json({
      data: result.data,
      cached: result.cached,
      ttl: TTL.NEWS,
      sources: {
        rss: RSS_SOURCES.map((s) => s.name),
        twitter: process.env.TWITTER_BEARER_TOKEN ? [EDUL_USERNAME] : [],
      },
      ...(result.data.length === 0 && { fallback: true }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message, code: 500 }, { status: 500 });
  }
}

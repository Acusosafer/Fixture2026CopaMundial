'use client';

import { useState, useMemo } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Search, X } from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import type { NewsItem } from '@/app/api/news/route';

function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ── Filtros disponibles ───────────────────────────────────────────────────────

type FilterKey = 'todos' | 'Olé' | 'TyC Sports' | 'ESPN Deportes' | 'Infobae Deportes' | 'edul';

const FILTERS: { key: FilterKey; label: string; twitter?: boolean }[] = [
  { key: 'todos',            label: 'Todos' },
  { key: 'Olé',             label: 'Olé' },
  { key: 'ESPN Deportes',   label: 'ESPN' },
  { key: 'TyC Sports',      label: 'TyC Sports' },
  { key: 'Infobae Deportes',label: 'Infobae' },
  { key: 'edul',            label: '@gastonedul', twitter: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeDate(pubDate: string): string {
  if (!pubDate) return '';
  const date = new Date(pubDate);
  if (isNaN(date.getTime())) return '';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH} h`;
  if (diffD === 1) return 'ayer';
  if (diffD < 7) return `hace ${diffD} días`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 animate-pulse"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2">
        <div className="rounded-full h-4 w-16" style={{ background: 'var(--border-color)' }} />
        <div className="rounded h-3 w-12" style={{ background: 'var(--border-subtle)' }} />
      </div>
      <div className="rounded h-4 w-full" style={{ background: 'var(--border-color)' }} />
      <div className="rounded h-4 w-4/5" style={{ background: 'var(--border-subtle)' }} />
      <div className="rounded h-3 w-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
    </div>
  );
}

// ── Article card ──────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: NewsItem }) {
  const isTwitter = article.sourceType === 'twitter';
  const title = cleanText(article.title);
  const description = cleanText(article.description);
  const relDate = formatRelativeDate(article.pubDate);

  return (
    <article className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: isTwitter ? 'rgba(29,161,242,0.05)' : 'var(--bg-card)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: isTwitter ? '1px solid rgba(29,161,242,0.2)' : '1px solid rgba(255,255,255,0.08)',
      }}>
      <div className="flex items-center gap-2 flex-wrap">
        {isTwitter ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(29,161,242,0.15)', border: '1px solid rgba(29,161,242,0.3)', color: '#1DA1F2' }}>
            <XIcon size={9} />
            @gastonedul
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
            {article.source}
          </span>
        )}
        {relDate && (
          <span className="text-[11px]" style={{ color: 'var(--text-mute)' }}>{relDate}</span>
        )}
      </div>
      <h2 className="text-sm font-bold leading-snug" style={{ color: 'var(--text)' }}>{title}</h2>
      {description && !isTwitter && (
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-dim)' }}>{description}</p>
      )}
      <div className="flex items-center justify-end">
        <a href={article.link} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: isTwitter ? '#1DA1F2' : 'var(--accent)' }}>
          {isTwitter ? 'Ver en X' : 'Leer más'}
          <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NoticiasPage() {
  const { news, isLoading, isFetching, error, refetch } = useNews();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = news;

    if (activeFilter !== 'todos') {
      if (activeFilter === 'edul') {
        list = list.filter((n) => n.sourceType === 'twitter');
      } else {
        list = list.filter((n) => n.source === activeFilter);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) =>
        n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [news, activeFilter, search]);

  // Count por filtro para mostrar en chip
  function countFor(key: FilterKey): number {
    if (key === 'todos') return news.length;
    if (key === 'edul') return news.filter((n) => n.sourceType === 'twitter').length;
    return news.filter((n) => n.source === key).length;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Newspaper size={22} style={{ color: 'var(--accent)' }} strokeWidth={2} />
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Noticias
          </h1>
          {!isLoading && news.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border-subtle)', color: 'var(--text-mute)' }}>
              {filtered.length}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'var(--border-subtle)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-mute)' }}
          aria-label="Actualizar noticias"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-mute)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar... ej: Messi, Argentina"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text)',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-mute)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filtros clickeables */}
      {!isLoading && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {FILTERS.map(({ key, label, twitter }) => {
            const count = countFor(key);
            if (count === 0 && key !== 'todos') return null;
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                style={{
                  background: isActive
                    ? twitter ? 'rgba(29,161,242,0.2)' : 'var(--accent-dim)'
                    : 'var(--border-subtle)',
                  border: isActive
                    ? twitter ? '1px solid rgba(29,161,242,0.5)' : '1px solid var(--accent-border)'
                    : '1px solid rgba(255,255,255,0.06)',
                  color: isActive
                    ? twitter ? '#1DA1F2' : 'var(--accent)'
                    : 'var(--text-dim)',
                }}
              >
                {twitter && <XIcon size={9} />}
                {label}
                {count > 0 && (
                  <span className="opacity-60 text-[10px]">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Contenido */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
          style={{ background: 'rgba(255,59,92,0.05)', border: '1px solid rgba(255,59,92,0.15)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--live)' }}>Error al cargar noticias</p>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{error.message}</p>
          <button onClick={() => refetch()}
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'var(--border-color)', color: 'var(--text)' }}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Search size={40} style={{ color: 'var(--text-mute)' }} strokeWidth={1} />
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            {search ? `Sin resultados para "${search}"` : 'Sin noticias en esta fuente'}
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ background: 'var(--border-color)', color: 'var(--text)' }}>
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

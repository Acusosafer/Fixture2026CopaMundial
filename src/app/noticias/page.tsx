'use client';

import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import { useNews } from '@/hooks/useNews';
import type { NewsItem } from '@/app/api/news/route';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatRelativeDate(pubDate: string): string {
  if (!pubDate) return '';
  const date = new Date(pubDate);
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// â”€â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ArticleSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 animate-pulse"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-full h-4 w-16" style={{ background: 'var(--border-color)' }} />
        <div className="rounded h-3 w-12" style={{ background: 'var(--border-subtle)' }} />
      </div>
      <div className="rounded h-4 w-full" style={{ background: 'var(--border-color)' }} />
      <div className="rounded h-4 w-4/5" style={{ background: 'var(--border-subtle)' }} />
      <div className="rounded h-3 w-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
      <div className="rounded h-3 w-3/4" style={{ background: 'rgba(255,255,255,0.03)' }} />
    </div>
  );
}

// â”€â”€â”€ Article card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ArticleCard({ article }: { article: NewsItem }) {
  const isTwitter = article.sourceType === 'twitter';
  const title = cleanText(article.title);
  const description = cleanText(article.description);
  const relDate = formatRelativeDate(article.pubDate);

  return (
    <article
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: isTwitter
          ? 'rgba(29,161,242,0.05)'
          : 'var(--bg-card)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: isTwitter
          ? '1px solid rgba(29,161,242,0.2)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Source + date */}
      <div className="flex items-center gap-2 flex-wrap">
        {isTwitter ? (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: 'rgba(29,161,242,0.15)',
              border: '1px solid rgba(29,161,242,0.3)',
              color: '#1DA1F2',
            }}
          >
            <XIcon size={9} />
            @gastonedul
          </span>
        ) : (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
            }}
          >
            {article.source}
          </span>
        )}
        {relDate && (
          <span className="text-[11px]" style={{ color: 'var(--text-mute)' }}>
            {relDate}
          </span>
        )}
      </div>

      {/* Title */}
      <h2
        className="text-sm font-bold leading-snug"
        style={{ color: 'var(--text)' }}
      >
        {title}
      </h2>

      {/* Description (RSS only) */}
      {description && !isTwitter && (
        <p
          className="text-xs leading-relaxed line-clamp-3"
          style={{ color: 'var(--text-dim)' }}
        >
          {description}
        </p>
      )}

      {/* Link */}
      <div className="flex items-center justify-end">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: isTwitter ? '#1DA1F2' : 'var(--accent)' }}
        >
          {isTwitter ? 'Ver en X' : 'Leer más'}
          <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function NoticiasPage() {
  const { news, isLoading, error, refetch } = useNews();

  const twitterCount = news.filter((n) => n.sourceType === 'twitter').length;
  const rssCount = news.filter((n) => n.sourceType === 'rss').length;

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Newspaper size={22} style={{ color: 'var(--accent)' }} strokeWidth={2} />
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Noticias
            </h1>
          </div>
          {!isLoading && news.length > 0 && (
            <p className="text-xs pl-8" style={{ color: 'var(--text-mute)' }}>
              {rssCount > 0 && `${rssCount} artículos`}
              {rssCount > 0 && twitterCount > 0 && ' · '}
              {twitterCount > 0 && `${twitterCount} tweets de @gastonedul`}
            </p>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'var(--border-subtle)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-mute)',
          }}
          aria-label="Actualizar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Sources chips */}
      {!isLoading && news.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['Olé', 'TyC Sports', 'ESPN FC'].map((src) => {
            const count = news.filter((n) => n.source === src).length;
            if (count === 0) return null;
            return (
              <span
                key={src}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  background: 'var(--border-subtle)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-dim)',
                }}
              >
                {src} · {count}
              </span>
            );
          })}
          {twitterCount > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{
                background: 'rgba(29,161,242,0.08)',
                border: '1px solid rgba(29,161,242,0.2)',
                color: '#1DA1F2',
              }}
            >
              <XIcon size={10} />
              @gastonedul · {twitterCount}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div
          className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
          style={{
            background: 'rgba(255,59,92,0.05)',
            border: '1px solid rgba(255,59,92,0.15)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--live)' }}>
            Error al cargar noticias
          </p>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'var(--border-color)', color: 'var(--text)' }}
          >
            Reintentar
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Newspaper size={40} style={{ color: 'var(--text-mute)' }} strokeWidth={1} />
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Sin noticias disponibles
          </p>
          <p className="text-xs text-center" style={{ color: 'var(--text-mute)' }}>
            Verificá la conexión a internet o configurá las fuentes RSS
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {news.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

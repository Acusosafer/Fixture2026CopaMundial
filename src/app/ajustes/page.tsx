'use client';

import { Bell, BellOff, Sun, Moon, Globe, Info, Star, ChevronRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import { usePreferences } from '@/store/preferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1" style={{ color: 'var(--text-mute)' }}>
        {title}
      </p>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  description,
  right,
  onClick,
  href,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  iconColor?: string;
}) {
  const content = (
    <div
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] active:bg-white/[0.05]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: onClick || href ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--border-subtle)' }}
      >
        <Icon size={16} style={{ color: iconColor ?? 'var(--text-dim)' }} strokeWidth={1.8} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
        {description && (
          <span className="text-xs" style={{ color: 'var(--text-mute)' }}>{description}</span>
        )}
      </div>
      {right ?? (href && <ChevronRight size={16} style={{ color: 'var(--text-mute)' }} />)}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: on ? 'var(--accent)' : 'var(--border-color)' }}
      aria-checked={on}
      role="switch"
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AjustesPage() {
  const { theme, toggleTheme } = usePreferences();
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="font-heading text-4xl tracking-wide" style={{ color: 'var(--text)' }}>
          AJUSTES
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-dim)' }}>
          Preferencias de la app
        </p>
      </div>

      {/* Apariencia */}
      <Section title="Apariencia">
        <Row
          icon={isDark ? Moon : Sun}
          label={isDark ? 'Modo oscuro' : 'Modo claro'}
          description="Cambia entre tema claro y oscuro"
          iconColor={isDark ? '#A78BFA' : '#FBBF24'}
          right={<Toggle on={isDark} onChange={toggleTheme} />}
        />
      </Section>

      {/* Notificaciones */}
      <Section title="Notificaciones">
        {!isSupported || permission === 'unsupported' ? (
          <Row
            icon={BellOff}
            label="No disponible"
            description="Tu navegador no soporta notificaciones push"
            iconColor="var(--text-mute)"
          />
        ) : permission === 'denied' ? (
          <>
            <Row
              icon={BellOff}
              label="Notificaciones bloqueadas"
              description="El navegador bloqueó los permisos"
              iconColor="var(--live)"
            />
            <div className="px-4 pb-4 pt-3 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mute)' }}>
                Tocá el{' '}
                <strong style={{ color: 'var(--text-dim)' }}>🔒 candado</strong> en la barra del navegador →{' '}
                <strong style={{ color: 'var(--text-dim)' }}>Permisos del sitio</strong> →{' '}
                <strong style={{ color: 'var(--text-dim)' }}>Notificaciones → Permitir</strong>.
                {' '}Luego tocá Reintentar.
              </p>
              <button
                onClick={subscribe}
                disabled={isLoading}
                className="py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
              >
                {isLoading ? 'Verificando...' : 'Reintentar'}
              </button>
            </div>
          </>
        ) : (
          <Row
            icon={isSubscribed ? Bell : BellOff}
            label={isSubscribed ? 'Notificaciones activas' : 'Notificaciones desactivadas'}
            description={isSubscribed ? 'Recibís alertas de goles y resultados' : 'Activá para recibir alertas de goles'}
            iconColor={isSubscribed ? 'var(--accent)' : 'var(--text-mute)'}
            right={
              <Toggle
                on={isSubscribed && !isLoading}
                onChange={isLoading ? () => {} : (isSubscribed ? unsubscribe : subscribe)}
              />
            }
          />
        )}
      </Section>

      {/* Compartir */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Mundial 2026',
              text: '🏆 Seguí el Mundial FIFA 2026 en tiempo real — fixture, grupos, resultados y más.',
              url: 'https://fixture2026-copamundial.vercel.app',
            });
          } else {
            navigator.clipboard?.writeText('https://fixture2026-copamundial.vercel.app');
          }
        }}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all active:scale-[0.98]"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
        }}
      >
        <Share2 size={18} strokeWidth={2} />
        <div className="flex flex-col items-start flex-1">
          <span className="text-sm font-bold">Compartir app</span>
          <span className="text-xs opacity-75">Mandala por WhatsApp, Instagram o donde quieras</span>
        </div>
        <ChevronRight size={16} className="opacity-60" />
      </button>

      {/* Mi equipo */}
      <Section title="Mi Selección">
        <Row
          icon={Star}
          label="Elegir mi equipo favorito"
          description="Seguí a tu selección en la home"
          iconColor="#FBBF24"
          href="/seleccion"
        />
      </Section>

      {/* Acerca de */}
      <Section title="Acerca de">
        <Row
          icon={Globe}
          label="Mundial FIFA 2026"
          description="USA · Canada · Mexico — 11 jun al 19 jul 2026"
          iconColor="#60A5FA"
        />
        <Row
          icon={Info}
          label="FAS Analytics"
          description="v1.0.0 · Desarrollado por FAS Analytics"
          iconColor="var(--accent)"
        />
      </Section>

      {/* Datos */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-mute)' }}>
          Los datos de partidos se actualizan cada 30 segundos durante el torneo.
          Las noticias se refrescan cada 5 minutos. Los scores en vivo requieren conexión activa.
        </p>
      </div>
    </div>
  );
}

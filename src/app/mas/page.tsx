import Link from 'next/link';
import { MapPin, BookOpen, Star, Settings, ChevronRight, GitBranch } from 'lucide-react';

export const metadata = {
  title: 'Más · Mundial 2026',
};

interface MenuCard {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  active: boolean;
  accent?: boolean;
}

const menuItems: MenuCard[] = [
  {
    icon: GitBranch,
    title: 'Cruces',
    description: 'Cuadro de eliminación directa del torneo',
    href: '/bracket',
    active: true,
  },
  {
    icon: MapPin,
    title: 'Sedes',
    description: '16 estadios en 3 países sede del torneo',
    href: '/sedes',
    active: true,
  },
  {
    icon: BookOpen,
    title: 'Histórico',
    description: 'Todos los mundiales desde 1930 hasta 2022',
    href: '/historico',
    active: true,
  },
  {
    icon: Star,
    title: 'Mi Selección',
    description: 'Personalizá tu equipo favorito',
    href: '/seleccion',
    active: true,
    accent: true,
  },
  {
    icon: Settings,
    title: 'Configuración',
    description: 'Tema, notificaciones y preferencias',
    href: '/ajustes',
    active: true,
  },
];

function MenuCard({ item }: { item: MenuCard }) {
  const Icon = item.icon;

  const card = (
    <div
      className="flex items-center gap-4 rounded-2xl px-4 py-4 transition-all active:scale-[0.98]"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: item.accent
          ? '1px solid var(--accent-border)'
          : '1px solid var(--border-color)',
        opacity: item.active ? 1 : 0.55,
        cursor: item.active ? 'pointer' : 'default',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: item.accent ? 'var(--accent-dim)' : 'var(--border-subtle)' }}
      >
        <Icon
          size={22}
          style={{ color: item.accent ? 'var(--accent)' : 'var(--text-dim)' }}
          strokeWidth={1.8}
        />
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-semibold" style={{ color: item.accent ? 'var(--accent)' : 'var(--text)' }}>
          {item.title}
        </span>
        <span className="text-xs truncate" style={{ color: 'var(--text-mute)' }}>
          {item.description}
        </span>
      </div>

      <ChevronRight size={16} style={{ color: 'var(--text-mute)' }} strokeWidth={2} />
    </div>
  );

  if (!item.active || item.href === '#') return card;

  return (
    <Link href={item.href} className="block hover:scale-[1.01] transition-transform">
      {card}
    </Link>
  );
}

export default function MasPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <div className="pt-2">
        <h1 className="font-heading text-4xl tracking-wide" style={{ color: 'var(--text)' }}>
          MAS
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-dim)' }}>
          Explora todo lo que tiene la app
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <MenuCard key={item.title} item={item} />
        ))}
      </div>

      <div
        className="rounded-2xl px-4 py-4 flex flex-col items-center gap-1"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-xs font-semibold" style={{ color: 'var(--text-mute)' }}>
          v1.0.0 · Mundial 2026
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-mute)' }}>
          FIFA World Cup 2026 — USA · Canada · Mexico
        </p>
      </div>
    </div>
  );
}

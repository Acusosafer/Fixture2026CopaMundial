'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

// ── Animated custom icons ───────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinejoin="round"
        fill="currentColor" fillOpacity={active ? 0.15 : 0}
      />
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" />
    </motion.svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const [day, setDay] = useState(12);
  useEffect(() => {
    if (!active) return;
    const days = [1, 5, 12, 19, 26, 30];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % days.length; setDay(days[i]); }, 400);
    return () => clearInterval(t);
  }, [active]);
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}
        fill="currentColor" fillOpacity={active ? 0.1 : 0} />
      <path d="M3 9h18" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" />
      <text x="12" y="18.5" textAnchor="middle" fontSize="7" fontWeight="bold"
        fill="currentColor" fontFamily="system-ui">{day}</text>
    </svg>
  );
}

function GroupIcon({ active }: { active: boolean }) {
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      animate={active ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.35 }}
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}
        fill="currentColor" fillOpacity={active ? 0.12 : 0} />
      <rect x="13" y="3" width="8" height="8" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}
        fill="currentColor" fillOpacity={active ? 0.12 : 0} />
      <rect x="3" y="13" width="8" height="8" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}
        fill="currentColor" fillOpacity={active ? 0.12 : 0} />
      <rect x="13" y="13" width="8" height="8" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}
        fill="currentColor" fillOpacity={active ? 0.12 : 0} />
    </motion.svg>
  );
}

function NewsIcon({ active }: { active: boolean }) {
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      animate={active ? { y: [0, -2, 0] } : {}}
      transition={{ duration: 0.4, repeat: active ? 1 : 0 }}
    >
      <rect x="3" y="3" width="18" height="18" rx="2"
        stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}
        fill="currentColor" fillOpacity={active ? 0.1 : 0} />
      <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" />
    </motion.svg>
  );
}

// ── Nav items ───────────────────────────────────────────────

const navItems = [
  { href: '/',         label: 'Home',     Icon: HomeIcon },
  { href: '/fixture',  label: 'Fixture',  Icon: CalendarIcon },
  { href: '/grupos',   label: 'Grupos',   Icon: GroupIcon },
  { href: '/noticias', label: 'Noticias', Icon: NewsIcon },
  { href: '/mas',      label: 'Mas',      Icon: null },  // uses lucide icon
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 glass-nav"
      style={{
        borderTop: '1px solid var(--border-color)',
        height: 'calc(4rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navegación principal"
    >
      {navItems.map(({ href, label, Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors"
            style={{ color: isActive ? 'var(--accent)' : 'var(--text-dim)' }}
            aria-current={isActive ? 'page' : undefined}
          >
            {Icon ? (
              <Icon active={isActive} />
            ) : (
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <MoreHorizontal size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </motion.div>
            )}
            <span className="text-[10px] font-semibold" translate="no">{label}</span>
            {isActive && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute -top-0.5 w-8 h-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

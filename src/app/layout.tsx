import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Anton } from 'next/font/google';
import { Providers } from '@/components/shell/Providers';
import { TopBar } from '@/components/shell/TopBar';
import { BottomNav } from '@/components/shell/BottomNav';
import { ThemeSync } from '@/components/shell/ThemeSync';
import { SplashScreen } from '@/components/shell/SplashScreen';
import { ServiceWorkerRegistrar } from '@/components/shell/ServiceWorkerRegistrar';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const anton = Anton({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0D1B2A' },
    { media: '(prefers-color-scheme: light)', color: '#F5F2FF' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Mundial 2026',
  description: 'Seguí el Mundial FIFA 2026 en tiempo real. Fixture, grupos, resultados y más.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mundial 2026',
  },
  openGraph: {
    title: 'Mundial 2026',
    description: 'Fixture, grupos y resultados del Mundial FIFA 2026.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${geistMono.variable} ${anton.variable} dark`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans antialiased"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <Providers>
          <ServiceWorkerRegistrar />
          <ThemeSync />
          <SplashScreen />
          <TopBar />
          <main
            className="pt-14"
            style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
          >
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

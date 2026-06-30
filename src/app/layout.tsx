import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Anton } from 'next/font/google';
import { Providers } from '@/components/shell/Providers';
import { TopBar } from '@/components/shell/TopBar';
import { BottomNav } from '@/components/shell/BottomNav';
import { ThemeSync } from '@/components/shell/ThemeSync';
import { SplashScreen } from '@/components/shell/SplashScreen';
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
  metadataBase: new URL('https://fixture2026-copamundial.vercel.app'),
  title: 'Mundial 2026',
  description: 'Seguí el Mundial FIFA 2026 en tiempo real. Fixture, grupos, resultados y más.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mundial 2026',
    startupImage: '/icon-512.png',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Mundial 2026',
    description: 'Fixture, grupos y resultados del Mundial FIFA 2026.',
    type: 'website',
    images: [{ url: '/logowhatsapp.png', width: 1200, height: 630, alt: 'Mundial 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mundial 2026',
    description: 'Fixture, grupos y resultados del Mundial FIFA 2026.',
    images: ['/logowhatsapp.png'],
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
          <ThemeSync />
          <SplashScreen />
          <TopBar />
          <main
            className="pt-14"
            style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
          >
            {children}
            <footer className="text-center py-3 px-4" style={{ color: 'var(--text-mute)', fontSize: '11px' }}>
              Creado por <span style={{ fontWeight: 600 }}>FAS Analytics</span>
            </footer>
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

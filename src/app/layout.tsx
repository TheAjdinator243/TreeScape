import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { env } from '@/lib/env';
import { t } from '@/lib/strings';

import './globals.css';

const display = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const sans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${t.site.name} — ${t.site.tagline}`,
    template: `%s · ${t.site.name}`,
  },
  description: t.site.description,
  keywords: [
    'TreeScape',
    'vila',
    'apartman',
    'smještaj',
    'najam kuće',
    'odmor u prirodi',
    'rezervacija',
    'Bosna i Hercegovina',
  ],
  openGraph: {
    type: 'website',
    locale: 'bs_BA',
    siteName: t.site.name,
    title: `${t.site.name} — ${t.site.tagline}`,
    description: t.site.description,
    url: env.siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${t.site.name} — ${t.site.tagline}`,
    description: t.site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#1f4436',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Bez JavaScripta nema ni animacije pojavljivanja — sadržaj se
            mora vidjeti odmah, a ne ostati na opacity: 0. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { JsonLd } from '@/components/seo/JsonLd';
import { WEBSITE_JSON_LD } from '@/lib/jsonld';
import { SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://armanparsa.earth'),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_GB',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f8f4ef',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Manual preloads: Next.js only auto-preloads next/font fonts, not the
  // @font-face files declared in globals.css.
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preload" as="font" href="/fonts/Lyon_Regular.ttf" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" as="font" href="/fonts/SuisseIntl_Light.ttf" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="bg-paper text-ink antialiased">
        {/* Pre-hydration: skip the intro overlay if it has already played this session. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('introSeen'))document.documentElement.classList.add('intro-seen')}catch(e){}",
          }}
        />
        <JsonLd data={WEBSITE_JSON_LD} />
        {children}
      </body>
    </html>
  );
}

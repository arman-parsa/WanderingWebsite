import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "ARMAN'S WANDERINGS",
    template: "%s — ARMAN'S WANDERINGS",
  },
  description: 'A personal archive of written and visual media capturing stories around the earth',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://armanparsa.earth'),
  openGraph: {
    title: "ARMAN'S WANDERINGS",
    description: 'A personal archive of written and visual media capturing stories around the earth',
    siteName: "ARMAN'S WANDERINGS",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="bg-paper text-ink antialiased">
        {/* Pre-hydration: skip the intro overlay if it has already played this session. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('introSeen'))document.documentElement.classList.add('intro-seen')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}

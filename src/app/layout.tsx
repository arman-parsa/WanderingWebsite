import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Wandering Website',
    template: '%s — Wandering Website',
  },
  description: 'A personal editorial website: travel writing, photography, and mixed media.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full w-full flex-col bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}

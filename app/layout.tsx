import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/footer/site-footer';

export const metadata: Metadata = {
  title: {
    template: '%s | Gaṇaka',
    default: 'Gaṇaka — Jyotiṣa Calculation & Research',
  },
  description:
    'A modern platform being built around astronomical calculation, traditional Jyotiṣa methods, and traceable classical sources.',
  keywords: [
    'Jyotiṣa',
    'Jyotish',
    'Vedic Astrology',
    'Astronomical Calculation',
    'Ephemeris',
    'Pañcāṅga',
    'Ayanāṃśa',
    'Classical Sanskrit Texts',
    'Varāhamihira',
    'Parāśara',
  ],
  openGraph: {
    title: 'Gaṇaka — Jyotiṣa Calculation & Research',
    description:
      'A modern platform being built around astronomical calculation, traditional Jyotiṣa methods, and traceable classical sources.',
    type: 'website',
    siteName: 'Gaṇaka',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaṇaka — Jyotiṣa Calculation & Research',
    description:
      'A modern platform being built around astronomical calculation, traditional Jyotiṣa methods, and traceable classical sources.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#F4F0E7] text-[#171614] font-sans antialiased selection:bg-[#E6DCCE] selection:text-[#8B2F0B]"
      >
        <SiteHeader />
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}


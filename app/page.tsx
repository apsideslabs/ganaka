import React from 'react';
import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';

export const metadata: Metadata = {
  title: 'Gaṇaka — Classical Jyotiṣa Calculation & Ephemeris Workstation',
  description:
    'High-precision astronomical calculation engine with VSOP87 ephemerides, authentic Parāśari & Jaimini mechanics, 70,000 towns and 550,000 Indian places, and auditable classical manuscripts.',
  openGraph: {
    title: 'Gaṇaka — Classical Jyotiṣa Calculation & Ephemeris Workstation',
    description:
      'High-precision astronomical calculation engine with VSOP87 ephemerides, authentic Parāśari & Jaimini mechanics, 70,000 towns and 550,000 Indian places, and auditable classical manuscripts.',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeView />;
}

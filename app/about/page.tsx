import React from 'react';
import type { Metadata } from 'next';
import { AboutView } from '@/components/about/AboutView';

export const metadata: Metadata = {
  title: 'Gaṇaka — About',
  description:
    'About Gaṇaka: A modern software environment for studying, calculating, and inspecting traditional Jyotiṣa systems with mathematical rigor and source transparency.',
  openGraph: {
    title: 'Gaṇaka — About',
    description:
      'About Gaṇaka: A modern software environment for studying, calculating, and inspecting traditional Jyotiṣa systems with mathematical rigor and source transparency.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutView />;
}

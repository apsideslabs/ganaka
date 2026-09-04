import React from 'react';
import type { Metadata } from 'next';
import { ResearchView } from '@/components/research/ResearchView';

export const metadata: Metadata = {
  title: 'Gaṇaka — Research',
  description:
    'The research layer connects calculations with their textual and historical sources.',
  openGraph: {
    title: 'Gaṇaka — Research',
    description:
      'The research layer connects calculations with their textual and historical sources.',
    type: 'website',
  },
};

export default function ResearchPage() {
  return <ResearchView />;
}

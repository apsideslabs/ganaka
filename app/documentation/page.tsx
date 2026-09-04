import React from 'react';
import type { Metadata } from 'next';
import { DocumentationView } from '@/components/documentation/DocumentationView';

export const metadata: Metadata = {
  title: 'Gaṇaka — Documentation',
  description:
    'Documentation and specifications for the Gaṇaka Jyotiṣa Calculation & Research platform.',
  openGraph: {
    title: 'Gaṇaka — Documentation',
    description:
      'Documentation and specifications for the Gaṇaka Jyotiṣa Calculation & Research platform.',
    type: 'website',
  },
};

export default function DocumentationPage() {
  return <DocumentationView />;
}

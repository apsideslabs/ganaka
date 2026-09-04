import React from 'react';
import { GanakaLoadingDial } from '@/components/ui/GanakaLoadingDial';

export default function RootLoading() {
  return (
    <GanakaLoadingDial
      fullScreen
      title="Gaṇaka Astronomical Engine"
      subtitle="Loading Computational Ephemeris & Jyotiṣa Matrices..."
    />
  );
}

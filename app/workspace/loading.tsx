import React from 'react';
import { GanakaLoadingDial } from '@/components/ui/GanakaLoadingDial';

export default function WorkspaceLoading() {
  return (
    <GanakaLoadingDial
      fullScreen
      title="Gaṇaka Calculation Engine"
      subtitle="Initializing Planetary Harmonics & VSOP87 Ephemeris..."
    />
  );
}

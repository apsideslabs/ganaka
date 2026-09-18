import React from 'react';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';

export default function WorkspaceLoading() {
  return (
    <CelestialArmillaryLoading
      fullScreen
      title="Gaṇaka Calculation Engine"
      subtitle="Initializing Planetary Harmonics & VSOP87 Ephemeris..."
    />
  );
}

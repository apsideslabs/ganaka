import React from 'react';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';

export default function WorkspaceLoading() {
  return (
    <CelestialArmillaryLoading
      fullScreen
      title="Gaṇaka Calculation Engine"
      subtitle="Computing sidereal positions"
    />
  );
}

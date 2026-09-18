import React from 'react';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';

export default function PanchangaLoading() {
  return (
    <CelestialArmillaryLoading
      fullScreen
      title="Gaṇaka Calendrical Engine"
      subtitle="Calculating Precision Drik Pañcāṅga & Solar Ephemeris..."
    />
  );
}

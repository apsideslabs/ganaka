import React from 'react';
import { GanakaLoadingDial } from '@/components/ui/GanakaLoadingDial';

export default function PanchangaLoading() {
  return (
    <GanakaLoadingDial
      fullScreen
      title="Gaṇaka Calendrical Engine"
      subtitle="Calculating Precision Drik Pañcāṅga & Solar Ephemeris..."
    />
  );
}

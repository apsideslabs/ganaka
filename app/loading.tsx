import React from 'react';
import { AnalogClockDial } from '@/components/ui/AnalogClockDial';

export default function Loading() {
  return (
    <AnalogClockDial
      fullScreen
      live
      size="lg"
      title="Gaṇaka Astronomical Engine"
      subtitle="Loading computational ephemeris & jyotiṣa matrices"
    />
  );
}

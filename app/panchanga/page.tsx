import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PanchangaClient } from '@/components/panchanga/PanchangaClient';
import { GanakaLoadingDial } from '@/components/ui/GanakaLoadingDial';

export const metadata: Metadata = {
  title: 'Drik Pañcāṅga & Calendrical Almanac — Gaṇaka',
  description:
    'Dedicated high-precision classical Pañcāṅga workstation. Calculate daily Tithi, Vāra, Nakṣatra with Pāda, Yoga, Karaṇa, Pakṣa, Sunrise/Sunset, Moonrise/Moonset, Saṅkrānti, and Vedic Muhūrtas for any date and global location.',
  openGraph: {
    title: 'Drik Pañcāṅga & Calendrical Almanac — Gaṇaka',
    description:
      'Dedicated high-precision classical Pañcāṅga workstation. Calculate daily Tithi, Vāra, Nakṣatra with Pāda, Yoga, Karaṇa, Pakṣa, Sunrise/Sunset, Moonrise/Moonset, Saṅkrānti, and Vedic Muhūrtas for any date and global location.',
  },
};

export default function PanchangaPage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FDFCF8]">
      <Suspense
        fallback={
          <GanakaLoadingDial
            fullScreen
            title="Gaṇaka Calendrical Engine"
            subtitle="Calculating Precision Drik Pañcāṅga & Solar Ephemeris..."
          />
        }
      >
        <PanchangaClient />
      </Suspense>
    </div>
  );
}

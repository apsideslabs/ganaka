import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { WorkspaceClient } from '@/components/workspace/WorkspaceClient';
import { AnalogClockDial } from '@/components/ui/AnalogClockDial';

export const metadata: Metadata = {
  title: 'Gaṇaka — Jyotiṣa Calculation Workspace',
  description:
    'Interactive high-precision Jyotiṣa calculation engine featuring VSOP87 ephemeris, Ṣoḍaśavargas (D1–D60), Viṃśottarī Daśā, Aṣṭakavarga, Śaḍbala, Pañcāṅga, and 50+ classical Yogas.',
  openGraph: {
    title: 'Gaṇaka — Jyotiṣa Calculation Workspace',
    description:
      'Interactive high-precision Jyotiṣa calculation engine featuring VSOP87 ephemeris, Ṣoḍaśavargas (D1–D60), Viṃśottarī Daśā, Aṣṭakavarga, Śaḍbala, Pañcāṅga, and 50+ classical Yogas.',
  },
};

export default function WorkspacePage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FDFCF8]">
      <Suspense
        fallback={
          <AnalogClockDial live
            fullScreen
            title="Gaṇaka Astronomical Workstation"
          />
        }
      >
        <WorkspaceClient />
      </Suspense>
    </div>
  );
}

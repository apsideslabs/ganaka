import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { MatchingWorkspaceClient } from '@/components/matching/MatchingWorkspaceClient';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';

export const metadata: Metadata = {
  title: 'Kuṭa Milan & Vivāha Matching — Gaṇaka',
  description:
    'Complete classical Jyotiṣa marriage matching workstation based on Muhūrta Cintāmaṇi, Bṛhat Parāśara Horā Śāstra, and Mādhavīya. Deterministic Aṣṭakūṭa, Daśakūṭa, Parihāra exceptions, and deeper horoscope factors.',
};

export default function MatchingPage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FDFCF8]">
      <Suspense
        fallback={
          <CelestialArmillaryLoading
            fullScreen
            title="Loading Kuṭa Milan Workstation..."
          />
        }
      >
        <MatchingWorkspaceClient />
      </Suspense>
    </div>
  );
}

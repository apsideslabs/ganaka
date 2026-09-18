'use client';

/**
 * SolarSystemLoading
 * Maps to the clean CelestialArmillaryLoading component, harmonizing all loading
 * animations across the entire application with the authentic astronomical astrolabe & armillary mechanics.
 */

import React from 'react';
import { CelestialArmillaryLoading } from './CelestialArmillaryLoading';

interface SolarSystemLoadingProps {
  fullScreen?: boolean;
  isOverlay?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SolarSystemLoading({
  fullScreen = false,
  isOverlay = false,
  title,
  subtitle,
  className = '',
}: SolarSystemLoadingProps) {
  return (
    <CelestialArmillaryLoading
      fullScreen={fullScreen}
      isOverlay={isOverlay}
      title={title}
      subtitle={subtitle}
      className={className}
    />
  );
}

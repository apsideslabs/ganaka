'use client';

/**
 * Gaṇaka — Astronomical Engine Loading Component
 * Replaced the old AI-beam & box dial with CelestialArmillaryLoading
 * to ensure complete backward compatibility without any generic or AI-slop animations.
 */

import React from 'react';
import { CelestialArmillaryLoading } from './CelestialArmillaryLoading';

interface GanakaLoadingDialProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  isOverlay?: boolean;
  className?: string;
  mode?: 'workspace' | 'panchanga' | 'general';
}

export function GanakaLoadingDial({
  title = 'Gaṇaka Calculation Engine',
  subtitle,
  fullScreen = false,
  isOverlay = false,
  className = '',
}: GanakaLoadingDialProps) {
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

'use client';

/**
 * Gaṇaka — loading dial.
 *
 * A thin compatibility wrapper around AnalogClockDial: the hands follow the real
 * clock, so a loading state shows the actual time rather than an abstract spin.
 */

import React from 'react';
import { AnalogClockDial } from './AnalogClockDial';

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
    <AnalogClockDial live
      fullScreen={fullScreen}
      isOverlay={isOverlay}
      title={title}
      subtitle={subtitle}
      className={className}
    />
  );
}

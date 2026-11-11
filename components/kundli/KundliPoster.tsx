'use client';

/**
 * Gaṇaka — Kuṇḍalī poster.
 *
 * A printed page, not a dashboard: cream stock, a maroon bar, gold ornament,
 * one centred idea at a time, and a rāśi medallion for each of the three
 * reference points. The reading order is the same as the traditional leaf —
 * who, when, where, then sun, moon, ascendant.
 */
import React, { useMemo } from 'react';
import type { JyotishaChart } from '../../lib/jyotisha/types';
import { RashiMedallion, RASHI_ROMAN } from './RashiMedallion';

const CHAKRAS = ['Introduction', 'Kuṇḍalī Summary', 'Graha', 'Bhāva', 'Daśā'];

export const KundliPoster: React.FC<{ chart: JyotishaChart }> = ({ chart }) => {
  const b = chart.meta.birthDetails;

  const sun = chart.planets.sun as any;
  const moon = chart.planets.moon as any;
  const lagnaRashi = chart.lagna.rashiNumber;

  const nakshatra = moon?.nakshatraName ?? chart.panchanga?.nakshatra?.name ?? '';
  const pada = moon?.nakshatraPada ?? chart.panchanga?.nakshatra?.pada;

  const monthName = useMemo(
    () =>
      new Date(Date.UTC(b.year, b.month - 1, b.day)).toLocaleString('en-GB', {
        month: 'long',
        timeZone: 'UTC',
      }),
    [b.year, b.month, b.day]
  );
  const weekday = useMemo(
    () =>
      new Date(Date.UTC(b.year, b.month - 1, b.day)).toLocaleString('en-GB', {
        weekday: 'long',
        timeZone: 'UTC',
      }),
    [b.year, b.month, b.day]
  );
  const hh = String(b.hour).padStart(2, '0');
  const mm = String(b.minute).padStart(2, '0');

  return (
    <div className="ganaka-poster w-full">
      {/* ---- maroon bar ---- */}
      <div className="poster-bar">
        <div className="mx-auto max-w-2xl px-5 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-[0.22em] uppercase opacity-80">
              {CHAKRAS[0]} ››
            </div>
            <div className="text-sm font-semibold tracking-wide mt-0.5">{CHAKRAS[1]}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 grid place-items-center">
            <span className="text-xs">☰</span>
          </div>
        </div>
        {/* chapter progress */}
        <div className="mx-auto max-w-2xl px-5 pb-2 flex gap-1">
          {CHAKRAS.map((c, i) => (
            <span
              key={c}
              className="h-[3px] flex-1 rounded-full"
              style={{ background: i === 1 ? '#F3C77A' : 'rgba(255,240,215,0.22)' }}
            />
          ))}
        </div>
      </div>

      {/* ---- ornamental rule ---- */}
      <div className="poster-ornament" />

      {/* ---- the leaf ---- */}
      <div className="mx-auto max-w-2xl px-6 pb-16 text-center">
        <h1 className="poster-title mt-8">Kuṇḍalī of</h1>
        <p className="poster-name mt-1">Chart</p>

        <div className="poster-meta mt-7">
          <div>{b.locationName}</div>
          <div className="mt-1">
            {b.day} {monthName} {b.year}
          </div>
          <div className="mt-1">
            {weekday}, {hh}:{mm}
          </div>
          <div className="mt-1 opacity-70">
            {b.latitude.toFixed(4)}° N · {b.longitude.toFixed(4)}° E
          </div>
        </div>

        <div className="poster-rule my-8" />

        {/* ---- sun ---- */}
        <p className="poster-lead">Your sun sign is</p>
        <p className="poster-accent mt-1">
          {RASHI_ROMAN[(sun?.rashiNumber ?? 1) - 1].toUpperCase()}
        </p>
        <div className="poster-rule my-5" />
        <div className="flex justify-center">
          <RashiMedallion rashi={sun?.rashiNumber ?? 1} size={230} caption="Sun sign" />
        </div>

        <div className="poster-rule my-8" />

        {/* ---- moon ---- */}
        <p className="poster-lead">Your moon sign is</p>
        <p className="poster-accent mt-1">
          {RASHI_ROMAN[(moon?.rashiNumber ?? 1) - 1].toUpperCase()}
        </p>
        {nakshatra ? (
          <p className="poster-meta mt-1">
            {nakshatra}
            {pada ? ` · pada ${pada}` : ''}
          </p>
        ) : null}
        <div className="poster-rule my-5" />
        <div className="flex justify-center">
          <RashiMedallion rashi={moon?.rashiNumber ?? 1} size={230} caption="Moon sign" />
        </div>

        <div className="poster-rule my-8" />

        {/* ---- ascendant ---- */}
        <p className="poster-lead">Your ascendant is</p>
        <p className="poster-accent mt-1">
          {RASHI_ROMAN[lagnaRashi - 1].toUpperCase()}
        </p>
        <div className="poster-rule my-5" />
        <div className="flex justify-center">
          <RashiMedallion rashi={lagnaRashi} size={230} caption="Lagna" accent="#8E1B2C" />
        </div>

        <p className="poster-meta mt-12 opacity-60">
          Gaṇaka · classical jyotiṣa calculation
        </p>
      </div>
    </div>
  );
};

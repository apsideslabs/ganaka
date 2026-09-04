/**
 * Gaṇaka — Pañcāṅga Layer Type Definitions & Interfaces
 */

import { PanchangaResult, CalculatedPlanet } from '@/lib/jyotisha/types';
import { CityLocation } from '@/lib/astronomy/coordinates';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { PlanetaryPosition, PlanetId } from '@/lib/astronomy/ephemeris';
import { HoraPeriod } from '@/lib/jyotisha/muhurta-advanced';

export type AllPlanetsRecord = Record<PlanetId, PlanetaryPosition | CalculatedPlanet | { siderealLongitude: number; isRetrograde?: boolean }>;

export type PanchangaViewTab =
  | 'daily'
  | 'calendar'
  | 'monthly'
  | 'yearly'
  | 'lagna'
  | 'horas'
  | 'choghadiya'
  | 'muhurta'
  | 'finder';

export interface PanchangaState {
  date: Date;
  selectedCity: CityLocation;
  customLat: string;
  customLng: string;
  customTz: string;
  ayanamshaType: AyanamshaType;
}

export interface PanchangaComputedData {
  year: number;
  month: number;
  day: number;
  lat: number;
  lng: number;
  tz: number;
  jd: number;
  sunriseJD: number;
  ayanamshaVal: number;
  ayanamshaFormatted: string;
  planets: AllPlanetsRecord;
  panchanga: PanchangaResult;
  horas: HoraPeriod[];
}

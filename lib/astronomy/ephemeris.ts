import { venusHeliocentric } from './vsop87-venus';
/**
 * Gaṇaka — High-Precision Astronomical Ephemeris Engine
 * Implements analytical VSOP87 / Jean Meeus / Brown's Lunar Theory algorithms
 * for high-precision geocentric planetary calculations, nodes, speeds, and solar phenomena.
 */

import { calculateObliquity, normalizeDegrees, calculateGMST } from './julian';
import { calculateAyanamsha, AyanamshaType } from './ayanamsha';

export type PlanetId =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu'
  | 'true_rahu'
  | 'true_ketu';

export interface PlanetaryPosition {
  id: PlanetId;
  name: string;
  sanskritName: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  latitude: number; // ecliptic latitude in degrees
  distanceAU: number; // Earth-planet distance in AU
  speedDegPerDay: number; // daily motion in degrees
  isRetrograde: boolean;
  rightAscension: number; // degrees
  declination: number; // degrees
}

export interface SolarTimes {
  sunriseJD: number;
  sunsetJD: number;
  solarNoonJD: number;
  sunriseLocalHours: string;
  sunsetLocalHours: string;
  solarNoonLocalHours: string;
  civilDawnLocalHours: string;
  civilDuskLocalHours: string;
  nauticalDawnLocalHours: string;
  astronomicalDawnLocalHours: string;
  dayLengthHours: number;
  nightLengthHours: number;
  dayDurationFormatted: string;
  nightDurationFormatted: string;
  equationOfTimeMinutes: number;
  sunDeclinationDeg: number;
}

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

/**
 * Calculates geocentric planetary positions for a given Julian Day and Ayanamsha.
 */
export function calculateAllPlanets(
  jd: number,
  ayanamshaType: AyanamshaType = 'lahiri',
  customAyanamsha: number = 0
): Record<PlanetId, PlanetaryPosition> {
  const ayanamsha = calculateAyanamsha(jd, ayanamshaType, customAyanamsha);
  const eps = calculateObliquity(jd);

  // Time in Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525.0;

  // 1. SUN
  const sunPos = calculateSun(T);
  const sunSpeed = calculateSunSpeed(T);

  // 2. MOON
  const moonPos = calculateMoon(T);
  const moonSpeed = calculateMoonSpeed(T);

  // 3. MERCURY
  const mercPos = calculateMercury(T);
  const mercSpeed = calculatePlanetSpeed(T, calculateMercury);

  // 4. VENUS
  const venPos = calculateVenus(T);
  const venSpeed = calculatePlanetSpeed(T, calculateVenus);

  // 5. MARS
  const marsPos = calculateMars(T);
  const marsSpeed = calculatePlanetSpeed(T, calculateMars);

  // 6. JUPITER
  const jupPos = calculateJupiter(T);
  const jupSpeed = calculatePlanetSpeed(T, calculateJupiter);

  // 7. SATURN
  const satPos = calculateSaturn(T);
  const satSpeed = calculatePlanetSpeed(T, calculateSaturn);

  // 8. NODES (Mean & True Rahu / Ketu)
  // Mean ascending node (Omega)
  const meanNodeLong = normalizeDegrees(
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0
  );
  const meanKetuLong = normalizeDegrees(meanNodeLong + 180.0);
  const meanNodeSpeed = -0.0529539; // approx -3' 11" per day retrograde

  // True Node (with dominant lunar perturbations)
  const M = normalizeDegrees(357.5291 + 35999.0503 * T) * DEG2RAD; // Sun anomaly
  const Mprime = normalizeDegrees(134.9634 + 477198.8676 * T) * DEG2RAD; // Moon anomaly
  const F = normalizeDegrees(93.2721 + 483202.0175 * T) * DEG2RAD;
  const D = normalizeDegrees(297.8502 + 445267.1115 * T) * DEG2RAD;

  const trueNodeCorrection =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.206 * Math.sin(2 * D) -
    0.1983 * Math.sin(2 * (D - M)) -
    0.1661 * Math.sin(M);
  const trueNodeLong = normalizeDegrees(meanNodeLong + trueNodeCorrection);
  const trueKetuLong = normalizeDegrees(trueNodeLong + 180.0);

  function makePlanet(
    id: PlanetId,
    name: string,
    sanskritName: string,
    tropLong: number,
    lat: number,
    dist: number,
    speed: number
  ): PlanetaryPosition {
    const sidereal = normalizeDegrees(tropLong - ayanamsha);
    const eq = eclipticToEquatorial(tropLong, lat, eps);

    return {
      id,
      name,
      sanskritName,
      tropicalLongitude: tropLong,
      siderealLongitude: sidereal,
      latitude: lat,
      distanceAU: dist,
      speedDegPerDay: speed,
      isRetrograde: speed < 0,
      rightAscension: eq.ra,
      declination: eq.dec,
    };
  }

  return {
    sun: makePlanet('sun', 'Sun', 'सूर्य (Sūrya)', sunPos.lon, 0.0, sunPos.dist, sunSpeed),
    moon: makePlanet('moon', 'Moon', 'चन्द्र (Candra)', moonPos.lon, moonPos.lat, moonPos.dist, moonSpeed),
    mars: makePlanet('mars', 'Mars', 'मङ्गल (Maṅgala)', marsPos.lon, marsPos.lat, marsPos.dist, marsSpeed),
    mercury: makePlanet('mercury', 'Mercury', 'बुध (Budha)', mercPos.lon, mercPos.lat, mercPos.dist, mercSpeed),
    jupiter: makePlanet('jupiter', 'Jupiter', 'गुरु (Guru)', jupPos.lon, jupPos.lat, jupPos.dist, jupSpeed),
    venus: makePlanet('venus', 'Venus', 'शुक्र (Śukra)', venPos.lon, venPos.lat, venPos.dist, venSpeed),
    saturn: makePlanet('saturn', 'Saturn', 'शनि (Śani)', satPos.lon, satPos.lat, satPos.dist, satSpeed),
    rahu: makePlanet('rahu', 'Rahu (Mean)', 'राहु (Rāhu)', meanNodeLong, 0.0, 0.00257, meanNodeSpeed),
    ketu: makePlanet('ketu', 'Ketu (Mean)', 'केतु (Ketu)', meanKetuLong, 0.0, 0.00257, meanNodeSpeed),
    true_rahu: makePlanet('true_rahu', 'True Rahu', 'स्फुट राहु', trueNodeLong, 0.0, 0.00257, meanNodeSpeed),
    true_ketu: makePlanet('true_ketu', 'True Ketu', 'स्फुट केतु', trueKetuLong, 0.0, 0.00257, meanNodeSpeed),
  };
}

/**
 * High-precision Solar Coordinates (Jean Meeus / VSOP87).
 */
function calculateSun(T: number): { lon: number; dist: number } {
  // Mean longitude of the Sun
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly of the Sun
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG2RAD;

  // Sun's equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  // Sun's true longitude
  const trueLong = normalizeDegrees(L0 + C);

  // Apparent longitude (aberration & nutation)
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const appLong = normalizeDegrees(trueLong - 0.00569 - 0.00478 * Math.sin(omega));

  // Sun distance in AU
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const v = (M * RAD2DEG + C) * DEG2RAD; // true anomaly
  const dist = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(v));

  return { lon: appLong, dist };
}

function calculateSunSpeed(T: number): number {
  const dt = 0.0001; // ~3.6 days in Julian centuries
  const p1 = calculateSun(T - dt);
  const p2 = calculateSun(T + dt);
  let dLon = p2.lon - p1.lon;
  if (dLon < -180) dLon += 360;
  if (dLon > 180) dLon -= 360;
  return dLon / (dt * 2 * 36525);
}

/**
 * High-precision Lunar Coordinates (Brown's Lunar Theory ELP-2000).
 */
function calculateMoon(T: number): { lon: number; lat: number; dist: number } {
  // Fundamental arguments
  const Lprime = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0);
  const D = normalizeDegrees(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0) * DEG2RAD;
  const M = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0) * DEG2RAD;
  const Mprime = normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699.0) * DEG2RAD;
  const F = normalizeDegrees(93.272095 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0) * DEG2RAD;

  // Major periodic terms in longitude
  const lTerms =
    6.288774 * Math.sin(Mprime) +
    1.274027 * Math.sin(2 * D - Mprime) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mprime) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mprime) +
    0.057066 * Math.sin(2 * D - M - Mprime) +
    0.053322 * Math.sin(2 * D + Mprime) +
    0.045758 * Math.sin(2 * D - M) -
    0.040923 * Math.sin(M - Mprime) -
    0.03472 * Math.sin(D) -
    0.030383 * Math.sin(M + Mprime) +
    0.015327 * Math.sin(2 * D - 2 * F) -
    0.012528 * Math.sin(2 * F + Mprime) +
    0.01098 * Math.sin(2 * F - Mprime) +
    0.010675 * Math.sin(4 * D - Mprime);

  const lon = normalizeDegrees(Lprime + lTerms);

  // Periodic terms in latitude
  const latTerms =
    5.128122 * Math.sin(F) +
    0.280602 * Math.sin(Mprime + F) +
    0.277693 * Math.sin(Mprime - F) +
    0.173237 * Math.sin(2 * D - F) +
    0.055413 * Math.sin(2 * D - Mprime + F) +
    0.046271 * Math.sin(2 * D - Mprime - F) +
    0.032573 * Math.sin(2 * D + F) +
    0.017198 * Math.sin(2 * Mprime + F);

  const lat = latTerms;

  // Earth-Moon distance in Earth radii, convert to AU (1 Earth radius ≈ 4.2635e-5 AU)
  const distKm =
    385000.56 -
    20905.355 * Math.cos(Mprime) -
    3699.111 * Math.cos(2 * D - Mprime) -
    2955.968 * Math.cos(2 * D) -
    569.925 * Math.cos(2 * Mprime);
  const distAU = distKm / 149597870.7;

  return { lon, lat, dist: distAU };
}

function calculateMoonSpeed(T: number): number {
  const dt = 0.00005;
  const p1 = calculateMoon(T - dt);
  const p2 = calculateMoon(T + dt);
  let dLon = p2.lon - p1.lon;
  if (dLon < -180) dLon += 360;
  if (dLon > 180) dLon -= 360;
  return dLon / (dt * 2 * 36525);
}

/**
 * Generic speed calculator for major planets.
 */
function calculatePlanetSpeed(
  T: number,
  calcFunc: (T: number) => { lon: number; lat: number; dist: number }
): number {
  const dt = 0.0001;
  const p1 = calcFunc(T - dt);
  const p2 = calcFunc(T + dt);
  let dLon = p2.lon - p1.lon;
  if (dLon < -180) dLon += 360;
  if (dLon > 180) dLon -= 360;
  return dLon / (dt * 2 * 36525);
}

/**
 * Helper to solve Kepler's Equation for eccentric anomaly.
 */
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 15; i++) {
    const dE = (M - (E - e * Math.sin(E))) / (1.0 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

/**
 * Geocentric conversion from Heliocentric orbital elements.
 */
function helioToGeocentric(
  L_helio: number,
  B_helio: number,
  R_helio: number,
  T: number
): { lon: number; lat: number; dist: number } {
  const sun = calculateSun(T);
  const R_sun = sun.dist;
  const L_sun = sun.lon * DEG2RAD;

  // Earth coordinates
  const x_earth = -R_sun * Math.cos(L_sun);
  const y_earth = -R_sun * Math.sin(L_sun);

  // Planet heliocentric cartesian
  const l = L_helio * DEG2RAD;
  const b = B_helio * DEG2RAD;
  const x_planet = R_helio * Math.cos(b) * Math.cos(l);
  const y_planet = R_helio * Math.cos(b) * Math.sin(l);
  const z_planet = R_helio * Math.sin(b);

  // Geocentric cartesian
  const x = x_planet - x_earth;
  const y = y_planet - y_earth;
  const z = z_planet;

  const dist = Math.sqrt(x * x + y * y + z * z);
  let lon = Math.atan2(y, x) * RAD2DEG;
  lon = normalizeDegrees(lon);
  const lat = Math.asin(z / dist) * RAD2DEG;

  return { lon, lat, dist };
}

function calculateMercury(T: number): { lon: number; lat: number; dist: number } {
  const a = 0.38709893 + 0.00000066 * T;
  const e = 0.20563069 + 0.00002527 * T;
  const I = (7.00487 - 0.005947 * T) * DEG2RAD;
  const L = normalizeDegrees(252.25084 + 149472.67411 * T);
  const w = normalizeDegrees(77.45645 + 1.556477 * T);
  const node = normalizeDegrees(48.33167 - 0.125342 * T);

  const M = normalizeDegrees(L - w) * DEG2RAD;
  const E = solveKepler(M, e);
  const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const u = v + (w - node) * DEG2RAD;
  const x_orb = r * (Math.cos(node * DEG2RAD) * Math.cos(u) - Math.sin(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const y_orb = r * (Math.sin(node * DEG2RAD) * Math.cos(u) + Math.cos(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const z_orb = r * Math.sin(u) * Math.sin(I);

  const L_helio = normalizeDegrees(Math.atan2(y_orb, x_orb) * RAD2DEG);
  const B_helio = Math.asin(z_orb / r) * RAD2DEG;

  return helioToGeocentric(L_helio, B_helio, r, T);
}

function calculateVenus(T: number): { lon: number; lat: number; dist: number } {
  // VSOP87, truncated so the heliocentric longitude stays within 0.15" of the
  // full 671-term series over 1900-2100.
  //
  // The previous implementation integrated a two-body Kepler orbit with linear
  // secular elements, which ignores planetary perturbations entirely. Measured
  // against PyEphem it was 0.13-0.69 degrees off in heliocentric longitude and
  // as much as 0.81 degrees off geocentrically - enough to shift Venus into a
  // different navamsa and change every D-9 and dasha that depends on it.
  //
  // T here is Julian centuries; VSOP87 is expressed in Julian millennia.
  const { longitude, latitude, distance } = venusHeliocentric(T / 10);
  return helioToGeocentric(longitude, latitude, distance, T);
}

function calculateMars(T: number): { lon: number; lat: number; dist: number } {
  const a = 1.52366231 - 0.00007221 * T;
  const e = 0.09341233 + 0.00011902 * T;
  const I = (1.85061 - 0.000675 * T) * DEG2RAD;
  const L = normalizeDegrees(355.45332 + 19140.30268 * T);
  const w = normalizeDegrees(336.04084 + 1.841044 * T);
  const node = normalizeDegrees(49.5574 + 0.772579 * T);

  const M = normalizeDegrees(L - w) * DEG2RAD;
  const E = solveKepler(M, e);
  const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const u = v + (w - node) * DEG2RAD;
  const x_orb = r * (Math.cos(node * DEG2RAD) * Math.cos(u) - Math.sin(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const y_orb = r * (Math.sin(node * DEG2RAD) * Math.cos(u) + Math.cos(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const z_orb = r * Math.sin(u) * Math.sin(I);

  const L_helio = normalizeDegrees(Math.atan2(y_orb, x_orb) * RAD2DEG);
  const B_helio = Math.asin(z_orb / r) * RAD2DEG;

  return helioToGeocentric(L_helio, B_helio, r, T);
}

function calculateJupiter(T: number): { lon: number; lat: number; dist: number } {
  const a = 5.20336301 + 0.00060737 * T;
  const e = 0.04839266 - 0.0001288 * T;
  const I = (1.3053 - 0.001537 * T) * DEG2RAD;
  const L = normalizeDegrees(34.40438 + 3034.74612 * T);
  const w = normalizeDegrees(14.75385 + 1.613868 * T);
  const node = normalizeDegrees(100.55615 + 1.211728 * T);

  const M = normalizeDegrees(L - w) * DEG2RAD;
  const E = solveKepler(M, e);
  const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const u = v + (w - node) * DEG2RAD;
  const x_orb = r * (Math.cos(node * DEG2RAD) * Math.cos(u) - Math.sin(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const y_orb = r * (Math.sin(node * DEG2RAD) * Math.cos(u) + Math.cos(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const z_orb = r * Math.sin(u) * Math.sin(I);

  const L_helio = normalizeDegrees(Math.atan2(y_orb, x_orb) * RAD2DEG);
  const B_helio = Math.asin(z_orb / r) * RAD2DEG;

  return helioToGeocentric(L_helio, B_helio, r, T);
}

function calculateSaturn(T: number): { lon: number; lat: number; dist: number } {
  const a = 9.53707032 - 0.0030153 * T;
  const e = 0.0541506 + 0.00036762 * T;
  const I = (2.48446 + 0.001085 * T) * DEG2RAD;
  const L = normalizeDegrees(49.94424 + 1222.49362 * T);
  const w = normalizeDegrees(92.43194 - 1.95879 * T);
  const node = normalizeDegrees(113.71504 - 0.288677 * T);

  const M = normalizeDegrees(L - w) * DEG2RAD;
  const E = solveKepler(M, e);
  const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const u = v + (w - node) * DEG2RAD;
  const x_orb = r * (Math.cos(node * DEG2RAD) * Math.cos(u) - Math.sin(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const y_orb = r * (Math.sin(node * DEG2RAD) * Math.cos(u) + Math.cos(node * DEG2RAD) * Math.sin(u) * Math.cos(I));
  const z_orb = r * Math.sin(u) * Math.sin(I);

  const L_helio = normalizeDegrees(Math.atan2(y_orb, x_orb) * RAD2DEG);
  const B_helio = Math.asin(z_orb / r) * RAD2DEG;

  return helioToGeocentric(L_helio, B_helio, r, T);
}

/**
 * Coordinate Transformation: Ecliptic (lon, lat) to Equatorial (RA, Dec).
 */
export function eclipticToEquatorial(
  lonDeg: number,
  latDeg: number,
  obliquityDeg: number
): { ra: number; dec: number } {
  const l = lonDeg * DEG2RAD;
  const b = latDeg * DEG2RAD;
  const eps = obliquityDeg * DEG2RAD;

  const sinDec = Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l);
  const dec = Math.asin(sinDec) * RAD2DEG;

  const y = Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps);
  const x = Math.cos(l);
  let ra = Math.atan2(y, x) * RAD2DEG;
  ra = normalizeDegrees(ra);

  return { ra, dec };
}

/**
 * Formats decimal hours (0 to 24) to a standard 12-hour AM/PM string (e.g. "6:13 AM", "1:21 PM").
 */
export function formatHours12H(hoursVal: number, includeSeconds: boolean = false): string {
  let norm = ((hoursVal % 24) + 24) % 24;
  const totalSeconds = Math.round(norm * 3600);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;

  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  if (includeSeconds) {
    return `${h12}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${period}`;
  }
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Formats a decimal duration in hours to a human-readable duration (e.g. "12h 30m 14s").
 */
export function formatDurationHours(hoursVal: number): string {
  const totalSeconds = Math.round(hoursVal * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

/**
 * Computes high-precision Sun parameters (Apparent Longitude, Declination, Equation of Time)
 * based on Jean Meeus Astronomical Algorithms / NOAA Solar Equations.
 */
export function getSunDetailsAtJD(jd: number): {
  appLon: number;
  dec: number;
  eotMinutes: number;
  obliquity: number;
} {
  const T = (jd - 2451545.0) / 36525.0;

  // Mean longitude of the Sun
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly of the Sun
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG2RAD;
  // Eccentricity of Earth's orbit
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  // Equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  const sunTrueLon = normalizeDegrees(L0 + C);
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const sunAppLon = normalizeDegrees(sunTrueLon - 0.00569 - 0.00478 * Math.sin(omega));

  // Mean and true obliquity of the ecliptic
  const eps0 = 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
  const eps = eps0 + 0.00256 * Math.cos(omega);

  // Equation of Time (Meeus formula)
  const y = Math.tan((eps * DEG2RAD) / 2.0) ** 2;
  const L0Rad = L0 * DEG2RAD;
  const eotMinutes =
    4.0 *
    RAD2DEG *
    (y * Math.sin(2 * L0Rad) -
      2 * e * Math.sin(M) +
      4 * e * y * Math.sin(M) * Math.cos(2 * L0Rad) -
      0.5 * (y ** 2) * Math.sin(4 * L0Rad) -
      1.25 * (e ** 2) * Math.sin(2 * M));

  // Declination of the Sun
  const sinDec = Math.sin(eps * DEG2RAD) * Math.sin(sunAppLon * DEG2RAD);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec))) * RAD2DEG;

  return { appLon: sunAppLon, dec, eotMinutes, obliquity: eps };
}

/**
 * Calculates Hour Angle for given altitude (taking latitude & declination into account).
 */
function getHourAngleForAltitude(latDeg: number, decDeg: number, targetAltDeg: number): number {
  const latRad = latDeg * DEG2RAD;
  const decRad = decDeg * DEG2RAD;
  const altRad = targetAltDeg * DEG2RAD;

  const cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));

  if (cosH >= 1.0) return 0.0; // Sun never reaches this altitude (polar night)
  if (cosH <= -1.0) return 180.0; // Sun never goes below this altitude (polar day)

  return Math.acos(cosH) * RAD2DEG;
}

/**
 * Calculates accurate Sunrise, Sunset, and Solar Noon for geographic location
 * based on exact NOAA / Jean Meeus Astronomical Algorithms.
 */
export function calculateSolarTimes(
  jd: number,
  latitudeDeg: number,
  longitudeDeg: number,
  timezoneOffsetHours: number
): SolarTimes {
  // Determine local midnight JD for the given day
  const localDayIndex = Math.floor(jd + 0.5 + timezoneOffsetHours / 24.0);
  const jdMidnightUT = localDayIndex - 0.5 - timezoneOffsetHours / 24.0;

  // Approximate solar noon at longitude
  const approxNoonUTJD = jdMidnightUT + (12.0 - longitudeDeg / 15.0) / 24.0;
  const noonSun = getSunDetailsAtJD(approxNoonUTJD);

  // Exact Solar Noon transit in UT (hours) & Local Time (hours)
  const solarNoonUTHours = 12.0 - longitudeDeg / 15.0 - noonSun.eotMinutes / 60.0;
  let solarNoonLocalHours = solarNoonUTHours + timezoneOffsetHours;
  solarNoonLocalHours = ((solarNoonLocalHours % 24) + 24) % 24;

  const exactSolarNoonJD = jdMidnightUT + (solarNoonUTHours + timezoneOffsetHours) / 24.0;

  // 1. Standard Sunrise / Sunset (-0.83333° for 34' refraction + 16' solar radius)
  const h0Standard = -0.833333;
  const H0Standard = getHourAngleForAltitude(latitudeDeg, noonSun.dec, h0Standard);
  const halfDayHoursApprox = H0Standard / 15.0;

  // Refine Sunrise using Sun position at approximate sunrise moment
  const approxSunriseJD = exactSolarNoonJD - halfDayHoursApprox / 24.0;
  const riseSun = getSunDetailsAtJD(approxSunriseJD);
  const H0Rise = getHourAngleForAltitude(latitudeDeg, riseSun.dec, h0Standard);
  const halfDayRiseHours = H0Rise / 15.0;
  const sunriseUTHours = 12.0 - longitudeDeg / 15.0 - riseSun.eotMinutes / 60.0 - halfDayRiseHours;
  let sunriseLocalHoursVal = sunriseUTHours + timezoneOffsetHours;
  sunriseLocalHoursVal = ((sunriseLocalHoursVal % 24) + 24) % 24;
  const exactSunriseJD = jdMidnightUT + (sunriseUTHours + timezoneOffsetHours) / 24.0;

  // Refine Sunset using Sun position at approximate sunset moment
  const approxSunsetJD = exactSolarNoonJD + halfDayHoursApprox / 24.0;
  const setSun = getSunDetailsAtJD(approxSunsetJD);
  const H0Set = getHourAngleForAltitude(latitudeDeg, setSun.dec, h0Standard);
  const halfDaySetHours = H0Set / 15.0;
  const sunsetUTHours = 12.0 - longitudeDeg / 15.0 - setSun.eotMinutes / 60.0 + halfDaySetHours;
  let sunsetLocalHoursVal = sunsetUTHours + timezoneOffsetHours;
  sunsetLocalHoursVal = ((sunsetLocalHoursVal % 24) + 24) % 24;
  const exactSunsetJD = jdMidnightUT + (sunsetUTHours + timezoneOffsetHours) / 24.0;

  // 2. Civil Twilight (-6.0°)
  const H0Civil = getHourAngleForAltitude(latitudeDeg, noonSun.dec, -6.0);
  const civilDawnLocal = ((solarNoonLocalHours - H0Civil / 15.0) % 24 + 24) % 24;
  const civilDuskLocal = ((solarNoonLocalHours + H0Civil / 15.0) % 24 + 24) % 24;

  // 3. Nautical Twilight (-12.0°)
  const H0Nautical = getHourAngleForAltitude(latitudeDeg, noonSun.dec, -12.0);
  const nauticalDawnLocal = ((solarNoonLocalHours - H0Nautical / 15.0) % 24 + 24) % 24;

  // 4. Astronomical Twilight (-18.0°)
  const H0Astro = getHourAngleForAltitude(latitudeDeg, noonSun.dec, -18.0);
  const astroDawnLocal = ((solarNoonLocalHours - H0Astro / 15.0) % 24 + 24) % 24;

  // Day & Night Durations
  const dayLengthHours = Math.max(0, (exactSunsetJD - exactSunriseJD) * 24.0);
  const nightLengthHours = Math.max(0, 24.0 - dayLengthHours);

  return {
    sunriseJD: exactSunriseJD,
    sunsetJD: exactSunsetJD,
    solarNoonJD: exactSolarNoonJD,
    sunriseLocalHours: formatHours12H(sunriseLocalHoursVal, false),
    sunsetLocalHours: formatHours12H(sunsetLocalHoursVal, false),
    solarNoonLocalHours: formatHours12H(solarNoonLocalHours, false),
    civilDawnLocalHours: formatHours12H(civilDawnLocal, false),
    civilDuskLocalHours: formatHours12H(civilDuskLocal, false),
    nauticalDawnLocalHours: formatHours12H(nauticalDawnLocal, false),
    astronomicalDawnLocalHours: formatHours12H(astroDawnLocal, false),
    dayLengthHours,
    nightLengthHours,
    dayDurationFormatted: formatDurationHours(dayLengthHours),
    nightDurationFormatted: formatDurationHours(nightLengthHours),
    equationOfTimeMinutes: noonSun.eotMinutes,
    sunDeclinationDeg: noonSun.dec,
  };
}

export interface LunarTimes {
  moonriseLocalHours: string;
  moonsetLocalHours: string;
  moonriseJD: number | null;
  moonsetJD: number | null;
  moonIlluminationPct: number;
  moonPhaseName: string;
}

/**
 * Calculates Moonrise, Moonset, Phase Name, and Illumination Percentage
 * for geographic coordinates and date using high-precision ELP-2000 Moon position & topocentric parallax.
 */
export function calculateLunarTimes(
  jd: number,
  latitudeDeg: number,
  longitudeDeg: number,
  timezoneOffsetHours: number
): LunarTimes {
  const localDayIndex = Math.floor(jd + 0.5 + timezoneOffsetHours / 24.0);
  const jdMidnightUT = localDayIndex - 0.5 - timezoneOffsetHours / 24.0;
  const latRad = latitudeDeg * DEG2RAD;
  // Moon geometric horizon altitude: Refraction (34') + Solar/Lunar Semi-diameter (16') - Parallax (~57') = +0.125°
  const h0 = 0.125 * DEG2RAD;

  // Moon altitude above horizon at given local civil hour (0..24)
  const getMoonAltitude = (localHour: number): number => {
    const utHour = localHour - timezoneOffsetHours;
    const currentJD = jdMidnightUT + utHour / 24.0;
    const T = (currentJD - 2451545.0) / 36525.0;
    const moon = calculateMoon(T);
    const eps = calculateObliquity(currentJD);
    const eq = eclipticToEquatorial(moon.lon, moon.lat, eps);

    const gmst = calculateGMST(currentJD);
    const lst = normalizeDegrees(gmst + longitudeDeg);
    const ha = (lst - eq.ra) * DEG2RAD;

    const sinAlt =
      Math.sin(latRad) * Math.sin(eq.dec * DEG2RAD) +
      Math.cos(latRad) * Math.cos(eq.dec * DEG2RAD) * Math.cos(ha);
    return Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  };

  let moonriseHour: number | null = null;
  let moonsetHour: number | null = null;

  // Search across 24 hours in fine steps of 0.2 hours (12 minutes) for high precision
  const step = 0.2;
  let prevAlt = getMoonAltitude(0) - h0;

  for (let t = step; t <= 24.001; t += step) {
    const currAlt = getMoonAltitude(t) - h0;

    // Crossing from below to above -> Moonrise
    if (prevAlt < 0 && currAlt >= 0 && moonriseHour === null) {
      const fraction = -prevAlt / (currAlt - prevAlt);
      moonriseHour = t - step + fraction * step;
    }

    // Crossing from above to below -> Moonset
    if (prevAlt >= 0 && currAlt < 0 && moonsetHour === null) {
      const fraction = prevAlt / (prevAlt - currAlt);
      moonsetHour = t - step + fraction * step;
    }

    prevAlt = currAlt;
  }

  // Calculate Moon Phase and Illumination Percentage at local noon
  const noonJD = jdMidnightUT + 0.5;
  const T_noon = (noonJD - 2451545.0) / 36525.0;
  const sunPos = calculateSun(T_noon);
  const moonPos = calculateMoon(T_noon);
  const elongation = normalizeDegrees(moonPos.lon - sunPos.lon);
  const illuminationFraction = (1 - Math.cos(elongation * DEG2RAD)) / 2.0;
  const moonIlluminationPct = Math.round(illuminationFraction * 1000) / 10;

  let moonPhaseName = 'Waxing Crescent';
  if (elongation < 10 || elongation > 350) moonPhaseName = 'New Moon (Amāvāsyā)';
  else if (elongation >= 10 && elongation < 80) moonPhaseName = 'Waxing Crescent (Śukla Pakṣa)';
  else if (elongation >= 80 && elongation < 100) moonPhaseName = 'First Quarter (Śukla Aṣṭamī)';
  else if (elongation >= 100 && elongation < 170) moonPhaseName = 'Waxing Gibbous (Śukla Pakṣa)';
  else if (elongation >= 170 && elongation <= 190) moonPhaseName = 'Full Moon (Pūrṇimā)';
  else if (elongation > 190 && elongation <= 260) moonPhaseName = 'Waning Gibbous (Kṛṣṇa Pakṣa)';
  else if (elongation > 260 && elongation <= 280) moonPhaseName = 'Third Quarter (Kṛṣṇa Aṣṭamī)';
  else if (elongation > 280 && elongation <= 350) moonPhaseName = 'Waning Crescent (Kṛṣṇa Pakṣa)';

  const moonriseJD = moonriseHour !== null ? jdMidnightUT + moonriseHour / 24.0 : null;
  const moonsetJD = moonsetHour !== null ? jdMidnightUT + moonsetHour / 24.0 : null;

  return {
    moonriseLocalHours: moonriseHour !== null ? formatHours12H(moonriseHour, false) : 'No rise today',
    moonsetLocalHours: moonsetHour !== null ? formatHours12H(moonsetHour, false) : 'No set today',
    moonriseJD,
    moonsetJD,
    moonIlluminationPct,
    moonPhaseName,
  };
}


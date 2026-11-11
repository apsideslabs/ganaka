/**
 * Gaṇaka — Core Jyotiṣa Types & Interfaces
 */

import { PlanetId } from '../astronomy/ephemeris';
import { AyanamshaType } from '../astronomy/ayanamsha';
import { DoshaSummaryReport } from '../doshas/dosha-types';

export type { PlanetId, AyanamshaType, DoshaSummaryReport };

export type RashiNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface RashiInfo {
  number: RashiNumber;
  name: string;
  sanskritName: string;
  devanagari: string;
  lord: PlanetId;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  mobility: 'Chara (Movable)' | 'Sthira (Fixed)' | 'Dvisvabhava (Dual)';
  gender: 'Male (Odd/Krura)' | 'Female (Even/Saumya)';
  startDegree: number;
  endDegree: number;
  symbol: string;
}

export interface NakshatraInfo {
  index: number; // 0 to 26
  number: number; // 1 to 27
  name: string;
  sanskritName: string;
  devanagari: string;
  lord: PlanetId;
  deity: string;
  padaLords: [PlanetId, PlanetId, PlanetId, PlanetId];
  startDegree: number;
  endDegree: number;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  nadi: 'Adi' | 'Madhya' | 'Antya';
}

export type DignityType =
  | 'Exalted (Ucca)'
  | 'Moolatrikona'
  | 'Own Sign (Swakshetra)'
  | 'Great Friend (Adhi Mitra)'
  | 'Friend (Mitra)'
  | 'Neutral (Sama)'
  | 'Enemy (Shatru)'
  | 'Great Enemy (Adhi Shatru)'
  | 'Debilitated (Neecha)';

export interface CalculatedPlanet {
  id: PlanetId;
  name: string;
  sanskritName: string;
  devanagari: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  longitudeInRashi: number; // 0 to 30
  rashiNumber: RashiNumber;
  rashiName: string;
  house: number; // 1 to 12
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraLord: PlanetId;
  pada: 1 | 2 | 3 | 4;
  degreeStr: string; // e.g. 14°22'15"
  isRetrograde: boolean;
  isCombust: boolean;
  speed: number;
  declination: number;
  dignity: DignityType;
  naturalBenefic: boolean;
  aspectsToHouses: number[]; // houses it casts Drishti on
  /** Ecliptic latitude in degrees, carried from the ephemeris. */
  latitude?: number;
}

export interface BhavaCusp {
  houseNumber: number;
  rashiNumber: RashiNumber;
  startDegree: number;
  midDegree: number; // Bhāva Madhya
  endDegree: number; // Bhāva Sandhi
  midDegreeStr: string;
  rashiLord: PlanetId;
  planetsInHouse: PlanetId[];
}

export interface ChoghadiyaSlot {
  number: number;
  name: string;
  sanskritName: string;
  category: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  nature: 'Best (Amṛta)' | 'Good (Śubha)' | 'Gain (Lābha)' | 'Neutral (Cala)' | 'Disease (Roga)' | 'Loss (Kāla)' | 'Anxiety (Udvega)';
  isAuspicious: boolean;
  rulingPlanet: PlanetId;
  rulingPlanetName: string;
  timeRange: string;
  startJD: number;
  endJD: number;
  isCurrent: boolean;
}

export interface PanchangaResult {
  tithi: {
    number: number; // 1 to 30
    name: string;
    sanskritName: string;
    paksha: 'Shukla' | 'Krishna';
    percentElapsed: number;
    deity: string;
    nityaDeity?: string;
    nature?: 'Nandā' | 'Bhadrā' | 'Jayā' | 'Riktā' | 'Pūrṇā';
    tattva?: 'Agni' | 'Pṛthvī' | 'Vāyu' | 'Jala' | 'Ākāśa';
    rulingPlanet?: PlanetId;
    udayaTithi?: string;
    startTime?: string;
    endTime: string;
    endTimeJD?: number;
    durationLeftHours?: number;
    nextTithiName?: string;
  };
  vara: {
    number: number; // 0 to 6 (Sun=0)
    name: string;
    sanskritName: string;
    lord: PlanetId;
    horaLordNow?: PlanetId;
    horaLordNowName?: string;
    deity?: string;
    metal?: string;
    color?: string;
    sunriseVedicVara: string;
    civilWeekday: string;
  };
  nakshatra: {
    number: number; // 1 to 27
    name: string;
    sanskritName: string;
    pada: number; // 1 to 4
    percentElapsed: number;
    lord: PlanetId;
    deity: string;
    gana?: 'Deva' | 'Manushya' | 'Rakshasa';
    yoni?: string;
    nadi?: 'Adi' | 'Madhya' | 'Antya';
    varna?: string;
    tattva?: string;
    paya?: string;
    akshara?: string;
    udayaNakshatra?: string;
    startTime?: string;
    endTime: string;
    endTimeJD?: number;
    durationLeftHours?: number;
    nextNakshatraName?: string;
  };
  yoga: {
    number: number; // 1 to 27
    name: string;
    sanskritName: string;
    percentElapsed: number;
    auspiciousness?: 'Auspicious (Śubha)' | 'Inauspicious (Aśubha)' | 'Mixed (Miśra)';
    deity?: string;
    udayaYoga?: string;
    startTime?: string;
    endTime: string;
    endTimeJD?: number;
    durationLeftHours?: number;
    nextYogaName?: string;
  };
  karana: {
    number: number; // 1 to 60
    name: string;
    sanskritName: string;
    type: 'Chara (Movable)' | 'Sthira (Fixed)';
    deity: string;
    percentElapsed: number;
    isBhadraActive?: boolean;
    bhadraLocation?: string;
    udayaKarana?: string;
    startTime?: string;
    endTime: string;
    endTimeJD?: number;
    durationLeftHours?: number;
    nextKaranaName?: string;
  };
  sunTimes: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    solarNoon: string;
    civilDawn?: string;
    civilDusk?: string;
    nauticalDawn?: string;
    astronomicalDawn?: string;
    dayDuration: string;
    nightDuration: string;
    dayDurationGhatis: string;
    nightDurationGhatis: string;
    sunriseJD: number;
    sunsetJD: number;
    solarNoonJD: number;
    equationOfTime?: string;
    sunDeclination?: string;
    moonPhaseName?: string;
    moonIlluminationPct?: number;
  };
  muhurtas: {
    rahukala: string;
    yamaghanta: string;
    gulikakala: string;
    abhijit: string;
    brahmaMuhurta: string;
    pratahSandhya?: string;
    godhuli: string;
    sayahnaSandhya?: string;
    vijaya: string;
    nishita: string;
    durmuhurta: string[];
    amritKalam: string;
    varjyam: string;
    amritaSiddhiYoga?: string | null;
    sarvarthaSiddhiYoga?: string | null;
    pushyaYoga?: string | null;
    dwipushkarYoga?: string | null;
    tripushkarYoga?: string | null;
    choghadiyaDay?: ChoghadiyaSlot[];
    choghadiyaNight?: ChoghadiyaSlot[];
  };
  calendar: {
    solarMonth: {
      number: number; // 1 to 12
      name: string;
      sanskritName: string;
      rashiName: string;
      solarDay: number;
      sunDegreeInRashi: string;
    };
    lunarMonth: {
      amantaName: string;
      purnimantaName: string;
      isAdhika: boolean;
      isKshaya: boolean;
      status: string;
    };
    sankranti: {
      currentSankrantiName: string;
      nextSankrantiName: string;
      nextSankrantiDateTime: string;
      nextSankrantiJD: number;
      punyaKalaWindow: string;
    };
    rtu: {
      name: string;
      sanskritName: string;
      vedicSeason: string;
    };
    ayana: {
      name: string;
      sanskritName: string;
      description: string;
    };
    eras: {
      kaliYugaYear: number;
      vikramaSamvat: number;
      shakaSamvat: number;
      samvatsara60: {
        number: number; // 1 to 60
        name: string;
        sanskritName: string;
      };
    };
  };
}

export type StandardVargaId =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60';

export type ExtendedVargaId =
  | 'D5'
  | 'D6'
  | 'D8'
  | 'D11'
  | 'D81'
  | 'D108'
  | 'D144';

export type VargaId = StandardVargaId | ExtendedVargaId;

export interface VargaHouse {
  houseNumber: number; // 1 to 12
  rashiNumber: RashiNumber; // 1 to 12
  rashiName: string;
  rashiSanskrit: string;
  lord: PlanetId;
  lordName: string;
  lordPlacement?: {
    rashiNumber: RashiNumber;
    rashiName: string;
    house: number;
  };
  occupants: PlanetId[];
}

export interface VargaChart {
  id: VargaId;
  name: string;
  sanskritName: string;
  divisionFactor: number;
  significance: string;
  lagnaRashi: RashiNumber;
  lagnaDegreeInRashi: number;
  planets: Record<
    PlanetId,
    {
      rashiNumber: RashiNumber;
      degreeInRashi: number;
      house: number;
    }
  >;
  houses?: Record<number, VargaHouse>;
  houseToRashi?: Record<number, RashiNumber>;
  rashiToHouse?: Record<RashiNumber, number>;
}

export interface DashaPeriod {
  lord: PlanetId;
  lordName: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  subPeriods?: DashaPeriod[]; // Antardashas or Pratyantardashas
  isPreNatal?: boolean;
  isBirthActive?: boolean;
  elapsedBeforeBirthYears?: number;
  fullAstronomicalStartDate?: string;
  fullAstronomicalEndDate?: string;
  level?: number;
}

export interface AshtakavargaTable {
  planet: PlanetId | 'lagna';
  name: string;
  bindusByRashi: number[]; // 12 numbers (index 0 is Mesha, index 11 is Meena)
  totalBindus: number;
}

export interface AshtakavargaResult {
  bav: Record<PlanetId | 'lagna', AshtakavargaTable>;
  sav: {
    bindusByRashi: number[]; // 12 elements sum to 337
    total: number;
  };
  trikonaReductions: number[];
  ekadhipatyaReductions: number[];
  shodhyaPinda: {
    rasiPinda: number;
    grahaPinda: number;
    totalShodhyaPinda: number;
  };
  kakshaOrder?: Array<{ id: string; name: string; span: string }>;
  prastaraGrids?: Record<string, Record<string, number[]>>;
}

export interface ShadbalaComponent {
  sthanaBala: number; // Positional
  digBala: number; // Directional
  kalaBala: number; // Temporal
  chestaBala: number; // Motional
  naisargikaBala: number; // Natural
  drigBala: number; // Aspectual
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  ratio: number; // total / required
  rank: number;
}

export interface DetectedYoga {
  id: string;
  name: string;
  sanskritName: string;
  sourceText: string;
  chapterAndVerse: string;
  sanskritShloka?: string;
  category:
    | 'Raja'
    | 'Dhana'
    | 'Pancha Mahapurusha'
    | 'Chandra'
    | 'Surya'
    | 'Nabhasa'
    | 'Arishta'
    | 'Viparita'
    | 'Parivartana'
    | 'Conjunction'
    | 'Jaimini'
    | 'Special';
  conditionsMet: string[];
  effects: string;
  involvedPlanets: PlanetId[];
  strengthRating: 'High' | 'Medium' | 'Weak' | 'Cancelled';
  isUnverified?: boolean;
  provenanceNotes?: string;
}

export interface JaiminiFactors {
  charaKarakas: Array<{
    planet: PlanetId;
    planetName: string;
    karakaKey: 'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK';
    karakaName: string;
    degrees: number;
  }>;
  arudhaPadas: Array<{
    house: number;
    name: string;
    rashiNumber: RashiNumber;
    rashiName: string;
  }>;
  karakamshaRashi: RashiNumber;
  swamshaRashi: RashiNumber;
}

export interface SpecialPoints {
  gulika: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  mandi: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  dhooma: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  vyatipata: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  parivesha: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  indrachapa: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  upaketu: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  bhavaLagna: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  horaLagna: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  ghatiLagna: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  shreeLagna: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
  induLagna: { rashi: RashiNumber; degreeInRashi: number; degreeStr: string };
}

export interface JyotishaChart {
  meta: {
    calculatedAt: string;
    engineVersion: string;
    ayanamshaType: AyanamshaType;
    ayanamshaValue: number;
    ayanamshaFormatted: string;
    julianDay: number;
    houseSystem: 'equal_whole' | 'sripati' | 'placidus';
    birthDetails: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
      locationName: string;
      latitude: number;
      longitude: number;
      timezoneOffsetHours: number;
    };
  };
  lagna: {
    tropicalLongitude: number;
    siderealLongitude: number;
    rashiNumber: RashiNumber;
    rashiName: string;
    degreeInRashi: number;
    degreeStr: string;
    nakshatraNumber: number;
    nakshatraName: string;
    pada: 1 | 2 | 3 | 4;
  };
  planets: Record<PlanetId, CalculatedPlanet>;
  bhavas: BhavaCusp[];
  panchanga: PanchangaResult;
  vargas: Record<VargaId, VargaChart>;
  vargottamaPlanets: PlanetId[];
  vimshottari: {
    balanceAtBirth: {
      lord: PlanetId;
      yearsRemaining: number;
      percentRemaining: number;
      [key: string]: any;
    };
    activeAtBirth?: any;
    tree: DashaPeriod[];
    fullAstronomicalTree?: DashaPeriod[];
    optionsUsed?: any;
  };
  ashtakavarga: AshtakavargaResult;
  shadbala: Record<PlanetId, ShadbalaComponent>;
  yogas: DetectedYoga[];
  doshas: DoshaSummaryReport;
  jaimini: JaiminiFactors;
  specialPoints: SpecialPoints;
}

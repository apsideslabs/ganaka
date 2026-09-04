/**
 * Gaṇaka — Avakahada Chakra Calculation Engine (अवकहड़ा चक्र)
 * Classical calculations strictly according to Bṛhat Parāśara Horā Śāstra (BPHS),
 * Muhūrta Chintāmaṇi, Narapatijayacaryā, Jātaka Parijāta, and traditional Pañcāṅga standards.
 * 
 * All outputs are derived deterministically from the workspace JyotiṣaChart without guessing.
 */

import { JyotishaChart, PlanetId, RashiNumber } from './types';
import { RASHIS, NAKSHATRAS } from './constants';

export type PayaType = 'Suvarṇa (Gold / स्वर्ण)' | 'Rajata (Silver / रजत)' | 'Tāmra (Copper / ताम्र)' | 'Loha (Iron / लोह)';
export type VarnaType = 'Brāhmaṇa (ब्राह्मण)' | 'Kṣatriya (क्षत्रिय)' | 'Vaiśya (वैश्य)' | 'Śūdra (शूद्र)';
export type VashyaType = 'Catuṣpāda (चतुष्पाद)' | 'Dvipada / Mānava (द्विपद)' | 'Jalacara (जलचर)' | 'Vanacara (वनचर)' | 'Kīṭa (कीट)';
export type GanaType = 'Deva (देव)' | 'Manushya (मनुष्य)' | 'Rakshasa (राक्षस)';
export type NadiType = 'Ādi / Vāta (आदि - वात)' | 'Madhya / Pitta (मध्य - पित्त)' | 'Antya / Kapha (अन्त्य - कफ)';
export type RajjuType = 'Pāda / Foot (पाद)' | 'Kaṭi / Waist (कटि)' | 'Nābhi / Navel (नाभि)' | 'Kaṇṭha / Neck (कण्ठ)' | 'Śiro / Head (शिरो)';
export type TattvaType = 'Agni (Fire / अग्नि)' | 'Pṛthvī (Earth / पृथ्वी)' | 'Vāyu (Air / वायु)' | 'Jala (Water / जल)' | 'Ākāśa (Ether / आकाश)';
export type VihagaType = 'Bheruṇḍa / Falcon (गिद्ध / भेरुण्ड)' | 'Ulūka / Owl (उल्लू)' | 'Kāka / Crow (कौआ)' | 'Kukkuṭa / Cock (कुक्कुट)' | 'Mayūra / Peacock (मयूर)';
export type YunjaType = 'Pūrva (पूर्व)' | 'Madhya (मध्य)' | 'Uttara (उत्तर)';
export type TithiClassType = 'Nandā (नन्दा)' | 'Bhadrā (भद्रा)' | 'Jayā (जया)' | 'Riktā (रिक्ता)' | 'Pūrṇā (पूर्णा)';

export interface AvakahadaChakraResult {
  // 1. Core Birth Identifiers
  lagna: {
    rashiNumber: RashiNumber;
    name: string;
    sanskritName: string;
    devanagari: string;
    degreeFormatted: string;
    lordId: PlanetId;
    lordName: string;
    lordSanskrit: string;
    nakshatraName: string;
    nakshatraPada: 1 | 2 | 3 | 4;
  };
  rashi: {
    rashiNumber: RashiNumber;
    name: string;
    sanskritName: string;
    devanagari: string;
    degreeInRashi: string;
    totalLongitude: string;
    lordId: PlanetId;
    lordName: string;
    lordSanskrit: string;
  };
  sunSign: {
    rashiNumber: RashiNumber;
    name: string;
    sanskritName: string;
    devanagari: string;
    degreeInRashi: string;
    lordId: PlanetId;
    lordName: string;
    lordSanskrit: string;
  };
  nakshatra: {
    number: number; // 1 to 27
    name: string;
    sanskritName: string;
    devanagari: string;
    pada: 1 | 2 | 3 | 4;
    lordId: PlanetId;
    lordName: string;
    lordSanskrit: string;
    padaLordId: PlanetId;
    padaLordName: string;
    deity: string;
    symbol: string;
  };

  // 2. 108 Auspicious Syllable (Nāmakṣara)
  namakshara: {
    syllable: string;
    devanagari: string;
    iast: string;
    fullDisplay: string;
  };

  // 3. Classical Avakahada Classifications
  paya: {
    type: PayaType;
    metal: string;
    houseFromLagna: number;
    result: string;
    sanskritPhala: string;
  };
  varna: {
    type: VarnaType;
    category: string;
    sanskrit: string;
    element: string;
  };
  vashya: {
    type: VashyaType;
    category: string;
    sanskrit: string;
    description: string;
  };
  yoni: {
    animal: string;
    gender: 'Male (नर)' | 'Female (मादा)';
    sanskrit: string;
    inimicalYoni: string; // Yoni Vaira
    inimicalSanskrit: string;
  };
  gana: {
    type: GanaType;
    sanskrit: string;
    temperament: string;
  };
  nadi: {
    type: NadiType;
    humor: 'Vata (Wind)' | 'Pitta (Bile)' | 'Kapha (Phlegm)';
    sanskrit: string;
  };
  rajju: {
    type: RajjuType;
    limb: string;
    sanskrit: string;
  };
  tattva: {
    type: TattvaType;
    lordId: PlanetId;
    lordName: string;
    sanskrit: string;
  };
  vihaga: {
    type: VihagaType;
    bird: string;
    sanskrit: string;
  };
  vedha: {
    afflictingNakshatraNumber: number;
    afflictingNakshatraName: string;
    afflictingNakshatraSanskrit: string;
    pairText: string;
  };
  yunja: {
    type: YunjaType;
    sanskrit: string;
  };
  gotra: {
    rishi: string;
    sanskrit: string;
  };
  vriksha: {
    treeName: string;
    botanicalName: string;
    sanskrit: string;
  };

  // 4. Pañcāṅga Limbs at Birth
  panchanga: {
    tithi: {
      number: number;
      name: string;
      sanskrit: string;
      paksha: string;
      classType: TithiClassType;
      classDeity: string;
      classLord: string;
      tithiLord: string;
      percentElapsed: string;
    };
    vara: {
      name: string;
      sanskrit: string;
      lordName: string;
      lordSanskrit: string;
    };
    yoga: {
      number: number;
      name: string;
      sanskrit: string;
      auspiciousness: string;
    };
    karana: {
      number: number;
      name: string;
      sanskrit: string;
      type: string;
    };
    ritu: {
      name: string;
      sanskrit: string;
      season: string;
    };
    masa: {
      amanta: string;
      purnimanta: string;
      solarMonth: string;
      solarDay: number;
    };
    samvatsara: {
      number: number;
      name: string;
      sanskrit: string;
    };
  };

  // 5. Mathematical Metrics (Bhayāt, Bhābhoga, Daśā Balance)
  mathematics: {
    bhayat: {
      ghatis: number;
      palas: number;
      vipalas: number;
      formattedGhatis: string;
      elapsedDegrees: number;
      elapsedFormatted: string;
    };
    bhabhoga: {
      ghatis: number;
      palas: number;
      formattedGhatis: string;
      spanDegrees: number;
      spanFormatted: string;
    };
    dashaBalance: {
      lordId: PlanetId;
      lordName: string;
      lordSanskrit: string;
      yearsTotal: number;
      yearsRemaining: number;
      monthsRemaining: number;
      daysRemaining: number;
      percentRemaining: number;
      formattedBalance: string;
    };
  };
}

// --- 108 Auspicious Syllables Table (4 Padas x 27 Nakshatras) ---
export const NAKSHATRA_NAMAKSHARAS: Record<number, [string, string, string, string]> = {
  1: ['Chu (चु)', 'Che (चे)', 'Cho (चो)', 'Lā (ला)'],
  2: ['Lī (ली)', 'Lū (लू)', 'Le (ले)', 'Lo (लो)'],
  3: ['A (अ)', 'Ī (ई)', 'U (उ)', 'E (ए)'],
  4: ['O (ओ)', 'Vā (वा)', 'Vī (वी)', 'Vu (वु)'],
  5: ['Ve (वे)', 'Vo (वो)', 'Kā (का)', 'Kī (की)'],
  6: ['Ku (कु)', 'Gha (घ)', 'Ṅa (ङ)', 'Cha (छ)'],
  7: ['Ke (के)', 'Ko (को)', 'Hā (हा)', 'Hī (ही)'],
  8: ['Hū (हू)', 'He (हे)', 'Ho (हो)', 'Ḍā (डा)'],
  9: ['Ḍī (डी)', 'Ḍū (डू)', 'Ḍe (डे)', 'Ḍo (डो)'],
  10: ['Mā (मा)', 'Mī (मी)', 'Mū (मू)', 'Me (मे)'],
  11: ['Mo (मो)', 'Ṭā (टा)', 'Ṭī (टी)', 'Ṭū (टू)'],
  12: ['Ṭe (टे)', 'Ṭo (टो)', 'Pā (पा)', 'Pī (पी)'],
  13: ['Pū (पू)', 'Ṣa (ष)', 'Ṇa (ण)', 'Ṭha (ठ)'],
  14: ['Pe (पे)', 'Po (पो)', 'Rā (रा)', 'Rī (री)'],
  15: ['Rū (रू)', 'Re (रे)', 'Ro (रो)', 'Tā (ता)'],
  16: ['Tī (ती)', 'Tū (तू)', 'Te (ते)', 'To (तो)'],
  17: ['Nā (ना)', 'Nī (नी)', 'Nū (नू)', 'Ne (ने)'],
  18: ['No (नो)', 'Yā (या)', 'Yī (यी)', 'Yū (यू)'],
  19: ['Ye (ये)', 'Yo (यो)', 'Bhā (भा)', 'Bhī (भी)'],
  20: ['Bhū (भू)', 'Dhā (धा)', 'Phā (फा)', 'Dhe (ढा/धे)'],
  21: ['Bhe (भे)', 'Bho (भो)', 'Jā (जा)', 'Jī (जी)'],
  22: ['Khī/Jū (खी/जू)', 'Khe/Je (खे/जे)', 'Kho/Jo (खो/जो)', 'Gā (गा)'],
  23: ['Gī (गी)', 'Gū (गू)', 'Ge (गे)', 'Go (गो)'],
  24: ['Sā (सा)', 'Sī (सी)', 'Sū (सू)', 'Se (से)'],
  25: ['So (सो)', 'Dā (दा)', 'Dī (दी)', 'Dū (दू)'],
  26: ['Dhu (दु)', 'Tha (थ)', 'Jha (झ)', 'Ña (ञ)'],
  27: ['De (दे)', 'Do (दो)', 'Cā (चा)', 'Cī (ची)'],
};

// --- Yoni Details (28 Nakshatra classification including Male/Female and Vaira Pairings) ---
interface YoniDetail {
  animal: string;
  gender: 'Male (नर)' | 'Female (मादा)';
  sanskrit: string;
  inimicalYoni: string;
  inimicalSanskrit: string;
}

export const NAKSHATRA_YONIS: Record<number, YoniDetail> = {
  1: { animal: 'Horse (Aśva)', gender: 'Male (नर)', sanskrit: 'अश्व (नर)', inimicalYoni: 'Buffalo (Mahiṣa)', inimicalSanskrit: 'महिष' },
  2: { animal: 'Elephant (Gaja)', gender: 'Male (नर)', sanskrit: 'गज (नर)', inimicalYoni: 'Lion (Siṃha)', inimicalSanskrit: 'सिंह' },
  3: { animal: 'Sheep / Ram (Meṣa)', gender: 'Female (मादा)', sanskrit: 'मेष (मादा)', inimicalYoni: 'Monkey (Vānara)', inimicalSanskrit: 'वानर' },
  4: { animal: 'Serpent (Sarpa)', gender: 'Male (नर)', sanskrit: 'सर्प (नर)', inimicalYoni: 'Mongoose (Nakula)', inimicalSanskrit: 'नकुल' },
  5: { animal: 'Serpent (Sarpa)', gender: 'Female (मादा)', sanskrit: 'सर्प (मादा)', inimicalYoni: 'Mongoose (Nakula)', inimicalSanskrit: 'नकुल' },
  6: { animal: 'Dog (Śvāna)', gender: 'Female (मादा)', sanskrit: 'श्वान (मादा)', inimicalYoni: 'Deer (Mṛga)', inimicalSanskrit: 'मृग' },
  7: { animal: 'Cat (Mārjāra)', gender: 'Female (मादा)', sanskrit: 'मार्जार (मादा)', inimicalYoni: 'Rat (Mūṣaka)', inimicalSanskrit: 'मूषक' },
  8: { animal: 'Sheep / Goat (Aja/Meṣa)', gender: 'Male (नर)', sanskrit: 'मेष (नर)', inimicalYoni: 'Monkey (Vānara)', inimicalSanskrit: 'वानर' },
  9: { animal: 'Cat (Mārjāra)', gender: 'Male (नर)', sanskrit: 'मार्जार (नर)', inimicalYoni: 'Rat (Mūṣaka)', inimicalSanskrit: 'मूषक' },
  10: { animal: 'Rat (Mūṣaka)', gender: 'Male (नर)', sanskrit: 'मूषक (नर)', inimicalYoni: 'Cat (Mārjāra)', inimicalSanskrit: 'मार्जार' },
  11: { animal: 'Rat (Mūṣaka)', gender: 'Female (मादा)', sanskrit: 'मूषक (मादा)', inimicalYoni: 'Cat (Mārjāra)', inimicalSanskrit: 'मार्जार' },
  12: { animal: 'Cow / Bull (Gau)', gender: 'Male (नर)', sanskrit: 'गौ / वृषभ (नर)', inimicalYoni: 'Tiger (Vyāghra)', inimicalSanskrit: 'व्याघ्र' },
  13: { animal: 'Buffalo (Mahiṣa)', gender: 'Female (मादा)', sanskrit: 'महिष (मादा)', inimicalYoni: 'Horse (Aśva)', inimicalSanskrit: 'अश्व' },
  14: { animal: 'Tiger (Vyāghra)', gender: 'Female (मादा)', sanskrit: 'व्याघ्र (मादा)', inimicalYoni: 'Cow (Gau)', inimicalSanskrit: 'गौ' },
  15: { animal: 'Buffalo (Mahiṣa)', gender: 'Male (नर)', sanskrit: 'महिष (नर)', inimicalYoni: 'Horse (Aśva)', inimicalSanskrit: 'अश्व' },
  16: { animal: 'Tiger (Vyāghra)', gender: 'Male (नर)', sanskrit: 'व्याघ्र (नर)', inimicalYoni: 'Cow (Gau)', inimicalSanskrit: 'गौ' },
  17: { animal: 'Deer (Mṛga)', gender: 'Female (मादा)', sanskrit: 'मृग (मादा)', inimicalYoni: 'Dog (Śvāna)', inimicalSanskrit: 'श्वान' },
  18: { animal: 'Deer (Mṛga)', gender: 'Male (नर)', sanskrit: 'मृग (नर)', inimicalYoni: 'Dog (Śvāna)', inimicalSanskrit: 'श्वान' },
  19: { animal: 'Dog (Śvāna)', gender: 'Male (नर)', sanskrit: 'श्वान (नर)', inimicalYoni: 'Deer (Mṛga)', inimicalSanskrit: 'मृग' },
  20: { animal: 'Monkey (Vānara)', gender: 'Male (नर)', sanskrit: 'वानर (नर)', inimicalYoni: 'Sheep (Meṣa)', inimicalSanskrit: 'मेष' },
  21: { animal: 'Mongoose (Nakula)', gender: 'Male (नर)', sanskrit: 'नकुल (नर)', inimicalYoni: 'Serpent (Sarpa)', inimicalSanskrit: 'सर्प' },
  22: { animal: 'Monkey (Vānara)', gender: 'Female (मादा)', sanskrit: 'वानर (मादा)', inimicalYoni: 'Sheep (Meṣa)', inimicalSanskrit: 'मेष' },
  23: { animal: 'Lion (Siṃha)', gender: 'Female (मादा)', sanskrit: 'सिंह (मादा)', inimicalYoni: 'Elephant (Gaja)', inimicalSanskrit: 'गज' },
  24: { animal: 'Horse (Aśva)', gender: 'Female (मादा)', sanskrit: 'अश्व (मादा)', inimicalYoni: 'Buffalo (Mahiṣa)', inimicalSanskrit: 'महिष' },
  25: { animal: 'Lion (Siṃha)', gender: 'Male (नर)', sanskrit: 'सिंह (नर)', inimicalYoni: 'Elephant (Gaja)', inimicalSanskrit: 'गज' },
  26: { animal: 'Cow (Gau)', gender: 'Female (मादा)', sanskrit: 'गौ (मादा)', inimicalYoni: 'Tiger (Vyāghra)', inimicalSanskrit: 'व्याघ्र' },
  27: { animal: 'Elephant (Gaja)', gender: 'Female (मादा)', sanskrit: 'गज (मादा)', inimicalYoni: 'Lion (Siṃha)', inimicalSanskrit: 'सिंह' },
};

// --- Rajju Mapping (Foot, Waist, Navel, Neck, Head) ---
export const NAKSHATRA_RAJJUS: Record<number, { type: RajjuType; limb: string; sanskrit: string }> = {
  1: { type: 'Pāda / Foot (पाद)', limb: 'Feet (Pāda)', sanskrit: 'पाद रज्जु' },
  2: { type: 'Kaṭi / Waist (कटि)', limb: 'Waist (Kaṭi)', sanskrit: 'कटि रज्जु' },
  3: { type: 'Nābhi / Navel (नाभि)', limb: 'Navel (Nābhi / Udara)', sanskrit: 'नाभि रज्जु' },
  4: { type: 'Kaṇṭha / Neck (कण्ठ)', limb: 'Neck (Kaṇṭha)', sanskrit: 'कण्ठ रज्जु' },
  5: { type: 'Śiro / Head (शिरो)', limb: 'Head (Śiro)', sanskrit: 'शिरो रज्जु' },
  6: { type: 'Kaṇṭha / Neck (कण्ठ)', limb: 'Neck (Kaṇṭha)', sanskrit: 'कण्ठ रज्जु' },
  7: { type: 'Nābhi / Navel (नाभि)', limb: 'Navel (Nābhi / Udara)', sanskrit: 'नाभि रज्जु' },
  8: { type: 'Kaṭi / Waist (कटि)', limb: 'Waist (Kaṭi)', sanskrit: 'कटि रज्जु' },
  9: { type: 'Pāda / Foot (पाद)', limb: 'Feet (Pāda)', sanskrit: 'पाद रज्जु' },
  10: { type: 'Pāda / Foot (पाद)', limb: 'Feet (Pāda)', sanskrit: 'पाद रज्जु' },
  11: { type: 'Kaṭi / Waist (कटि)', limb: 'Waist (Kaṭi)', sanskrit: 'कटि रज्जु' },
  12: { type: 'Nābhi / Navel (नाभि)', limb: 'Navel (Nābhi / Udara)', sanskrit: 'नाभि रज्जु' },
  13: { type: 'Kaṇṭha / Neck (कण्ठ)', limb: 'Neck (Kaṇṭha)', sanskrit: 'कण्ठ रज्जु' },
  14: { type: 'Śiro / Head (शिरो)', limb: 'Head (Śiro)', sanskrit: 'शिरो रज्जु' },
  15: { type: 'Kaṇṭha / Neck (कण्ठ)', limb: 'Neck (Kaṇṭha)', sanskrit: 'कण्ठ रज्जु' },
  16: { type: 'Nābhi / Navel (नाभि)', limb: 'Navel (Nābhi / Udara)', sanskrit: 'नाभि रज्जु' },
  17: { type: 'Kaṭi / Waist (कटि)', limb: 'Waist (Kaṭi)', sanskrit: 'कटि रज्जु' },
  18: { type: 'Pāda / Foot (पाद)', limb: 'Feet (Pāda)', sanskrit: 'पाद रज्जु' },
  19: { type: 'Pāda / Foot (पाद)', limb: 'Feet (Pāda)', sanskrit: 'पाद रज्जु' },
  20: { type: 'Kaṭi / Waist (कटि)', limb: 'Waist (Kaṭi)', sanskrit: 'कटि रज्जु' },
  21: { type: 'Nābhi / Navel (नाभि)', limb: 'Navel (Nābhi / Udara)', sanskrit: 'नाभि रज्जु' },
  22: { type: 'Kaṇṭha / Neck (कण्ठ)', limb: 'Neck (Kaṇṭha)', sanskrit: 'कण्ठ रज्जु' },
  23: { type: 'Śiro / Head (शिरो)', limb: 'Head (Śiro)', sanskrit: 'शिरो रज्जु' },
  24: { type: 'Kaṇṭha / Neck (कण्ठ)', limb: 'Neck (Kaṇṭha)', sanskrit: 'कण्ठ रज्जु' },
  25: { type: 'Nābhi / Navel (नाभि)', limb: 'Navel (Nābhi / Udara)', sanskrit: 'नाभि रज्जु' },
  26: { type: 'Kaṭi / Waist (कटि)', limb: 'Waist (Kaṭi)', sanskrit: 'कटि रज्जु' },
  27: { type: 'Pāda / Foot (पाद)', limb: 'Feet (Pāda)', sanskrit: 'पाद रज्जु' },
};

// --- Vihaga (5 Birds of Avakahada) ---
export function getNakshatraVihaga(nakNumber: number): { type: VihagaType; bird: string; sanskrit: string } {
  if (nakNumber >= 1 && nakNumber <= 5) {
    return { type: 'Bheruṇḍa / Falcon (गिद्ध / भेरुण्ड)', bird: 'Bheruṇḍa (Vulture / Falcon)', sanskrit: 'भेरुण्ड (गृद्ध)' };
  } else if (nakNumber >= 6 && nakNumber <= 11) {
    return { type: 'Ulūka / Owl (उल्लू)', bird: 'Ulūka (Owl)', sanskrit: 'उलूक' };
  } else if (nakNumber >= 12 && nakNumber <= 17) {
    return { type: 'Kāka / Crow (कौआ)', bird: 'Kāka (Crow)', sanskrit: 'काक' };
  } else if (nakNumber >= 18 && nakNumber <= 22) {
    return { type: 'Kukkuṭa / Cock (कुक्कुट)', bird: 'Kukkuṭa (Rooster / Cock)', sanskrit: 'कुक्कुट' };
  } else {
    return { type: 'Mayūra / Peacock (मयूर)', bird: 'Mayūra (Peacock)', sanskrit: 'मयूर' };
  }
}

// --- Vedha Nakshatras (Mutual piercing pairs) ---
export const NAKSHATRA_VEDHA_PAIRS: Record<number, number> = {
  1: 18, 18: 1,   // Asvini <-> Jyeshtha
  2: 17, 17: 2,   // Bharani <-> Anuradha
  3: 16, 16: 3,   // Krittika <-> Visakha
  4: 15, 15: 4,   // Rohini <-> Swati
  6: 22, 22: 6,   // Ardra <-> Sravana
  7: 21, 21: 7,   // Punarvasu <-> Uttarasadha
  8: 20, 20: 8,   // Pushya <-> Purvasadha
  9: 19, 19: 9,   // Aslesha <-> Mula
  10: 27, 27: 10, // Magha <-> Revati
  11: 26, 26: 11, // Purvaphalguni <-> Uttarabhadra
  12: 25, 25: 12, // Uttaraphalguni <-> Purvabhadra
  13: 24, 24: 13, // Hasta <-> Shatabhisha
  5: 14, 14: 23, 23: 5, // Mrigasira <-> Chitra <-> Dhanishtha tripod
};

// --- Yunja (Purva, Madhya, Uttara) ---
export function getNakshatraYunja(nakNumber: number): { type: YunjaType; sanskrit: string } {
  if (nakNumber <= 8) {
    return { type: 'Pūrva (पूर्व)', sanskrit: 'पूर्व युञ्ज' };
  } else if (nakNumber <= 17) {
    return { type: 'Madhya (मध्य)', sanskrit: 'मध्य युञ्ज' };
  } else {
    return { type: 'Uttara (उत्तर)', sanskrit: 'उत्तर युञ्ज' };
  }
}

// --- Gotra (7 Saptarṣi Prajāpatis) ---
export const NAKSHATRA_GOTRAS: Record<number, { rishi: string; sanskrit: string }> = {
  1: { rishi: 'Marīci (मरीचि)', sanskrit: 'मरीचि गोत्र' },
  8: { rishi: 'Marīci (मरीचि)', sanskrit: 'मरीचि गोत्र' },
  15: { rishi: 'Marīci (मरीचि)', sanskrit: 'मरीचि गोत्र' },
  22: { rishi: 'Marīci (मरीचि)', sanskrit: 'मरीचि गोत्र' },

  2: { rishi: 'Atri (अत्रि)', sanskrit: 'अत्रि गोत्र' },
  9: { rishi: 'Atri (अत्रि)', sanskrit: 'अत्रि गोत्र' },
  16: { rishi: 'Atri (अत्रि)', sanskrit: 'अत्रि गोत्र' },
  23: { rishi: 'Atri (अत्रि)', sanskrit: 'अत्रि गोत्र' },

  3: { rishi: 'Aṅgiras (अङ्गिरा)', sanskrit: 'अङ्गिरा गोत्र' },
  10: { rishi: 'Aṅgiras (अङ्गिरा)', sanskrit: 'अङ्गिरा गोत्र' },
  17: { rishi: 'Aṅgiras (अङ्गिरा)', sanskrit: 'अङ्गिरा गोत्र' },
  24: { rishi: 'Aṅgiras (अङ्गिरा)', sanskrit: 'अङ्गिरा गोत्र' },

  4: { rishi: 'Pulastya (पुलस्त्य)', sanskrit: 'पुलस्त्य गोत्र' },
  11: { rishi: 'Pulastya (पुलस्त्य)', sanskrit: 'पुलस्त्य गोत्र' },
  18: { rishi: 'Pulastya (पुलस्त्य)', sanskrit: 'पुलस्त्य गोत्र' },
  25: { rishi: 'Pulastya (पुलस्त्य)', sanskrit: 'पुलस्त्य गोत्र' },

  5: { rishi: 'Pulaha (पुलह)', sanskrit: 'पुलह गोत्र' },
  12: { rishi: 'Pulaha (पुलह)', sanskrit: 'पुलह गोत्र' },
  19: { rishi: 'Pulaha (पुलह)', sanskrit: 'पुलह गोत्र' },
  26: { rishi: 'Pulaha (पुलह)', sanskrit: 'पुलह गोत्र' },

  6: { rishi: 'Kratu (क्रतु)', sanskrit: 'क्रतु गोत्र' },
  13: { rishi: 'Kratu (क्रतु)', sanskrit: 'क्रतु गोत्र' },
  20: { rishi: 'Kratu (क्रतु)', sanskrit: 'क्रतु गोत्र' },
  27: { rishi: 'Kratu (क्रतु)', sanskrit: 'क्रतु गोत्र' },

  7: { rishi: 'Vasiṣṭha (वसिष्ठ)', sanskrit: 'वसिष्ठ गोत्र' },
  14: { rishi: 'Vasiṣṭha (वसिष्ठ)', sanskrit: 'वसिष्ठ गोत्र' },
  21: { rishi: 'Vasiṣṭha (वसिष्ठ)', sanskrit: 'वसिष्ठ गोत्र' },
};

// --- Vṛkṣa (Sacred Trees) ---
export const NAKSHATRA_VRIKSHAS: Record<number, { treeName: string; botanicalName: string; sanskrit: string }> = {
  1: { treeName: 'Kuccila / Nux-vomica', botanicalName: 'Strychnos nux-vomica', sanskrit: 'कुचिला' },
  2: { treeName: 'Āmalakī (Indian Gooseberry)', botanicalName: 'Phyllanthus emblica', sanskrit: 'आमलकी (आँवला)' },
  3: { treeName: 'Udumbara (Gular Fig)', botanicalName: 'Ficus glomerata', sanskrit: 'उदुम्बर (गूलर)' },
  4: { treeName: 'Jambu (Black Plum)', botanicalName: 'Syzygium cumini', sanskrit: 'जम्बू (जामुन)' },
  5: { treeName: 'Khadira (Cutch Tree)', botanicalName: 'Acacia catechu', sanskrit: 'खदिर (खैर)' },
  6: { treeName: 'Kṛṣṇāgaru (Agarwood)', botanicalName: 'Aquilaria agallocha', sanskrit: 'कृष्णागरु' },
  7: { treeName: 'Vaṃśa (Bamboo)', botanicalName: 'Bambusa arundinacea', sanskrit: 'वंश (बाँस)' },
  8: { treeName: 'Aśvattha (Sacred Peepal)', botanicalName: 'Ficus religiosa', sanskrit: 'अश्वत्थ (पीपल)' },
  9: { treeName: 'Nāgakeśara (Cobra Saffron)', botanicalName: 'Mesua ferrea', sanskrit: 'नागकेसर' },
  10: { treeName: 'Vaṭa (Banyan Tree)', botanicalName: 'Ficus benghalensis', sanskrit: 'वट (बरगद)' },
  11: { treeName: 'Palāśa (Flame of Forest)', botanicalName: 'Butea monosperma', sanskrit: 'पलाश (ढाक)' },
  12: { treeName: 'Plakṣa (Pakur Tree)', botanicalName: 'Ficus microcarpa', sanskrit: 'प्लक्ष (पाकड़)' },
  13: { treeName: 'Ariṣṭa / Pūtrañjīva', botanicalName: 'Putranjiva roxburghii', sanskrit: 'रीठा / पुत्रञ्जीव' },
  14: { treeName: 'Bilva (Sacred Bael)', botanicalName: 'Aegle marmelos', sanskrit: 'बिल्व (बेल)' },
  15: { treeName: 'Arjuna Tree', botanicalName: 'Terminalia arjuna', sanskrit: 'अर्जुन' },
  16: { treeName: 'Vikankata / Bakula', botanicalName: 'Flacourtia indica', sanskrit: 'विकंकत' },
  17: { treeName: 'Bakula / Maulsari', botanicalName: 'Mimusops elengi', sanskrit: 'बकुल (मौलसिरी)' },
  18: { treeName: 'Śālmali (Silk Cotton)', botanicalName: 'Bombax ceiba', sanskrit: 'शाल्मली (सेमल)' },
  19: { treeName: 'Sarja / Rāla (Sal Tree)', botanicalName: 'Shorea robusta', sanskrit: 'सर्ज / शाल' },
  20: { treeName: 'Vanjula / Aśoka', botanicalName: 'Saraca asoca', sanskrit: 'अशोक' },
  21: { treeName: 'Panasa (Jackfruit)', botanicalName: 'Artocarpus heterophyllus', sanskrit: 'पनस (कटहल)' },
  22: { treeName: 'Arka (Madar / Crown Flower)', botanicalName: 'Calotropis gigantea', sanskrit: 'अर्क (मदार)' },
  23: { treeName: 'Śamī / Khejri', botanicalName: 'Prosopis cineraria', sanskrit: 'शमी (खेजड़ी)' },
  24: { treeName: 'Kadamba', botanicalName: 'Neolamarckia cadamba', sanskrit: 'कदम्ब' },
  25: { treeName: 'Āmra (Mango Tree)', botanicalName: 'Mangifera indica', sanskrit: 'आम्र (आम)' },
  26: { treeName: 'Nīma (Margosa)', botanicalName: 'Azadirachta indica', sanskrit: 'निम्ब (नीम)' },
  27: { treeName: 'Mahuvā / Madhuca', botanicalName: 'Madhuca longifolia', sanskrit: 'मधूक (महुआ)' },
};

// --- Planetary Sanskrit Names Helper ---
const PLANET_SANSKRIT: Record<PlanetId, string> = {
  sun: 'Sūrya (सूर्य)',
  moon: 'Candra (चन्द्र)',
  mars: 'Maṅgala (मङ्गल)',
  mercury: 'Budha (बुध)',
  jupiter: 'Bṛhaspati / Guru (गुरु)',
  venus: 'Śukra (शुक्र)',
  saturn: 'Śani (शनि)',
  rahu: 'Rāhu (राहु)',
  ketu: 'Ketu (केतु)',
  true_rahu: 'True Rāhu (राहु)',
  true_ketu: 'True Ketu (केतु)',
};

/**
 * Main Deterministic Avakahada Chakra Calculation Function
 */
export function calculateAvakahadaChakra(chart: JyotishaChart): AvakahadaChakraResult {
  const moon = chart.planets.moon;
  const sun = chart.planets.sun;
  const lagna = chart.lagna;
  const moonRashiNum = moon.rashiNumber;
  const lagnaRashiNum = lagna.rashiNumber;
  const sunRashiNum = sun.rashiNumber;

  // 1. Lagna Info
  const lagnaRashiInfo = RASHIS[lagnaRashiNum];
  const lagnaLord = lagnaRashiInfo.lord;
  const lagnaDegreeFormatted = lagna.degreeStr || `${lagna.degreeInRashi.toFixed(2)}°`;

  // 2. Moon Rashi Info
  const moonRashiInfo = RASHIS[moonRashiNum];
  const moonLord = moonRashiInfo.lord;
  const moonDegInRashi = `${Math.floor(moon.longitudeInRashi)}° ${Math.floor((moon.longitudeInRashi % 1) * 60)}' ${Math.floor((((moon.longitudeInRashi % 1) * 60) % 1) * 60)}"`;
  const moonTotalDeg = `${Math.floor(moon.siderealLongitude)}° ${Math.floor((moon.siderealLongitude % 1) * 60)}' ${Math.floor((((moon.siderealLongitude % 1) * 60) % 1) * 60)}"`;

  // 3. Sun Sign Info
  const sunRashiInfo = RASHIS[sunRashiNum];
  const sunLord = sunRashiInfo.lord;
  const sunDegInRashi = `${Math.floor(sun.longitudeInRashi)}° ${Math.floor((sun.longitudeInRashi % 1) * 60)}' ${Math.floor((((sun.longitudeInRashi % 1) * 60) % 1) * 60)}"`;

  // 4. Janma Nakshatra & Pada
  const nakIndex = Math.floor(moon.siderealLongitude / (360 / 27));
  const nakNumber = (nakIndex % 27) + 1;
  const nakInfo = NAKSHATRAS[nakIndex] || NAKSHATRAS[0];
  const nakDegreeStart = (nakNumber - 1) * (360 / 27);
  const moonDegInNak = moon.siderealLongitude - nakDegreeStart;
  const padaNum = (Math.min(4, Math.max(1, Math.floor(moonDegInNak / (360 / 108)) + 1)) as 1 | 2 | 3 | 4);
  const padaLordId = nakInfo.padaLords[padaNum - 1] || 'mars';

  // 5. Namakshara (108 Syllable)
  const syllables = NAKSHATRA_NAMAKSHARAS[nakNumber] || ['A (अ)', 'I (इ)', 'U (उ)', 'E (ए)'];
  const fullDisplay = syllables[padaNum - 1] || syllables[0];
  const parenMatch = fullDisplay.match(/^(.*?)\s*\((.*?)\)$/);
  const iast = parenMatch ? parenMatch[1].trim() : fullDisplay;
  const devanagariSyllable = parenMatch ? parenMatch[2].trim() : fullDisplay;

  // 6. Pāya (Metal foot of birth based on Moon's House from Lagna)
  const houseFromLagna = ((moonRashiNum - lagnaRashiNum + 12) % 12) + 1;
  let payaType: PayaType;
  let payaMetal: string;
  let payaResult: string;
  let payaSanskritPhala: string;

  if (houseFromLagna === 1 || houseFromLagna === 6 || houseFromLagna === 11) {
    payaType = 'Suvarṇa (Gold / स्वर्ण)';
    payaMetal = 'Gold (Suvarṇa / सोना)';
    payaResult = 'Efforts & Transformation initially, high status, perseverance rewarded';
    payaSanskritPhala = 'कर्कश / श्रमसाध्य (आद्य कष्ट, उत्तरार्ध लाभ)';
  } else if (houseFromLagna === 2 || houseFromLagna === 5 || houseFromLagna === 9) {
    payaType = 'Rajata (Silver / रजत)';
    payaMetal = 'Silver (Rajata / चाँदी)';
    payaResult = 'Parama Śubha: Highly auspicious, physical ease, wealth, honor, contentment';
    payaSanskritPhala = 'परम शुभ / सौख्य (धन-धान्य, ऐश्वर्य, सर्वतोमुख वृद्धि)';
  } else if (houseFromLagna === 3 || houseFromLagna === 7 || houseFromLagna === 10) {
    payaType = 'Tāmra (Copper / ताम्र)';
    payaMetal = 'Copper (Tāmra / ताँबा)';
    payaResult = 'Śubha: Courage, success in undertakings, enterprising growth, victory';
    payaSanskritPhala = 'शुभ / जय (उद्यम, विजय, पुरुषार्थ, कीर्ति)';
  } else {
    // 4, 8, 12
    payaType = 'Loha (Iron / लोह)';
    payaMetal = 'Iron (Loha / लोहा)';
    payaResult = 'Requires steadfast perseverance, overcoming obstacles, karmic discipline';
    payaSanskritPhala = 'कष्टसाध्य / धैर्य (परिश्रम, संघर्ष, संयम)';
  }

  // 7. Varṇa (Based on Moon Sign Element)
  let varnaType: VarnaType;
  let varnaCategory: string;
  let varnaSanskrit: string;
  let varnaElement: string;

  if (moonRashiNum === 4 || moonRashiNum === 8 || moonRashiNum === 12) {
    varnaType = 'Brāhmaṇa (ब्राह्मण)';
    varnaCategory = 'Brāhmaṇa (Priestly / Scholarly / Intuitive)';
    varnaSanskrit = 'ब्राह्मण वर्ण';
    varnaElement = 'Water (Jala Tattva)';
  } else if (moonRashiNum === 1 || moonRashiNum === 5 || moonRashiNum === 9) {
    varnaType = 'Kṣatriya (क्षत्रिय)';
    varnaCategory = 'Kṣatriya (Leadership / Valor / Governance)';
    varnaSanskrit = 'क्षत्रिय वर्ण';
    varnaElement = 'Fire (Agni Tattva)';
  } else if (moonRashiNum === 2 || moonRashiNum === 6 || moonRashiNum === 10) {
    varnaType = 'Vaiśya (वैश्य)';
    varnaCategory = 'Vaiśya (Commercial / Productive / Pragmatic)';
    varnaSanskrit = 'वैश्य वर्ण';
    varnaElement = 'Earth (Pṛthvī Tattva)';
  } else {
    varnaType = 'Śūdra (शूद्र)';
    varnaCategory = 'Śūdra (Artisanship / Dedicated Service / Craft)';
    varnaSanskrit = 'शूद्र वर्ण';
    varnaElement = 'Air (Vāyu Tattva)';
  }

  // 8. Vaśya (Attractability / Nature by Sign & Span)
  let vashyaType: VashyaType;
  let vashyaCategory: string;
  let vashyaSanskrit: string;
  let vashyaDesc: string;

  const degInRashi = moon.longitudeInRashi;

  if (
    moonRashiNum === 1 ||
    moonRashiNum === 2 ||
    (moonRashiNum === 9 && degInRashi >= 15) ||
    (moonRashiNum === 10 && degInRashi < 15)
  ) {
    vashyaType = 'Catuṣpāda (चतुष्पाद)';
    vashyaCategory = 'Catuṣpāda (Quadruped / Four-Footed)';
    vashyaSanskrit = 'चतुष्पाद वश्य';
    vashyaDesc = 'Steadfast, loyal, sturdy nature, strong animal magnetism';
  } else if (
    moonRashiNum === 3 ||
    moonRashiNum === 6 ||
    moonRashiNum === 7 ||
    moonRashiNum === 11 ||
    (moonRashiNum === 9 && degInRashi < 15)
  ) {
    vashyaType = 'Dvipada / Mānava (द्विपद)';
    vashyaCategory = 'Dvipada / Mānava (Human / Biped)';
    vashyaSanskrit = 'द्विपद / मानव वश्य';
    vashyaDesc = 'Rational, intellectual, communicative, social diplomacy';
  } else if (
    moonRashiNum === 4 ||
    moonRashiNum === 12 ||
    (moonRashiNum === 10 && degInRashi >= 15)
  ) {
    vashyaType = 'Jalacara (जलचर)';
    vashyaCategory = 'Jalacara (Water-Dwelling / Aquatic)';
    vashyaSanskrit = 'जलचर वश्य';
    vashyaDesc = 'Fluid, intuitive, adaptable, emotional depth';
  } else if (moonRashiNum === 5) {
    vashyaType = 'Vanacara (वनचर)';
    vashyaCategory = 'Vanacara / Siṃha (Wild / Regal)';
    vashyaSanskrit = 'वनचर / सिंह वश्य';
    vashyaDesc = 'Independent, majestic, dominant presence';
  } else {
    // 8 Scorpio
    vashyaType = 'Kīṭa (कीट)';
    vashyaCategory = 'Kīṭa (Insect / Scorpion / Centipede)';
    vashyaSanskrit = 'कीट वश्य';
    vashyaDesc = 'Intense, secretive, resilient, protective boundary';
  }

  // 9. Yoni (28-class animal mapping)
  const yoniDetail = NAKSHATRA_YONIS[nakNumber] || {
    animal: 'Horse (Aśva)',
    gender: 'Male (नर)',
    sanskrit: 'अश्व (नर)',
    inimicalYoni: 'Buffalo (Mahiṣa)',
    inimicalSanskrit: 'महिष',
  };

  // 10. Gaṇa
  const ganaStr = nakInfo.gana;
  const ganaType: GanaType =
    ganaStr === 'Deva'
      ? 'Deva (देव)'
      : ganaStr === 'Rakshasa'
      ? 'Rakshasa (राक्षस)'
      : 'Manushya (मनुष्य)';
  const ganaTemperament =
    ganaStr === 'Deva'
      ? 'Virtuous, philanthropic, dignified, elevated ideals'
      : ganaStr === 'Rakshasa'
      ? 'Courageous, assertive, fiercely independent, unyielding'
      : 'Harmonious, industrious, balanced worldly nature';

  // 11. Nāḍī
  const nadiStr = nakInfo.nadi;
  const nadiType: NadiType =
    nadiStr === 'Adi'
      ? 'Ādi / Vāta (आदि - वात)'
      : nadiStr === 'Madhya'
      ? 'Madhya / Pitta (मध्य - पित्त)'
      : 'Antya / Kapha (अन्त्य - कफ)';
  const nadiHumor =
    nadiStr === 'Adi'
      ? 'Vata (Wind)'
      : nadiStr === 'Madhya'
      ? 'Pitta (Bile)'
      : 'Kapha (Phlegm)';

  // 12. Rajju
  const rajjuInfo = NAKSHATRA_RAJJUS[nakNumber] || {
    type: 'Pāda / Foot (पाद)' as RajjuType,
    limb: 'Feet (Pāda)',
    sanskrit: 'पाद रज्जु',
  };

  // 13. Tattva (Element of Moon Sign & Ruling Lord)
  let tattvaType: TattvaType;
  let tattvaLordId: PlanetId;
  let tattvaSanskrit: string;

  if (moonRashiNum === 1 || moonRashiNum === 5 || moonRashiNum === 9) {
    tattvaType = 'Agni (Fire / अग्नि)';
    tattvaLordId = 'mars';
    tattvaSanskrit = 'अग्नि तत्त्व (भौम/सूर्य)';
  } else if (moonRashiNum === 2 || moonRashiNum === 6 || moonRashiNum === 10) {
    tattvaType = 'Pṛthvī (Earth / पृथ्वी)';
    tattvaLordId = 'mercury';
    tattvaSanskrit = 'पृथ्वी तत्त्व (बुध)';
  } else if (moonRashiNum === 3 || moonRashiNum === 7 || moonRashiNum === 11) {
    tattvaType = 'Vāyu (Air / वायु)';
    tattvaLordId = 'saturn';
    tattvaSanskrit = 'वायु तत्त्व (शनि)';
  } else {
    tattvaType = 'Jala (Water / जल)';
    tattvaLordId = 'venus';
    tattvaSanskrit = 'जल तत्त्व (शुक्र/चन्द्र)';
  }

  // 14. Vihaga (5 Birds)
  const vihagaInfo = getNakshatraVihaga(nakNumber);

  // 15. Vedha
  const afflictingNakNum = NAKSHATRA_VEDHA_PAIRS[nakNumber] || ((nakNumber + 13) % 27) + 1;
  const afflictingNakInfo = NAKSHATRAS[afflictingNakNum - 1] || NAKSHATRAS[0];

  // 16. Yunja & Gotra & Vriksha
  const yunjaInfo = getNakshatraYunja(nakNumber);
  const gotraInfo = NAKSHATRA_GOTRAS[nakNumber] || { rishi: 'Marīci (मरीचि)', sanskrit: 'मरीचि गोत्र' };
  const vrikshaInfo = NAKSHATRA_VRIKSHAS[nakNumber] || {
    treeName: 'Aśvattha',
    botanicalName: 'Ficus religiosa',
    sanskrit: 'अश्वत्थ',
  };

  // 17. Tithi Class & Saṃjñā
  const tithiNum = chart.panchanga?.tithi?.number || 1;
  const tithiIndex1To15 = ((tithiNum - 1) % 15) + 1;
  let tithiClass: TithiClassType;
  let tithiClassDeity: string;
  let tithiClassLord: string;

  if (tithiIndex1To15 === 1 || tithiIndex1To15 === 6 || tithiIndex1To15 === 11) {
    tithiClass = 'Nandā (नन्दा)';
    tithiClassDeity = 'Agni (Fire)';
    tithiClassLord = 'Venus (Śukra)';
  } else if (tithiIndex1To15 === 2 || tithiIndex1To15 === 7 || tithiIndex1To15 === 12) {
    tithiClass = 'Bhadrā (भद्रा)';
    tithiClassDeity = 'Brahmā';
    tithiClassLord = 'Mercury (Budha)';
  } else if (tithiIndex1To15 === 3 || tithiIndex1To15 === 8 || tithiIndex1To15 === 13) {
    tithiClass = 'Jayā (जया)';
    tithiClassDeity = 'Viṣṇu / Kārttikeya';
    tithiClassLord = 'Mars (Maṅgala)';
  } else if (tithiIndex1To15 === 4 || tithiIndex1To15 === 9 || tithiIndex1To15 === 14) {
    tithiClass = 'Riktā (रिक्ता)';
    tithiClassDeity = 'Yama / Durgā';
    tithiClassLord = 'Saturn (Śani)';
  } else {
    tithiClass = 'Pūrṇā (पूर्णा)';
    tithiClassDeity = 'Moon (Soma) / Sun';
    tithiClassLord = 'Jupiter (Guru)';
  }

  // 18. Bhayāt and Bhābhoga
  // Total span of nakshatra is 13° 20' = 800' arc minutes = 13.333333 degrees = 60 Ghatis canonical
  const nakTotalSpanDeg = 360 / 27; // 13.333333333333334
  const elapsedDegInNak = Math.max(0, Math.min(nakTotalSpanDeg, moonDegInNak));
  const fractionElapsed = elapsedDegInNak / nakTotalSpanDeg;

  // Bhayāt in Ghaṭī-Pala
  const bhayatTotalGhatis = fractionElapsed * 60.0;
  const bhayatGhatis = Math.floor(bhayatTotalGhatis);
  const bhayatPalasRem = (bhayatTotalGhatis - bhayatGhatis) * 60;
  const bhayatPalas = Math.floor(bhayatPalasRem);
  const bhayatVipalas = Math.floor((bhayatPalasRem - bhayatPalas) * 60);

  const bhayatElapsedMins = elapsedDegInNak * 60;
  const bhayatDegPart = Math.floor(elapsedDegInNak);
  const bhayatMinPart = Math.floor((elapsedDegInNak % 1) * 60);
  const bhayatSecPart = Math.floor((((elapsedDegInNak % 1) * 60) % 1) * 60);

  // Bhābhoga (Total Nakshatra duration in standard Ghatis & arc)
  const bhabhogaGhatis = 60;
  const bhabhogaPalas = 0;

  // 19. Daśā Balance
  const dashaBalance = chart.vimshottari?.balanceAtBirth || {
    lord: nakInfo.lord,
    yearsRemaining: 0,
    percentRemaining: 0,
  };
  const dashaLordId = dashaBalance.lord;
  const dashaLordInfo = PLANET_SANSKRIT[dashaLordId] || 'Sūrya';
  const yearsRemaining = dashaBalance.yearsRemaining;
  const wholeYears = Math.floor(yearsRemaining);
  const monthsRem = (yearsRemaining - wholeYears) * 12;
  const wholeMonths = Math.floor(monthsRem);
  const daysRem = Math.floor((monthsRem - wholeMonths) * 30);

  return {
    lagna: {
      rashiNumber: lagnaRashiNum,
      name: lagnaRashiInfo.name,
      sanskritName: lagnaRashiInfo.sanskritName,
      devanagari: lagnaRashiInfo.devanagari,
      degreeFormatted: lagnaDegreeFormatted,
      lordId: lagnaLord,
      lordName: lagnaLord.charAt(0).toUpperCase() + lagnaLord.slice(1),
      lordSanskrit: PLANET_SANSKRIT[lagnaLord] || lagnaLord,
      nakshatraName: lagna.nakshatraName || 'Aśvinī',
      nakshatraPada: (lagna.pada as 1 | 2 | 3 | 4) || 1,
    },
    rashi: {
      rashiNumber: moonRashiNum,
      name: moonRashiInfo.name,
      sanskritName: moonRashiInfo.sanskritName,
      devanagari: moonRashiInfo.devanagari,
      degreeInRashi: moonDegInRashi,
      totalLongitude: moonTotalDeg,
      lordId: moonLord,
      lordName: moonLord.charAt(0).toUpperCase() + moonLord.slice(1),
      lordSanskrit: PLANET_SANSKRIT[moonLord] || moonLord,
    },
    sunSign: {
      rashiNumber: sunRashiNum,
      name: sunRashiInfo.name,
      sanskritName: sunRashiInfo.sanskritName,
      devanagari: sunRashiInfo.devanagari,
      degreeInRashi: sunDegInRashi,
      lordId: sunLord,
      lordName: sunLord.charAt(0).toUpperCase() + sunLord.slice(1),
      lordSanskrit: PLANET_SANSKRIT[sunLord] || sunLord,
    },
    nakshatra: {
      number: nakNumber,
      name: nakInfo.name,
      sanskritName: nakInfo.sanskritName,
      devanagari: nakInfo.devanagari,
      pada: padaNum,
      lordId: nakInfo.lord,
      lordName: nakInfo.lord.charAt(0).toUpperCase() + nakInfo.lord.slice(1),
      lordSanskrit: PLANET_SANSKRIT[nakInfo.lord] || nakInfo.lord,
      padaLordId,
      padaLordName: padaLordId.charAt(0).toUpperCase() + padaLordId.slice(1),
      deity: nakInfo.deity,
      symbol: (RASHIS[moonRashiNum]?.symbol || '').split(' ')[1] || 'Moon Star',
    },
    namakshara: {
      syllable: iast,
      devanagari: devanagariSyllable,
      iast,
      fullDisplay,
    },
    paya: {
      type: payaType,
      metal: payaMetal,
      houseFromLagna,
      result: payaResult,
      sanskritPhala: payaSanskritPhala,
    },
    varna: {
      type: varnaType,
      category: varnaCategory,
      sanskrit: varnaSanskrit,
      element: varnaElement,
    },
    vashya: {
      type: vashyaType,
      category: vashyaCategory,
      sanskrit: vashyaSanskrit,
      description: vashyaDesc,
    },
    yoni: {
      animal: yoniDetail.animal,
      gender: yoniDetail.gender,
      sanskrit: yoniDetail.sanskrit,
      inimicalYoni: yoniDetail.inimicalYoni,
      inimicalSanskrit: yoniDetail.inimicalSanskrit,
    },
    gana: {
      type: ganaType,
      sanskrit: ganaType.split(' ')[1] || 'देव',
      temperament: ganaTemperament,
    },
    nadi: {
      type: nadiType,
      humor: nadiHumor,
      sanskrit: nadiType.split(' ')[1] || 'आदि',
    },
    rajju: {
      type: rajjuInfo.type,
      limb: rajjuInfo.limb,
      sanskrit: rajjuInfo.sanskrit,
    },
    tattva: {
      type: tattvaType,
      lordId: tattvaLordId,
      lordName: tattvaLordId.charAt(0).toUpperCase() + tattvaLordId.slice(1),
      sanskrit: tattvaSanskrit,
    },
    vihaga: {
      type: vihagaInfo.type,
      bird: vihagaInfo.bird,
      sanskrit: vihagaInfo.sanskrit,
    },
    vedha: {
      afflictingNakshatraNumber: afflictingNakNum,
      afflictingNakshatraName: afflictingNakInfo.name,
      afflictingNakshatraSanskrit: afflictingNakInfo.sanskritName,
      pairText: `${nakInfo.name} ↔ ${afflictingNakInfo.name}`,
    },
    yunja: {
      type: yunjaInfo.type,
      sanskrit: yunjaInfo.sanskrit,
    },
    gotra: {
      rishi: gotraInfo.rishi,
      sanskrit: gotraInfo.sanskrit,
    },
    vriksha: {
      treeName: vrikshaInfo.treeName,
      botanicalName: vrikshaInfo.botanicalName,
      sanskrit: vrikshaInfo.sanskrit,
    },
    panchanga: {
      tithi: {
        number: chart.panchanga?.tithi?.number || 1,
        name: chart.panchanga?.tithi?.name || 'Pratipada',
        sanskrit: chart.panchanga?.tithi?.sanskritName || 'प्रतिपदा',
        paksha: chart.panchanga?.tithi?.paksha || 'Shukla',
        classType: tithiClass,
        classDeity: tithiClassDeity,
        classLord: tithiClassLord,
        tithiLord: chart.panchanga?.tithi?.deity || tithiClassLord,
        percentElapsed: `${(chart.panchanga?.tithi?.percentElapsed || 0).toFixed(1)}%`,
      },
      vara: {
        name: chart.panchanga?.vara?.name || 'Ravivara',
        sanskrit: chart.panchanga?.vara?.sanskritName || 'रविवार',
        lordName: chart.panchanga?.vara?.lord || 'sun',
        lordSanskrit: PLANET_SANSKRIT[chart.panchanga?.vara?.lord as PlanetId] || 'Sūrya',
      },
      yoga: {
        number: chart.panchanga?.yoga?.number || 1,
        name: chart.panchanga?.yoga?.name || 'Vishkambha',
        sanskrit: chart.panchanga?.yoga?.sanskritName || 'विष्कम्भ',
        auspiciousness: chart.panchanga?.yoga?.auspiciousness || 'Auspicious',
      },
      karana: {
        number: chart.panchanga?.karana?.number || 1,
        name: chart.panchanga?.karana?.name || 'Bava',
        sanskrit: chart.panchanga?.karana?.sanskritName || 'बव',
        type: chart.panchanga?.karana?.type || 'Chara (Movable)',
      },
      ritu: {
        name: chart.panchanga?.calendar?.rtu?.name || 'Vasanta',
        sanskrit: chart.panchanga?.calendar?.rtu?.sanskritName || 'वसन्त',
        season: chart.panchanga?.calendar?.rtu?.vedicSeason || 'Spring',
      },
      masa: {
        amanta: chart.panchanga?.calendar?.lunarMonth?.amantaName || 'Chaitra',
        purnimanta: chart.panchanga?.calendar?.lunarMonth?.purnimantaName || 'Chaitra',
        solarMonth: chart.panchanga?.calendar?.solarMonth?.name || 'Mesha',
        solarDay: chart.panchanga?.calendar?.solarMonth?.solarDay || 1,
      },
      samvatsara: {
        number: chart.panchanga?.calendar?.eras?.samvatsara60?.number || 1,
        name: chart.panchanga?.calendar?.eras?.samvatsara60?.name || 'Prabhava',
        sanskrit: chart.panchanga?.calendar?.eras?.samvatsara60?.sanskritName || 'प्रभव',
      },
    },
    mathematics: {
      bhayat: {
        ghatis: bhayatGhatis,
        palas: bhayatPalas,
        vipalas: bhayatVipalas,
        formattedGhatis: `${bhayatGhatis} Ghaṭī ${bhayatPalas} Pala ${bhayatVipalas} Vipala (${bhayatTotalGhatis.toFixed(2)} Ghaṭīs)`,
        elapsedDegrees: elapsedDegInNak,
        elapsedFormatted: `${bhayatDegPart}° ${bhayatMinPart}' ${bhayatSecPart}" (${(fractionElapsed * 100).toFixed(2)}% of Nakṣatra)`,
      },
      bhabhoga: {
        ghatis: bhabhogaGhatis,
        palas: bhabhogaPalas,
        formattedGhatis: `${bhabhogaGhatis} Ghaṭī 00 Pala (60.00 Ghaṭīs)`,
        spanDegrees: nakTotalSpanDeg,
        spanFormatted: `13° 20' 00" (800' arc minutes)`,
      },
      dashaBalance: {
        lordId: dashaLordId,
        lordName: dashaLordId.charAt(0).toUpperCase() + dashaLordId.slice(1),
        lordSanskrit: dashaLordInfo,
        yearsTotal: wholeYears,
        yearsRemaining: wholeYears,
        monthsRemaining: wholeMonths,
        daysRemaining: daysRem,
        percentRemaining: dashaBalance.percentRemaining,
        formattedBalance: `${wholeYears} Y, ${wholeMonths} M, ${daysRem} D of ${dashaLordId.toUpperCase()} (${(dashaBalance.percentRemaining || 0).toFixed(1)}% remaining)`,
      },
    },
  };
}

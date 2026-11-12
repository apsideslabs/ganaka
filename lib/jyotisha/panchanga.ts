/**
 * Gaṇaka — Classical & Drik Astronomical Pañcāṅga Engine
 * Implements rigorous astronomical calculations for:
 * - Five Limbs: Vāra, Tithi, Nakṣatra (with Padas), Yoga, Karaṇa
 * - Sub-second Transition / Ending Moments (Samāpti Kāla) & Starting Moments via Newton-Raphson
 * - Udaya Tithi, Udaya Nakshatra, Udaya Yoga, Udaya Karana (at true local Sunrise)
 * - Sunrise, Sunset, Solar Noon, Moonrise, Moonset, Twilights, Dinamāna & Rātrimāna (in 12-hour AM/PM and Ghatis)
 * - Classical Muhūrta Windows: Rāhukāla, Yamagaṇḍa, Gulikakāla, Abhijit, Brahma Muhūrta, Godhūli, Vijaya, Niśītha, Durmuhūrta, Varjyam, Amṛta Kāla
 * - Choghadiya (Daytime & Nighttime 8-slot periods with planetary lords & auspiciousness)
 * - Special Vedic Yogas: Amrita Siddhi, Sarvartha Siddhi, Guru Pushya, Ravi Pushya, Dwipushkar, Tripushkar
 * - 24 Vedic Horas with planetary lords
 * - Cāndramāsa (Amānta & Pūrṇimānta) with Adhika & Kṣaya detection
 * - Sauramāsa (Solar Month & Day), Saṅkrānti timings & Puṇya Kāla
 * - Ṛtu (6 Vedic Seasons) & Ayana (Uttarāyaṇa / Dakṣiṇāyana)
 * - Traditional Eras: Kali Yuga, Vikrama Saṃvat, Śaka Saṃvat, 60-Year Saṃvatsara Cycle
 *
 * References: Sūrya Siddhānta, Muhūrta Chintāmaṇi, BPHS, Jean Meeus Astronomical Algorithms.
 */

import { normalizeDegrees, calculateObliquity } from '../astronomy/julian';
import { calculateAyanamsha, AyanamshaType } from '../astronomy/ayanamsha';
import { calculateSolarTimes, calculateLunarTimes, PlanetId, formatHours12H } from '../astronomy/ephemeris';
import { NAKSHATRAS } from './constants';
import { PanchangaResult, ChoghadiyaSlot } from './types';

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

// --- Classical Data Tables ---

export const TITHI_NAMES = [
  'Pratipadā (1)', 'Dvitīyā (2)', 'Tṛtīyā (3)', 'Caturthī (4)', 'Pañcamī (5)',
  'Ṣaṣṭhī (6)', 'Saptamī (7)', 'Aṣṭamī (8)', 'Navamī (9)', 'Daśamī (10)',
  'Ekādaśī (11)', 'Dvādaśī (12)', 'Trayodaśī (13)', 'Caturdaśī (14)', 'Pūrṇimā (15)',
  'Pratipadā (1)', 'Dvitīyā (2)', 'Tṛtīyā (3)', 'Caturthī (4)', 'Pañcamī (5)',
  'Ṣaṣṭhī (6)', 'Saptamī (7)', 'Aṣṭamī (8)', 'Navamī (9)', 'Daśamī (10)',
  'Ekādaśī (11)', 'Dvādaśī (12)', 'Trayodaśī (13)', 'Caturdaśī (14)', 'Amāvāsyā (30)',
];

export const TITHI_SANSKRIT = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावास्या',
];

export const TITHI_DEITIES = [
  'Agni (Fire)', 'Brahmā (Creator)', 'Gaurī (Pārvatī)', 'Gaṇeśa (Vighnahartā)', 'Nāgas (Serpents)',
  'Kārttikeya (Skanda)', 'Sūrya (Sun)', 'Śiva (Rudra)', 'Durgā (Mahāmāyā)', 'Yama (Dharmarāja)',
  'Viśvedevas', 'Viṣṇu (Hari)', 'Kāmadeva', 'Śiva (Kālarātri)', 'Candra (Moon/Soma)',
  'Agni', 'Brahmā', 'Gaurī', 'Gaṇeśa', 'Nāgas',
  'Kārttikeya', 'Sūrya', 'Śiva', 'Durgā', 'Yama',
  'Viśvedevas', 'Viṣṇu', 'Kāmadeva', 'Śiva', 'Pitṛs (Ancestors)',
];

export const TITHI_NITYA_DEVIS = [
  'Kāmeśvarī', 'Bhagamālinī', 'Nityaklinnā', 'Bheruṇḍā', 'Vahnivāsinī',
  'Vajreśvarī', 'Śivadūtī', 'Tvaritā', 'Kulasundarī', 'Nityā',
  'Nīlapatākā', 'Vijayā', 'Sarvamaṅgalā', 'Jvālāmālinī', 'Citrā',
  'Kāmeśvarī', 'Bhagamālinī', 'Nityaklinnā', 'Bheruṇḍā', 'Vahnivāsinī',
  'Vajreśvarī', 'Śivadūtī', 'Tvaritā', 'Kulasundarī', 'Nityā',
  'Nīlapatākā', 'Vijayā', 'Sarvamaṅgalā', 'Jvālāmālinī', 'Citrā',
];

export const TITHI_RULING_PLANETS: PlanetId[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter',
  'venus', 'saturn', 'rahu', 'sun', 'moon',
  'mars', 'mercury', 'jupiter', 'venus', 'saturn',
  'sun', 'moon', 'mars', 'mercury', 'jupiter',
  'venus', 'saturn', 'rahu', 'sun', 'moon',
  'mars', 'mercury', 'jupiter', 'venus', 'rahu',
];

export const NITYA_YOGAS = [
  { name: 'Viṣkambha', devanagari: 'विष्कम्भ', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Yama' },
  { name: 'Prīti', devanagari: 'प्रीति', auspiciousness: 'Auspicious (Śubha)', deity: 'Viṣṇu' },
  { name: 'Āyuṣmān', devanagari: 'आयुष्मान्', auspiciousness: 'Auspicious (Śubha)', deity: 'Candra' },
  { name: 'Saubhāgya', devanagari: 'सौभाग्य', auspiciousness: 'Auspicious (Śubha)', deity: 'Brahmā' },
  { name: 'Śobhana', devanagari: 'शोभन', auspiciousness: 'Auspicious (Śubha)', deity: 'Bṛhaspati' },
  { name: 'Atigaṇḍa', devanagari: 'अतिगण्ड', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Candra' },
  { name: 'Sukarmā', devanagari: 'सुकर्मा', auspiciousness: 'Auspicious (Śubha)', deity: 'Indra' },
  { name: 'Dhṛti', devanagari: 'धृति', auspiciousness: 'Auspicious (Śubha)', deity: 'Jala (Varuṇa)' },
  { name: 'Śūla', devanagari: 'शूल', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Sarpa' },
  { name: 'Gaṇḍa', devanagari: 'गण्ड', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Agni' },
  { name: 'Vṛddhi', devanagari: 'वृद्धि', auspiciousness: 'Auspicious (Śubha)', deity: 'Sūrya' },
  { name: 'Dhruva', devanagari: 'ध्रुव', auspiciousness: 'Auspicious (Śubha)', deity: 'Bhūmi' },
  { name: 'Vyāghāta', devanagari: 'व्याघात', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Vāyu' },
  { name: 'Harṣaṇa', devanagari: 'हर्षण', auspiciousness: 'Auspicious (Śubha)', deity: 'Bhaga' },
  { name: 'Vajra', devanagari: 'वज्र', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Varuṇa' },
  { name: 'Siddhi', devanagari: 'सिद्धि', auspiciousness: 'Auspicious (Śubha)', deity: 'Gaṇeśa' },
  { name: 'Vyatīpāta', devanagari: 'व्यतीपात', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Rudra' },
  { name: 'Varīyān', devanagari: 'वरीयान्', auspiciousness: 'Auspicious (Śubha)', deity: 'Kubera' },
  { name: 'Parigha', devanagari: 'परिघ', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Viśvakarman' },
  { name: 'Śiva', devanagari: 'शिव', auspiciousness: 'Auspicious (Śubha)', deity: 'Mitra' },
  { name: 'Siddha', devanagari: 'सिद्ध', auspiciousness: 'Auspicious (Śubha)', deity: 'Kārtikeya' },
  { name: 'Sādhya', devanagari: 'साध्य', auspiciousness: 'Auspicious (Śubha)', deity: 'Sāvitrī' },
  { name: 'Śubha', devanagari: 'शुभ', auspiciousness: 'Auspicious (Śubha)', deity: 'Lakṣmī' },
  { name: 'Śukla', devanagari: 'शुक्ल', auspiciousness: 'Auspicious (Śubha)', deity: 'Pārvatī' },
  { name: 'Brahma', devanagari: 'ब्रह्म', auspiciousness: 'Auspicious (Śubha)', deity: 'Aśvinīkumāras' },
  { name: 'Indra (Māhendra)', devanagari: 'इन्द्र / माहेन्द्र', auspiciousness: 'Auspicious (Śubha)', deity: 'Pitṛs' },
  { name: 'Vaidhṛti', devanagari: 'वैधृति', auspiciousness: 'Inauspicious (Aśubha)', deity: 'Diti' },
];

export const KARANA_MOVABLE = [
  { name: 'Bava', devanagari: 'बव', deity: 'Indra' },
  { name: 'Bālava', devanagari: 'बालव', deity: 'Brahmā' },
  { name: 'Kaulava', devanagari: 'कौलव', deity: 'Mitra (Sun)' },
  { name: 'Taitila', devanagari: 'तैतिल', deity: 'Aryamā' },
  { name: 'Gara', devanagari: 'गर', deity: 'Bhūmi (Earth)' },
  { name: 'Vaṇija', devanagari: 'वणिज', deity: 'Śrī (Lakṣmī)' },
  { name: 'Viṣṭi (Bhadrā)', devanagari: 'विष्टि (भद्रा)', deity: 'Yama' },
];

export const KARANA_FIXED = [
  { name: 'Śakuni', devanagari: 'शकुनि', deity: 'Kali' },
  { name: 'Catuṣpāda', devanagari: 'चतुष्पाद', deity: 'Vṛṣabha' },
  { name: 'Nāga', devanagari: 'नाग', deity: 'Nāgas' },
  { name: 'Kiṃstughna', devanagari: 'किंस्तुघ्न', deity: 'Vāyu' },
];

export const VARA_DETAILS: Array<{
  name: string;
  sanskritName: string;
  lord: PlanetId;
  civilName: string;
  deity: string;
  metal: string;
  color: string;
}> = [
  { name: 'Ravivāra', sanskritName: 'रविवासर (आदित्यवार)', lord: 'sun', civilName: 'Sunday', deity: 'Śiva / Sūrya', metal: 'Copper / Gold', color: 'Ruby Red / Orange' },
  { name: 'Somavāra', sanskritName: 'सोमवासर (इन्दुवार)', lord: 'moon', civilName: 'Monday', deity: 'Pārvatī / Soma', metal: 'Silver / Bell Metal', color: 'Pearl White' },
  { name: 'Maṅgalavāra', sanskritName: 'भौमवासर (मङ्गलवार)', lord: 'mars', civilName: 'Tuesday', deity: 'Skanda / Hanumān', metal: 'Copper / Brass', color: 'Coral Red' },
  { name: 'Budhavāra', sanskritName: 'सौम्यवासर (बुधवार)', lord: 'mercury', civilName: 'Wednesday', deity: 'Viṣṇu / Nārāyaṇa', metal: 'Bronze / Brass', color: 'Emerald Green' },
  { name: 'Guruvāra', sanskritName: 'बृहस्पतिवासर (गुरुवार)', lord: 'jupiter', civilName: 'Thursday', deity: 'Brahmā / Bṛhaspati', metal: 'Gold / Brass', color: 'Yellow / Saffron' },
  { name: 'Śukravāra', sanskritName: 'भृगुवासर (शुक्रवार)', lord: 'venus', civilName: 'Friday', deity: 'Lakṣmī / Śukrācārya', metal: 'Silver / Platinum', color: 'Diamond White / Pink' },
  { name: 'Śanivāra', sanskritName: 'मन्दवासर (शनिवार)', lord: 'saturn', civilName: 'Saturday', deity: 'Yama / Śanaiścara', metal: 'Iron / Lead', color: 'Dark Blue / Black' },
];

export const NAKSHATRA_ATTRIBUTES: Array<{
  padas: [string, string, string, string];
  varna: string;
  tattva: string;
  paya: string;
}> = [
  { padas: ['Chu', 'Che', 'Cho', 'La'], varna: 'Kṣatriya', tattva: 'Agni (Fire)', paya: 'Svarṇa (Gold)' }, // 1 Ashwini
  { padas: ['Lee', 'Lu', 'Le', 'Lo'], varna: 'Mleccha', tattva: 'Agni (Fire)', paya: 'Rajat (Silver)' }, // 2 Bharani
  { padas: ['A', 'Ee', 'U', 'Ea'], varna: 'Brāhmaṇa', tattva: 'Agni (Fire)', paya: 'Tāmra (Copper)' }, // 3 Krittika
  { padas: ['O', 'Va', 'Vi', 'Vu'], varna: 'Śūdra', tattva: 'Pṛthvī (Earth)', paya: 'Loha (Iron)' }, // 4 Rohini
  { padas: ['Ve', 'Vo', 'Ka', 'Kee'], varna: 'Vaiśya', tattva: 'Pṛthvī (Earth)', paya: 'Rajat (Silver)' }, // 5 Mrigashira
  { padas: ['Ku', 'Gha', 'Nga', 'Chha'], varna: 'Śūdra', tattva: 'Jala (Water)', paya: 'Tāmra (Copper)' }, // 6 Ardra
  { padas: ['Ke', 'Ko', 'Ha', 'Hī'], varna: 'Vaiśya', tattva: 'Jala (Water)', paya: 'Loha (Iron)' }, // 7 Punarvasu
  { padas: ['Hu', 'He', 'Ho', 'Da'], varna: 'Kṣatriya', tattva: 'Jala (Water)', paya: 'Svarṇa (Gold)' }, // 8 Pushya
  { padas: ['Dee', 'Doo', 'De', 'Do'], varna: 'Mleccha', tattva: 'Jala (Water)', paya: 'Rajat (Silver)' }, // 9 Ashlesha
  { padas: ['Ma', 'Mee', 'Moo', 'Me'], varna: 'Śūdra', tattva: 'Agni (Fire)', paya: 'Tāmra (Copper)' }, // 10 Magha
  { padas: ['Mo', 'Ta', 'Tee', 'Too'], varna: 'Brāhmaṇa', tattva: 'Agni (Fire)', paya: 'Loha (Iron)' }, // 11 Purva Phalguni
  { padas: ['Te', 'To', 'Pa', 'Pee'], varna: 'Kṣatriya', tattva: 'Agni (Fire)', paya: 'Svarṇa (Gold)' }, // 12 Uttara Phalguni
  { padas: ['Pu', 'Sha', 'Na', 'Tha'], varna: 'Vaiśya', tattva: 'Vāyu (Air)', paya: 'Rajat (Silver)' }, // 13 Hasta
  { padas: ['Pe', 'Po', 'Ra', 'Ree'], varna: 'Śūdra', tattva: 'Vāyu (Air)', paya: 'Tāmra (Copper)' }, // 14 Chitra
  { padas: ['Ru', 'Re', 'Ro', 'Taa'], varna: 'Mleccha', tattva: 'Vāyu (Air)', paya: 'Loha (Iron)' }, // 15 Swati
  { padas: ['Tee', 'Too', 'Te', 'To'], varna: 'Brāhmaṇa', tattva: 'Vāyu (Air)', paya: 'Svarṇa (Gold)' }, // 16 Vishakha
  { padas: ['Na', 'Nee', 'Noo', 'Ne'], varna: 'Śūdra', tattva: 'Jala (Water)', paya: 'Rajat (Silver)' }, // 17 Anuradha
  { padas: ['No', 'Ya', 'Yee', 'Yoo'], varna: 'Vaiśya', tattva: 'Jala (Water)', paya: 'Tāmra (Copper)' }, // 18 Jyeshtha
  { padas: ['Ye', 'Yo', 'Bha', 'Bhee'], varna: 'Kṣatriya', tattva: 'Agni (Fire)', paya: 'Loha (Iron)' }, // 19 Mula
  { padas: ['Bhoo', 'Dha', 'Pha', 'Dhaa'], varna: 'Brāhmaṇa', tattva: 'Agni (Fire)', paya: 'Svarṇa (Gold)' }, // 20 Purva Ashadha
  { padas: ['Bhe', 'Bho', 'Ja', 'Jee'], varna: 'Kṣatriya', tattva: 'Pṛthvī (Earth)', paya: 'Rajat (Silver)' }, // 21 Uttara Ashadha
  { padas: ['Ju', 'Je', 'Jo', 'Gha'], varna: 'Mleccha', tattva: 'Vāyu (Air)', paya: 'Tāmra (Copper)' }, // 22 Shravana
  { padas: ['Ga', 'Gee', 'Goo', 'Ge'], varna: 'Śūdra', tattva: 'Ākāśa (Ether)', paya: 'Loha (Iron)' }, // 23 Dhanishta
  { padas: ['Go', 'Sa', 'See', 'Soo'], varna: 'Vaiśya', tattva: 'Ākāśa (Ether)', paya: 'Svarṇa (Gold)' }, // 24 Shatabhisha
  { padas: ['Se', 'So', 'Daa', 'Dee'], varna: 'Brāhmaṇa', tattva: 'Vāyu (Air)', paya: 'Rajat (Silver)' }, // 25 Purva Bhadrapada
  { padas: ['Doo', 'Tha', 'Jha', 'Jna'], varna: 'Kṣatriya', tattva: 'Jala (Water)', paya: 'Tāmra (Copper)' }, // 26 Uttara Bhadrapada
  { padas: ['De', 'Do', 'Chaa', 'Chee'], varna: 'Śūdra', tattva: 'Jala (Water)', paya: 'Loha (Iron)' }, // 27 Revati
];

export const LUNAR_MONTH_NAMES = [
  { name: 'Caitra', devanagari: 'चैत्र' },
  { name: 'Vaiśākha', devanagari: 'वैशाख' },
  { name: 'Jyeṣṭha', devanagari: 'ज्येष्ठ' },
  { name: 'Āṣāḍha', devanagari: 'आषाढ' },
  { name: 'Śrāvaṇa', devanagari: 'श्रावण' },
  { name: 'Bhādrapada', devanagari: 'भाद्रपद' },
  { name: 'Āśvina', devanagari: 'आश्विन' },
  { name: 'Kārtika', devanagari: 'कार्तिक' },
  { name: 'Mārgaśīrṣa (Agrahāyaṇa)', devanagari: 'मार्गशीर्ष (अग्रहायण)' },
  { name: 'Pauṣa', devanagari: 'पौष' },
  { name: 'Māgha', devanagari: 'माघ' },
  { name: 'Phālguna', devanagari: 'फाल्गुन' },
];

export const SOLAR_MONTH_NAMES = [
  { name: 'Meṣa (Aries)', sanskrit: 'मेष सौरमास', signName: 'Meṣa' },
  { name: 'Vṛṣabha (Taurus)', sanskrit: 'वृषभ सौरमास', signName: 'Vṛṣabha' },
  { name: 'Mithuna (Gemini)', sanskrit: 'मिथुन सौरमास', signName: 'Mithuna' },
  { name: 'Karka (Cancer)', sanskrit: 'कर्क सौरमास', signName: 'Karka' },
  { name: 'Siṃha (Leo)', sanskrit: 'सिंह सौरमास', signName: 'Siṃha' },
  { name: 'Kanyā (Virgo)', sanskrit: 'कन्या सौरमास', signName: 'Kanyā' },
  { name: 'Tulā (Libra)', sanskrit: 'तुला सौरमास', signName: 'Tulā' },
  { name: 'Vṛścika (Scorpio)', sanskrit: 'वृश्चिक सौरमास', signName: 'Vṛścika' },
  { name: 'Dhanu (Sagittarius)', sanskrit: 'धनु सौरमास', signName: 'Dhanu' },
  { name: 'Makara (Capricorn)', sanskrit: 'मकर सौरमास', signName: 'Makara' },
  { name: 'Kumbha (Aquarius)', sanskrit: 'कुम्भ सौरमास', signName: 'Kumbha' },
  { name: 'Mīna (Pisces)', sanskrit: 'मीन सौरमास', signName: 'Mīna' },
];

export const SAMVATSARA_60_NAMES = [
  { name: 'Prabhava', devanagari: 'प्रभव' },
  { name: 'Vibhava', devanagari: 'विभव' },
  { name: 'Śukla', devanagari: 'शुक्ल' },
  { name: 'Pramoda', devanagari: 'प्रमोद' },
  { name: 'Prajāpati', devanagari: 'प्रजापति' },
  { name: 'Āṅgirasa', devanagari: 'आङ्गिरस' },
  { name: 'Śrīmukha', devanagari: 'श्रीमुख' },
  { name: 'Bhāva', devanagari: 'भाव' },
  { name: 'Yuva', devanagari: 'युव' },
  { name: 'Dhātṛ', devanagari: 'धातृ' },
  { name: 'Īśvara', devanagari: 'ईश्वर' },
  { name: 'Bahudhānya', devanagari: 'बहुधान्य' },
  { name: 'Pramāthī', devanagari: 'प्रमाथी' },
  { name: 'Vikrama', devanagari: 'विक्रम' },
  { name: 'Vṛṣaprajāpati', devanagari: 'वृषप्रजापति' },
  { name: 'Citrabhānu', devanagari: 'चित्रभानु' },
  { name: 'Subhānu', devanagari: 'सुभानु' },
  { name: 'Tāraṇa', devanagari: 'तारण' },
  { name: 'Pārthiva', devanagari: 'पार्थिव' },
  { name: 'Vyaya', devanagari: 'व्यय' },
  { name: 'Sarvajit', devanagari: 'सर्वजित्' },
  { name: 'Sarvadhārī', devanagari: 'सर्वधारी' },
  { name: 'Virodhī', devanagari: 'विरोधी' },
  { name: 'Vikṛti', devanagari: 'विकृति' },
  { name: 'Khara', devanagari: 'खर' },
  { name: 'Nandana', devanagari: 'नन्दन' },
  { name: 'Vijaya', devanagari: 'विजय' },
  { name: 'Jaya', devanagari: 'जय' },
  { name: 'Manmatha', devanagari: 'मन्मथ' },
  { name: 'Durmukha', devanagari: 'दुर्मुख' },
  { name: 'Hemalamba', devanagari: 'हेमलम्ब' },
  { name: 'Vilamba', devanagari: 'विलम्ब' },
  { name: 'Vikārī', devanagari: 'विकारी' },
  { name: 'Śārvarī', devanagari: 'शार्वरी' },
  { name: 'Plava', devanagari: 'प्लव' },
  { name: 'Śubhakṛt', devanagari: 'शुभकृत्' },
  { name: 'Śobhakṛt', devanagari: 'शोभकृत्' },
  { name: 'Krodhī', devanagari: 'क्रोधी' },
  { name: 'Viśvāvasu', devanagari: 'विश्वावसु' },
  { name: 'Parābhava', devanagari: 'पराभव' },
  { name: 'Plavaṅga', devanagari: 'प्लवङ्ग' },
  { name: 'Kīlaka', devanagari: 'कीलक' },
  { name: 'Saumya', devanagari: 'सौम्य' },
  { name: 'Sādhāraṇa', devanagari: 'साधारण' },
  { name: 'Virodhakṛt', devanagari: 'विरोधकृत्' },
  { name: 'Paridhāvī', devanagari: 'परिधावी' },
  { name: 'Pramādī', devanagari: 'प्रमादी' },
  { name: 'Ānanda', devanagari: 'आनन्द' },
  { name: 'Rākṣasa', devanagari: 'राक्षस' },
  { name: 'Anala', devanagari: 'अनल' },
  { name: 'Piṅgala', devanagari: 'पिङ्गल' },
  { name: 'Kālayukta', devanagari: 'कालयुक्त' },
  { name: 'Siddhārthī', devanagari: 'सिद्धार्थी' },
  { name: 'Raudra', devanagari: 'रौद्र' },
  { name: 'Durmati', devanagari: 'दुर्मति' },
  { name: 'Dundubhi', devanagari: 'दुन्दुभि' },
  { name: 'Rudhirodgārī', devanagari: 'रुधिरोद्गारी' },
  { name: 'Raktākṣa', devanagari: 'रक्ताक्ष' },
  { name: 'Krodhana', devanagari: 'क्रोधन' },
  { name: 'Kṣaya', devanagari: 'क्षय' },
];

const VARJYAM_GHATI_OFFSETS = [
  50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30,
];

// --- 12-Hour Local Time Formatter ---

/**
 * Formats a Julian Day to a clean 12-hour AM/PM local time string (e.g. "1:21 PM", "6:13 AM (+1d)").
 */
export function formatJDTo12Hour(
  eventJD: number,
  referenceJD: number,
  timezoneOffsetHours: number,
  includeSeconds: boolean = false
): string {
  const localDay = eventJD + 0.5 + timezoneOffsetHours / 24.0;
  const refDay = referenceJD + 0.5 + timezoneOffsetHours / 24.0;

  let frac = localDay - Math.floor(localDay);
  if (frac < 0) frac += 1.0;

  const totalSeconds = Math.round(frac * 86400);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;

  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  let timeStr = `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  if (includeSeconds) {
    timeStr = `${h12}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${period}`;
  }

  const diffDays = Math.floor(localDay) - Math.floor(refDay);
  if (diffDays > 0) {
    return `${timeStr} (+${diffDays}d)`;
  } else if (diffDays < 0) {
    return `${timeStr} (${diffDays}d)`;
  }
  return timeStr;
}

// --- Internal Astronomical Position Functions ---

function getEphemerisSunMoon(jd: number): {
  sunLon: number;
  moonLon: number;
  sunSpeed: number;
  moonSpeed: number;
} {
  const T = (jd - 2451545.0) / 36525.0;

  // Sun (Jean Meeus / VSOP87)
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M_sun = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG2RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_sun) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) +
    0.000289 * Math.sin(3 * M_sun);
  const sunTrueLong = normalizeDegrees(L0 + C);
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const sunAppLong = normalizeDegrees(sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega));

  // Moon (ELP-2000 analytical terms)
  const Lprime = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0);
  const D = normalizeDegrees(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0) * DEG2RAD;
  const M_moon = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * DEG2RAD;
  const Mprime = normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * DEG2RAD;
  const F = normalizeDegrees(93.272095 + 483202.0175233 * T - 0.0036539 * T * T) * DEG2RAD;

  const lTerms =
    6.288774 * Math.sin(Mprime) +
    1.274027 * Math.sin(2 * D - Mprime) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mprime) -
    0.185116 * Math.sin(M_moon) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mprime) +
    0.057066 * Math.sin(2 * D - M_moon - Mprime) +
    0.053322 * Math.sin(2 * D + Mprime) +
    0.045758 * Math.sin(2 * D - M_moon) -
    0.040923 * Math.sin(M_moon - Mprime) -
    0.03472 * Math.sin(D) -
    0.030383 * Math.sin(M_moon + Mprime) +
    0.015327 * Math.sin(2 * D - 2 * F);

  const moonAppLong = normalizeDegrees(Lprime + lTerms);

  return {
    sunLon: sunAppLong,
    moonLon: moonAppLong,
    sunSpeed: 0.9856,
    moonSpeed: 13.1764,
  };
}

function getSiderealSunMoon(
  jd: number,
  ayanamshaType: AyanamshaType = 'lahiri',
  customAyanamsha: number = 0
): { sunSid: number; moonSid: number; elongation: number; sumLong: number } {
  const { sunLon, moonLon } = getEphemerisSunMoon(jd);
  const ayan = calculateAyanamsha(jd, ayanamshaType, customAyanamsha);
  const sunSid = normalizeDegrees(sunLon - ayan);
  const moonSid = normalizeDegrees(moonLon - ayan);
  const elongation = normalizeDegrees(moonSid - sunSid);
  const sumLong = normalizeDegrees(sunSid + moonSid);
  return { sunSid, moonSid, elongation, sumLong };
}

// --- Newton-Raphson Boundary Finders ---

function findTithiTransitionJD(
  currentJD: number,
  targetTithiIndex: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number
): number {
  const targetAngle = targetTithiIndex * 12.0;
  let t = currentJD;

  for (let iter = 0; iter < 6; iter++) {
    const { elongation } = getSiderealSunMoon(t, ayanamshaType, customAyanamsha);
    let diff = targetAngle - elongation;
    if (targetAngle === 360 && elongation < 180) diff -= 360;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00002) break;
    t += diff / 12.19075;
  }
  return t;
}

function findNakshatraTransitionJD(
  currentJD: number,
  targetNakIndex: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number
): number {
  const span = 360.0 / 27.0;
  const targetAngle = targetNakIndex * span;
  let t = currentJD;

  for (let iter = 0; iter < 6; iter++) {
    const { moonSid } = getSiderealSunMoon(t, ayanamshaType, customAyanamsha);
    let diff = targetAngle - moonSid;
    if (targetAngle >= 360 && moonSid < 180) diff -= 360;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00002) break;
    t += diff / 13.17635;
  }
  return t;
}

function findYogaTransitionJD(
  currentJD: number,
  targetYogaIndex: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number
): number {
  const span = 360.0 / 27.0;
  const targetAngle = targetYogaIndex * span;
  let t = currentJD;

  for (let iter = 0; iter < 6; iter++) {
    const { sumLong } = getSiderealSunMoon(t, ayanamshaType, customAyanamsha);
    let diff = targetAngle - sumLong;
    if (targetAngle >= 360 && sumLong < 180) diff -= 360;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00002) break;
    t += diff / 14.162;
  }
  return t;
}

function findKaranaTransitionJD(
  currentJD: number,
  targetKaranaIndex: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number
): number {
  const targetAngle = targetKaranaIndex * 6.0;
  let t = currentJD;

  for (let iter = 0; iter < 6; iter++) {
    const { elongation } = getSiderealSunMoon(t, ayanamshaType, customAyanamsha);
    let diff = targetAngle - elongation;
    if (targetAngle === 360 && elongation < 180) diff -= 360;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00002) break;
    t += diff / 12.19075;
  }
  return t;
}

function findSankrantiTimings(
  currentJD: number,
  currentSunSid: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number
): {
  prevSankrantiJD: number;
  nextSankrantiJD: number;
  nextSignIndex: number;
  currentSignIndex: number;
} {
  const currentSignIndex = Math.floor(currentSunSid / 30.0);
  const nextSignIndex = (currentSignIndex + 1) % 12;

  const targetPrev = currentSignIndex * 30.0;
  const targetNext = (currentSignIndex + 1) * 30.0;

  let tPrev = currentJD - (currentSunSid - targetPrev) / 0.9856;
  for (let iter = 0; iter < 5; iter++) {
    const { sunSid } = getSiderealSunMoon(tPrev, ayanamshaType, customAyanamsha);
    let diff = targetPrev - sunSid;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    if (Math.abs(diff) < 0.00002) break;
    tPrev += diff / 0.9856;
  }

  let tNext = currentJD + (targetNext - currentSunSid) / 0.9856;
  for (let iter = 0; iter < 5; iter++) {
    const { sunSid } = getSiderealSunMoon(tNext, ayanamshaType, customAyanamsha);
    let diff = targetNext - sunSid;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    if (Math.abs(diff) < 0.00002) break;
    tNext += diff / 0.9856;
  }

  return {
    prevSankrantiJD: tPrev,
    nextSankrantiJD: tNext,
    currentSignIndex,
    nextSignIndex,
  };
}

function calculateLunarMonthDetails(
  currentJD: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number,
  paksha: 'Shukla' | 'Krishna'
): {
  amantaName: string;
  purnimantaName: string;
  isAdhika: boolean;
  isKshaya: boolean;
  status: string;
} {
  const { elongation } = getSiderealSunMoon(currentJD, ayanamshaType, customAyanamsha);

  let tPrevNM = currentJD - elongation / 12.19075;
  for (let iter = 0; iter < 5; iter++) {
    const { elongation: el } = getSiderealSunMoon(tPrevNM, ayanamshaType, customAyanamsha);
    let diff = 0 - el;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    if (Math.abs(diff) < 0.00002) break;
    tPrevNM += diff / 12.19075;
  }

  let tNextNM = tPrevNM + 29.530588;
  for (let iter = 0; iter < 5; iter++) {
    const { elongation: el } = getSiderealSunMoon(tNextNM, ayanamshaType, customAyanamsha);
    let diff = 360 - el;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    if (Math.abs(diff) < 0.00002) break;
    tNextNM += diff / 12.19075;
  }

  const sunStart = getSiderealSunMoon(tPrevNM, ayanamshaType, customAyanamsha).sunSid;
  const sunEnd = getSiderealSunMoon(tNextNM, ayanamshaType, customAyanamsha).sunSid;

  const signStart = Math.floor(sunStart / 30.0);
  const signEnd = Math.floor(sunEnd / 30.0);

  let isAdhika = false;
  let isKshaya = false;
  let baseMonthIndex = 0;

  if (signStart === signEnd) {
    isAdhika = true;
    baseMonthIndex = (signStart + 1) % 12;
  } else if ((signEnd - signStart + 12) % 12 === 2) {
    isKshaya = true;
    baseMonthIndex = signEnd;
  } else {
    baseMonthIndex = signEnd;
  }

  const baseName = LUNAR_MONTH_NAMES[baseMonthIndex].name;
  const amantaName = isAdhika ? `Adhika ${baseName}` : isKshaya ? `Kṣaya ${baseName}` : `Nija ${baseName}`;

  let purnimantaMonthIndex = baseMonthIndex;
  if (paksha === 'Krishna') {
    purnimantaMonthIndex = (baseMonthIndex + 1) % 12;
  }
  const purnimantaBase = LUNAR_MONTH_NAMES[purnimantaMonthIndex].name;
  const purnimantaName = isAdhika ? `Adhika ${purnimantaBase}` : `Nija ${purnimantaBase}`;

  return {
    amantaName,
    purnimantaName,
    isAdhika,
    isKshaya,
    status: isAdhika ? 'Adhika Māsa (Intercalary)' : isKshaya ? 'Kṣaya Māsa (Lost)' : 'Nija Māsa (Regular)',
  };
}

function calculateRtu(sunSid: number): { name: string; sanskritName: string; vedicSeason: string } {
  const shifted = normalizeDegrees(sunSid + 30.0);
  const rtuIndex = Math.floor(shifted / 60.0) % 6;

  const RTUS = [
    { name: 'Vasanta', sanskritName: 'वसन्त ऋतु', vedicSeason: 'Spring (Caitra – Vaiśākha)' },
    { name: 'Grīṣma', sanskritName: 'ग्रीष्म ऋतु', vedicSeason: 'Summer (Jyeṣṭha – Āṣāḍha)' },
    { name: 'Varṣā', sanskritName: 'वर्षा ऋतु', vedicSeason: 'Monsoon (Śrāvaṇa – Bhādrapada)' },
    { name: 'Śarad', sanskritName: 'शरद् ऋतु', vedicSeason: 'Autumn (Āśvina – Kārtika)' },
    { name: 'Hemanta', sanskritName: 'हेमन्त ऋतु', vedicSeason: 'Pre-Winter (Mārgaśīrṣa – Pauṣa)' },
    { name: 'Śiśira', sanskritName: 'शिशिर ऋतु', vedicSeason: 'Winter (Māgha – Phālguna)' },
  ];

  return RTUS[rtuIndex];
}

function calculateAyana(sunSid: number): { name: string; sanskritName: string; description: string } {
  const isUttarayana = sunSid >= 270.0 || sunSid < 90.0;
  if (isUttarayana) {
    return {
      name: 'Uttarāyaṇa',
      sanskritName: 'उत्तरायण',
      description: 'Northern Celestial Ingress (Makara to Mithuna / Increasing Daylight)',
    };
  }
  return {
    name: 'Dakṣiṇāyana',
    sanskritName: 'दक्षिणायन',
    description: 'Southern Celestial Ingress (Karka to Dhanu / Decreasing Daylight)',
  };
}

function calculateCalendarEras(
  jd: number,
  lunarMonthIndex: number,
  paksha: 'Shukla' | 'Krishna'
): {
  kaliYugaYear: number;
  vikramaSamvat: number;
  shakaSamvat: number;
  samvatsara60: { number: number; name: string; sanskritName: string };
} {
  const kaliElapsed = Math.floor((jd - 588465.5) / 365.258756);
  const approxGregYear = Math.floor((jd - 1721425.5) / 365.2425);

  let shakaSamvat = approxGregYear - 78;
  if (lunarMonthIndex === 0 && paksha === 'Shukla') {
    shakaSamvat = approxGregYear - 78;
  }
  const vikramaSamvat = shakaSamvat + 135;
  const samvatsaraIndex = ((shakaSamvat + 11) % 60 + 60) % 60;
  const samvatsaraInfo = SAMVATSARA_60_NAMES[samvatsaraIndex];

  return {
    kaliYugaYear: kaliElapsed,
    vikramaSamvat,
    shakaSamvat,
    samvatsara60: {
      number: samvatsaraIndex + 1,
      name: samvatsaraInfo.name,
      sanskritName: samvatsaraInfo.devanagari,
    },
  };
}

// --- Master Choghadiya Generator ---

const CHOGHADIYA_TYPES: Record<string, { name: string; sanskrit: string; category: ChoghadiyaSlot['category']; nature: ChoghadiyaSlot['nature']; isAuspicious: boolean; planet: PlanetId; planetName: string }> = {
  Amrit: { name: 'Amṛta', sanskrit: 'अमृत', category: 'Amrit', nature: 'Best (Amṛta)', isAuspicious: true, planet: 'moon', planetName: 'Candra (Moon)' },
  Shubh: { name: 'Śubha', sanskrit: 'शुभ', category: 'Shubh', nature: 'Good (Śubha)', isAuspicious: true, planet: 'jupiter', planetName: 'Bṛhaspati (Jupiter)' },
  Labh: { name: 'Lābha', sanskrit: 'लाभ', category: 'Labh', nature: 'Gain (Lābha)', isAuspicious: true, planet: 'mercury', planetName: 'Budha (Mercury)' },
  Char: { name: 'Cala', sanskrit: 'चल', category: 'Char', nature: 'Neutral (Cala)', isAuspicious: true, planet: 'venus', planetName: 'Śukra (Venus)' },
  Rog: { name: 'Roga', sanskrit: 'रोग', category: 'Rog', nature: 'Disease (Roga)', isAuspicious: false, planet: 'mars', planetName: 'Maṅgala (Mars)' },
  Kaal: { name: 'Kāla', sanskrit: 'काल', category: 'Kaal', nature: 'Loss (Kāla)', isAuspicious: false, planet: 'saturn', planetName: 'Śani (Saturn)' },
  Udveg: { name: 'Udvega', sanskrit: 'उद्वेग', category: 'Udveg', nature: 'Anxiety (Udvega)', isAuspicious: false, planet: 'sun', planetName: 'Sūrya (Sun)' },
};

const DAY_CHOGHADIYA_ORDER = [
  ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
  ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
  ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
  ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Fri
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Sat
];

const NIGHT_CHOGHADIYA_ORDER = [
  ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
  ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'], // Mon
  ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'], // Tue
  ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wed
  ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thu
  ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'], // Fri
  ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'], // Sat
];

function generateChoghadiyaList(
  startJD: number,
  endJD: number,
  orderKeys: string[],
  currentJD: number,
  refJD: number,
  tzOffset: number
): ChoghadiyaSlot[] {
  const duration = (endJD - startJD) / 8.0;
  const result: ChoghadiyaSlot[] = [];

  for (let i = 0; i < 8; i++) {
    const sJD = startJD + i * duration;
    const eJD = startJD + (i + 1) * duration;
    const key = orderKeys[i];
    const def = CHOGHADIYA_TYPES[key];
    const isCurrent = currentJD >= sJD && currentJD < eJD;
    const timeRange = `${formatJDTo12Hour(sJD, refJD, tzOffset)} – ${formatJDTo12Hour(eJD, refJD, tzOffset)}`;

    result.push({
      number: i + 1,
      name: def.name,
      sanskritName: def.sanskrit,
      category: def.category,
      nature: def.nature,
      isAuspicious: def.isAuspicious,
      rulingPlanet: def.planet,
      rulingPlanetName: def.planetName,
      timeRange,
      startJD: sJD,
      endJD: eJD,
      isCurrent,
    });
  }
  return result;
}

// --- Master Pañcāṅga Calculation Engine ---

export function calculatePanchanga(
  sunLongitude: number,
  moonLongitude: number,
  jd: number,
  latitudeDeg: number,
  longitudeDeg: number,
  timezoneOffsetHours: number,
  ayanamshaType: AyanamshaType = 'lahiri',
  customAyanamsha: number = 0
): PanchangaResult {
  // 1. Precise Solar & Lunar Times (NOAA / Jean Meeus Algorithms)
  const sunTimes = calculateSolarTimes(jd, latitudeDeg, longitudeDeg, timezoneOffsetHours);
  const lunarTimes = calculateLunarTimes(jd, latitudeDeg, longitudeDeg, timezoneOffsetHours);

  // 2. TITHI: Elongation Δλ = (MoonSid - SunSid) / 12°
  const diffLong = normalizeDegrees(moonLongitude - sunLongitude);
  const tithiRaw = diffLong / 12.0;
  const tithiIndex = Math.floor(tithiRaw) % 30; // 0 to 29
  const tithiNumber = tithiIndex + 1;
  const tithiPercent = (tithiRaw - Math.floor(tithiRaw)) * 100;
  const paksha: 'Shukla' | 'Krishna' = tithiIndex < 15 ? 'Shukla' : 'Krishna';

  const tithiStartJD = findTithiTransitionJD(jd, tithiIndex, ayanamshaType, customAyanamsha);
  const tithiEndJD = findTithiTransitionJD(jd, tithiIndex + 1, ayanamshaType, customAyanamsha);
  const tithiStartTimeStr = formatJDTo12Hour(tithiStartJD, jd, timezoneOffsetHours);
  const tithiEndTimeStr = formatJDTo12Hour(tithiEndJD, jd, timezoneOffsetHours);
  const tithiHoursLeft = Math.max(0, (tithiEndJD - jd) * 24.0);
  const nextTithiName = TITHI_NAMES[(tithiIndex + 1) % 30];

  // Tithi Classification (Nandā, Bhadrā, Jayā, Riktā, Pūrṇā)
  const tithiModulo5 = tithiIndex % 5;
  const TITHI_NATURES: Array<'Nandā' | 'Bhadrā' | 'Jayā' | 'Riktā' | 'Pūrṇā'> = ['Nandā', 'Bhadrā', 'Jayā', 'Riktā', 'Pūrṇā'];
  const TITHI_TATTVA: Array<'Agni' | 'Pṛthvī' | 'Vāyu' | 'Jala' | 'Ākāśa'> = ['Agni', 'Pṛthvī', 'Vāyu', 'Jala', 'Ākāśa'];
  const tithiNature = TITHI_NATURES[tithiModulo5];
  const tithiTattva = TITHI_TATTVA[tithiModulo5];
  const tithiNityaDeity = TITHI_NITYA_DEVIS[tithiIndex];
  const tithiRulingPlanet = TITHI_RULING_PLANETS[tithiIndex];

  // Udaya Tithi (Tithi at exact moment of local sunrise)
  const sunriseSunMoon = getSiderealSunMoon(sunTimes.sunriseJD, ayanamshaType, customAyanamsha);
  const udayaDiffLong = normalizeDegrees(sunriseSunMoon.moonSid - sunriseSunMoon.sunSid);
  const udayaTithiIndex = Math.floor(udayaDiffLong / 12.0) % 30;
  const udayaTithi = TITHI_NAMES[udayaTithiIndex];

  // 3. NAKṢATRA: Sidereal Moon / 13°20'
  const nakSpan = 360.0 / 27.0;
  const nakRaw = moonLongitude / nakSpan;
  const nakIndex = Math.floor(nakRaw) % 27;
  const nakInfo = NAKSHATRAS[nakIndex];
  const nakPercent = (nakRaw - Math.floor(nakRaw)) * 100;
  const pada = (Math.floor((nakRaw - Math.floor(nakRaw)) * 4) + 1) as 1 | 2 | 3 | 4;

  const nakStartJD = findNakshatraTransitionJD(jd, nakIndex, ayanamshaType, customAyanamsha);
  const nakEndJD = findNakshatraTransitionJD(jd, nakIndex + 1, ayanamshaType, customAyanamsha);
  const nakStartTimeStr = formatJDTo12Hour(nakStartJD, jd, timezoneOffsetHours);
  const nakEndTimeStr = formatJDTo12Hour(nakEndJD, jd, timezoneOffsetHours);
  const nakHoursLeft = Math.max(0, (nakEndJD - jd) * 24.0);
  const nextNakName = NAKSHATRAS[(nakIndex + 1) % 27].name;

  const nakAttr = NAKSHATRA_ATTRIBUTES[nakIndex];
  const padaAkshara = nakAttr.padas[pada - 1];

  // Udaya Nakshatra (at Sunrise)
  const udayaNakIndex = Math.floor(sunriseSunMoon.moonSid / nakSpan) % 27;
  const udayaNakshatra = NAKSHATRAS[udayaNakIndex].name;

  // 4. YOGA: (Sidereal Sun + Sidereal Moon) / 13°20'
  const sumLong = normalizeDegrees(sunLongitude + moonLongitude);
  const yogaRaw = sumLong / nakSpan;
  const yogaIndex = Math.floor(yogaRaw) % 27;
  const yogaInfo = NITYA_YOGAS[yogaIndex];
  const yogaPercent = (yogaRaw - Math.floor(yogaRaw)) * 100;

  const yogaStartJD = findYogaTransitionJD(jd, yogaIndex, ayanamshaType, customAyanamsha);
  const yogaEndJD = findYogaTransitionJD(jd, yogaIndex + 1, ayanamshaType, customAyanamsha);
  const yogaStartTimeStr = formatJDTo12Hour(yogaStartJD, jd, timezoneOffsetHours);
  const yogaEndTimeStr = formatJDTo12Hour(yogaEndJD, jd, timezoneOffsetHours);
  const yogaHoursLeft = Math.max(0, (yogaEndJD - jd) * 24.0);
  const nextYogaName = NITYA_YOGAS[(yogaIndex + 1) % 27].name;

  const udayaYogaIndex = Math.floor(normalizeDegrees(sunriseSunMoon.sunSid + sunriseSunMoon.moonSid) / nakSpan) % 27;
  const udayaYoga = NITYA_YOGAS[udayaYogaIndex].name;

  // 5. KARAṆA: Half of a Tithi (6° span)
  const karanaRaw = diffLong / 6.0;
  const karanaIndex = Math.floor(karanaRaw) % 60; // 0 to 59
  const karanaPercent = (karanaRaw - Math.floor(karanaRaw)) * 100;

  let karanaName = '';
  let karanaSanskrit = '';
  let karanaDeity = '';
  let karanaType: 'Chara (Movable)' | 'Sthira (Fixed)' = 'Chara (Movable)';

  if (karanaIndex === 0) {
    karanaName = KARANA_FIXED[3].name; // Kiṃstughna
    karanaSanskrit = KARANA_FIXED[3].devanagari;
    karanaDeity = KARANA_FIXED[3].deity;
    karanaType = 'Sthira (Fixed)';
  } else if (karanaIndex >= 57) {
    const fIdx = karanaIndex - 57;
    karanaName = KARANA_FIXED[fIdx].name; // Śakuni, Catuṣpāda, Nāga
    karanaSanskrit = KARANA_FIXED[fIdx].devanagari;
    karanaDeity = KARANA_FIXED[fIdx].deity;
    karanaType = 'Sthira (Fixed)';
  } else {
    const mIdx = (karanaIndex - 1) % 7;
    karanaName = KARANA_MOVABLE[mIdx].name;
    karanaSanskrit = KARANA_MOVABLE[mIdx].devanagari;
    karanaDeity = KARANA_MOVABLE[mIdx].deity;
    karanaType = 'Chara (Movable)';
  }

  const karanaStartJD = findKaranaTransitionJD(jd, karanaIndex, ayanamshaType, customAyanamsha);
  const karanaEndJD = findKaranaTransitionJD(jd, karanaIndex + 1, ayanamshaType, customAyanamsha);
  const karanaStartTimeStr = formatJDTo12Hour(karanaStartJD, jd, timezoneOffsetHours);
  const karanaEndTimeStr = formatJDTo12Hour(karanaEndJD, jd, timezoneOffsetHours);
  const karanaHoursLeft = Math.max(0, (karanaEndJD - jd) * 24.0);
  const nextKaranaIndex = (karanaIndex + 1) % 60;
  const nextKaranaName = nextKaranaIndex === 0 ? 'Kiṃstughna' : nextKaranaIndex >= 57 ? KARANA_FIXED[nextKaranaIndex - 57].name : KARANA_MOVABLE[(nextKaranaIndex - 1) % 7].name;

  // Bhadrā (Viṣṭi) Location Determination
  const isBhadraActive = karanaName.includes('Viṣṭi') || karanaName.includes('Bhadrā');
  let bhadraLocation = 'Not Active';
  if (isBhadraActive) {
    const moonSign = Math.floor(moonLongitude / 30.0);
    // Aries, Taurus, Gemini, Scorpio -> Svarga
    if ([0, 1, 2, 7].includes(moonSign)) {
      bhadraLocation = 'Svarga Loka (Heaven — Auspicious on Earth)';
    } else if ([5, 6, 8, 9].includes(moonSign)) {
      // Virgo, Libra, Sagittarius, Capricorn -> Patala
      bhadraLocation = 'Pātāla Loka (Netherworld — Auspicious on Earth)';
    } else {
      // Cancer, Leo, Aquarius, Pisces -> Mrityu Loka (Earth)
      bhadraLocation = 'Mṛtyu Loka / Bhūloka (Earth — Highly Inauspicious)';
    }
  }

  const udayaKaranaRaw = udayaDiffLong / 6.0;
  const udayaKaranaIndex = Math.floor(udayaKaranaRaw) % 60;
  const udayaKarana = udayaKaranaIndex === 0 ? 'Kiṃstughna' : udayaKaranaIndex >= 57 ? KARANA_FIXED[udayaKaranaIndex - 57].name : KARANA_MOVABLE[(udayaKaranaIndex - 1) % 7].name;

  // 6. VĀRA (Vedic Weekday: Sunrise to Sunrise)
  // `jd` is UT. For a 04:00 IST birth the UT civil date is already the previous
  // day, so stepping back a whole day from `jd` moves back TWO local days and
  // reports Tuesday where Wednesday is correct. Shift to local time first,
  // then step back one day only if the moment precedes sunrise.
  const localJD = jd + timezoneOffsetHours / 24.0;
  const isBeforeSunrise = jd < sunTimes.sunriseJD;
  const effectiveVedicJD = isBeforeSunrise ? localJD - 1.0 : localJD;
  const vedicVaraIndex = Math.floor(effectiveVedicJD + 1.5) % 7;
  const civilWeekdayIndex = Math.floor(localJD + 1.5) % 7;

  const vedicVara = VARA_DETAILS[vedicVaraIndex];
  const civilVara = VARA_DETAILS[civilWeekdayIndex];

  // 7. HORA LORD AT CURRENT MOMENT (Chaldean Order: Sun, Ven, Mer, Moon, Sat, Jup, Mars)
  const CHALDEAN_HORA_LORDS: PlanetId[] = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'];
  const CHALDEAN_NAMES: Record<PlanetId, string> = {
    sun: 'Sūrya (Sun)',
    venus: 'Śukra (Venus)',
    mercury: 'Budha (Mercury)',
    moon: 'Candra (Moon)',
    saturn: 'Śani (Saturn)',
    jupiter: 'Bṛhaspati (Jupiter)',
    mars: 'Maṅgala (Mars)',
    rahu: 'Rāhu',
    ketu: 'Ketu',
    true_rahu: 'True Rāhu',
    true_ketu: 'True Ketu',
  };

  const hoursSinceSunrise = (jd - sunTimes.sunriseJD) * 24.0;
  const dayLengthHours = sunTimes.dayLengthHours;
  const nightLengthHours = sunTimes.nightLengthHours;
  const daytimeHoraLen = dayLengthHours / 12.0;
  const nighttimeHoraLen = nightLengthHours / 12.0;

  let currentHoraIndex = 0;
  if (hoursSinceSunrise >= 0 && hoursSinceSunrise < dayLengthHours) {
    currentHoraIndex = Math.floor(hoursSinceSunrise / daytimeHoraLen);
  } else if (hoursSinceSunrise >= dayLengthHours) {
    currentHoraIndex = 12 + Math.floor((hoursSinceSunrise - dayLengthHours) / nighttimeHoraLen);
  } else {
    // Before sunrise
    currentHoraIndex = 23;
  }
  const firstHoraLord = vedicVara.lord;
  const firstHoraChaldeanIdx = CHALDEAN_HORA_LORDS.indexOf(firstHoraLord);
  const currentHoraLord = CHALDEAN_HORA_LORDS[(firstHoraChaldeanIdx + currentHoraIndex) % 7];

  // 8. DINAMĀNA & RĀTRIMĀNA in Hours and Ghatis (1 Ghati = 24m, 1 Pala = 24s)
  const dayGhatis = dayLengthHours * 2.5;
  const dayGhatiInt = Math.floor(dayGhatis);
  const dayPalaInt = Math.round((dayGhatis - dayGhatiInt) * 60);

  const nightGhatis = nightLengthHours * 2.5;
  const nightGhatiInt = Math.floor(nightGhatis);
  const nightPalaInt = Math.round((nightGhatis - nightGhatiInt) * 60);

  // 9. AUSPICIOUS & INAUSPICIOUS MUHŪRTAS (12-Hour formatted ranges)
  const partDuration = dayLengthHours / 8.0;
  const muhurtaDuration = dayLengthHours / 15.0;
  const nightMuhurtaDuration = nightLengthHours / 15.0;

  const getPeriodFromSunrise = (startFraction: number, endFraction: number): string => {
    const startJD = sunTimes.sunriseJD + startFraction / 24.0;
    const endJD = sunTimes.sunriseJD + endFraction / 24.0;
    return `${formatJDTo12Hour(startJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(endJD, jd, timezoneOffsetHours)}`;
  };

  // Rāhu Kāla (1/8th of daytime)
  const rahuParts = [8, 2, 7, 5, 6, 4, 3];
  const rahuPart = rahuParts[vedicVaraIndex];
  const rahukala = getPeriodFromSunrise((rahuPart - 1) * partDuration, rahuPart * partDuration);

  // Yamagaṇḍa (1/8th of daytime)
  const yamaParts = [5, 4, 3, 2, 1, 7, 6];
  const yamaPart = yamaParts[vedicVaraIndex];
  const yamaghanta = getPeriodFromSunrise((yamaPart - 1) * partDuration, yamaPart * partDuration);

  // Gulika Kāla (1/8th of daytime)
  const gulikaParts = [7, 6, 5, 4, 3, 2, 1];
  const gulikaPart = gulikaParts[vedicVaraIndex];
  const gulikakala = getPeriodFromSunrise((gulikaPart - 1) * partDuration, gulikaPart * partDuration);

  // Abhijit Muhūrta: 8th daytime muhūrta (centered around Solar Noon)
  const noonHour = dayLengthHours / 2.0;
  const abhijitStart = noonHour - muhurtaDuration / 2.0;
  const abhijitEnd = noonHour + muhurtaDuration / 2.0;
  const abhijit =
    vedicVaraIndex === 3
      ? 'Inauspicious on Wednesday (Budhavāra)'
      : getPeriodFromSunrise(abhijitStart, abhijitEnd);

  // Brahma Muhūrta (14th Muhūrta of Night: [Sunrise - 2*nightMuhurta to Sunrise - 1*nightMuhurta])
  const brahmaStartJD = sunTimes.sunriseJD - (2 * nightMuhurtaDuration) / 24.0;
  const brahmaEndJD = sunTimes.sunriseJD - (1 * nightMuhurtaDuration) / 24.0;
  const brahmaMuhurta = `${formatJDTo12Hour(brahmaStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(brahmaEndJD, jd, timezoneOffsetHours)}`;

  // Prātaḥ Sandhyā (48 minutes before Sunrise until Sunrise)
  const pratahStartJD = sunTimes.sunriseJD - 48.0 / 1440.0;
  const pratahSandhya = `${formatJDTo12Hour(pratahStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(sunTimes.sunriseJD, jd, timezoneOffsetHours)}`;

  // Godhūli Muhūrta: Sunset ± 12 minutes
  const godhuliStartJD = sunTimes.sunsetJD - 12.0 / 1440.0;
  const godhuliEndJD = sunTimes.sunsetJD + 12.0 / 1440.0;
  const godhuli = `${formatJDTo12Hour(godhuliStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(godhuliEndJD, jd, timezoneOffsetHours)}`;

  // Sāyāhna Sandhyā (Sunset to 48 minutes after Sunset)
  const sayahnaEndJD = sunTimes.sunsetJD + 48.0 / 1440.0;
  const sayahnaSandhya = `${formatJDTo12Hour(sunTimes.sunsetJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(sayahnaEndJD, jd, timezoneOffsetHours)}`;

  // Vijaya Muhūrta: 11th daytime Muhūrta
  const vijayaStart = 10 * muhurtaDuration;
  const vijayaEnd = 11 * muhurtaDuration;
  const vijaya = getPeriodFromSunrise(vijayaStart, vijayaEnd);

  // Niśītha Muhūrta: 8th Muhūrta of the Night (centered around Solar Midnight)
  const midnightJD = sunTimes.sunsetJD + nightLengthHours / 48.0;
  const nishitaStartJD = midnightJD - nightMuhurtaDuration / 48.0;
  const nishitaEndJD = midnightJD + nightMuhurtaDuration / 48.0;
  const nishita = `${formatJDTo12Hour(nishitaStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(nishitaEndJD, jd, timezoneOffsetHours)}`;

  // Durmuhūrta (Classical inauspicious daytime muhūrtas by weekday)
  const durmuhurtaList: string[] = [];
  const addDurmuhurta = (mIndex: number) => {
    durmuhurtaList.push(getPeriodFromSunrise((mIndex - 1) * muhurtaDuration, mIndex * muhurtaDuration));
  };
  switch (vedicVaraIndex) {
    case 0: addDurmuhurta(14); break; // Sun: 14th
    case 1: addDurmuhurta(8); addDurmuhurta(12); break; // Mon: 8th, 12th
    case 2: addDurmuhurta(4); addDurmuhurta(11); break; // Tue: 4th, 11th
    case 3: addDurmuhurta(8); break; // Wed: 8th
    case 4: addDurmuhurta(6); addDurmuhurta(7); break; // Thu: 6th, 7th
    case 5: addDurmuhurta(4); addDurmuhurta(9); break; // Fri: 4th, 9th
    case 6: addDurmuhurta(1); addDurmuhurta(2); break; // Sat: 1st, 2nd
  }

  // Varjyam & Amṛta Kāla (Nakshatra-based Tyājya Kāla)
  const varjyamOffsetGhati = VARJYAM_GHATI_OFFSETS[nakIndex] || 24;
  const varjyamStartJD = nakStartJD + (varjyamOffsetGhati * 24.0) / 1440.0;
  const varjyamEndJD = varjyamStartJD + (4 * 24.0) / 1440.0;
  const varjyam = `${formatJDTo12Hour(varjyamStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(varjyamEndJD, jd, timezoneOffsetHours)}`;

  const amritStartJD = varjyamStartJD + (42 * 24.0) / 1440.0;
  const amritEndJD = amritStartJD + (4 * 24.0) / 1440.0;
  const amritKalam = `${formatJDTo12Hour(amritStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(amritEndJD, jd, timezoneOffsetHours)}`;

  // 10. SPECIAL AUSPICIOUS YOGAS
  // Amrita Siddhi Yoga (Vara + Nakshatra)
  const amritSiddhiMap: Record<number, number> = {
    0: 12, // Sun + Hasta (13th, 0-indexed 12)
    1: 4,  // Mon + Mrigashirsha (5th, 0-indexed 4)
    2: 0,  // Tue + Ashwini (1st, 0-indexed 0)
    3: 16, // Wed + Anuradha (17th, 0-indexed 16)
    4: 7,  // Thu + Pushya (8th, 0-indexed 7)
    5: 26, // Fri + Revati (27th, 0-indexed 26)
    6: 3,  // Sat + Rohini (4th, 0-indexed 3)
  };
  const amritaSiddhiYoga =
    amritSiddhiMap[vedicVaraIndex] === nakIndex
      ? `Amṛta Siddhi Yoga is active today (${vedicVara.name} + ${nakInfo.name})`
      : null;

  // Sarvartha Siddhi Yoga
  const sarvarthaMap: Record<number, number[]> = {
    0: [12, 18, 11, 20, 25, 7, 0], // Sun: Hasta, Mula, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Pushya, Ashwini
    1: [3, 4, 7, 16, 21], // Mon: Rohini, Mrigashira, Pushya, Anuradha, Shravana
    2: [0, 2, 25, 8], // Tue: Ashwini, Krittika, Uttara Bhadrapada, Ashlesha
    3: [3, 16, 12, 2, 4], // Wed: Rohini, Anuradha, Hasta, Krittika, Mrigashira
    4: [7, 6, 16, 0, 26], // Thu: Pushya, Punarvasu, Anuradha, Ashwini, Revati
    5: [26, 16, 0, 6, 12], // Fri: Revati, Anuradha, Ashwini, Punarvasu, Hasta
    6: [3, 14, 21], // Sat: Rohini, Swati, Shravana
  };
  const sarvarthaSiddhiYoga =
    sarvarthaMap[vedicVaraIndex]?.includes(nakIndex)
      ? `Sarvārtha Siddhi Yoga is active today (${vedicVara.name} + ${nakInfo.name})`
      : null;

  const pushyaYoga =
    vedicVaraIndex === 4 && nakIndex === 7
      ? 'Guru Puṣya Yoga (Highly Auspicious Mahā-Muhūrta)'
      : vedicVaraIndex === 0 && nakIndex === 7
      ? 'Ravi Puṣya Yoga (Highly Auspicious Mahā-Muhūrta)'
      : null;

  // 11. CHOGHADIYA TABLES (Day & Night)
  const nextDaySunriseJD = sunTimes.sunriseJD + 1.0;
  const choghadiyaDay = generateChoghadiyaList(
    sunTimes.sunriseJD,
    sunTimes.sunsetJD,
    DAY_CHOGHADIYA_ORDER[vedicVaraIndex],
    jd,
    jd,
    timezoneOffsetHours
  );
  const choghadiyaNight = generateChoghadiyaList(
    sunTimes.sunsetJD,
    nextDaySunriseJD,
    NIGHT_CHOGHADIYA_ORDER[vedicVaraIndex],
    jd,
    jd,
    timezoneOffsetHours
  );

  // 12. SOLAR MONTH (Sauramāsa) & SAṄKRĀNTI
  const sankrantiInfo = findSankrantiTimings(jd, sunLongitude, ayanamshaType, customAyanamsha);
  const solarMonthInfo = SOLAR_MONTH_NAMES[sankrantiInfo.currentSignIndex];
  const solarDay = Math.floor(jd - sankrantiInfo.prevSankrantiJD) + 1;
  const sunDegInRashi = sunLongitude % 30.0;
  const degD = Math.floor(sunDegInRashi);
  const degM = Math.floor((sunDegInRashi - degD) * 60);
  const degS = Math.round(((sunDegInRashi - degD) * 60 - degM) * 60);
  const sunDegreeInRashiStr = `${degD}° ${degM}′ ${degS}″`;

  const nextSankrantiDateStr = formatJDTo12Hour(sankrantiInfo.nextSankrantiJD, jd, timezoneOffsetHours);
  const nextSankrantiName = `${SOLAR_MONTH_NAMES[sankrantiInfo.nextSignIndex].signName} Saṅkrānti`;
  const currentSankrantiName = `${SOLAR_MONTH_NAMES[sankrantiInfo.currentSignIndex].signName} Saṅkrānti`;

  // Puṇya Kāla: 16 Ghatis (6.4 hours) window around Saṅkrānti
  const punyaStartJD = sankrantiInfo.nextSankrantiJD - 6.4 / 24.0;
  const punyaEndJD = sankrantiInfo.nextSankrantiJD + 6.4 / 24.0;
  const punyaKalaWindow = `${formatJDTo12Hour(punyaStartJD, jd, timezoneOffsetHours)} – ${formatJDTo12Hour(punyaEndJD, jd, timezoneOffsetHours)}`;

  // 13. LUNAR MONTH (Cāndramāsa)
  const lunarMonthData = calculateLunarMonthDetails(jd, ayanamshaType, customAyanamsha, paksha);

  // 14. ṚTU & AYANA
  const rtu = calculateRtu(sunLongitude);
  const ayana = calculateAyana(sunLongitude);

  // 15. TRADITIONAL ERAS
  const eras = calculateCalendarEras(jd, sankrantiInfo.currentSignIndex, paksha);

  return {
    tithi: {
      number: tithiNumber,
      name: TITHI_NAMES[tithiIndex],
      sanskritName: TITHI_SANSKRIT[tithiIndex],
      paksha,
      percentElapsed: parseFloat(tithiPercent.toFixed(1)),
      deity: TITHI_DEITIES[tithiIndex],
      nityaDeity: tithiNityaDeity,
      nature: tithiNature,
      tattva: tithiTattva,
      rulingPlanet: tithiRulingPlanet,
      udayaTithi,
      startTime: tithiStartTimeStr,
      endTime: tithiEndTimeStr,
      endTimeJD: tithiEndJD,
      durationLeftHours: parseFloat(tithiHoursLeft.toFixed(1)),
      nextTithiName,
    },
    vara: {
      number: vedicVaraIndex,
      name: vedicVara.name,
      sanskritName: vedicVara.sanskritName,
      lord: vedicVara.lord,
      horaLordNow: currentHoraLord,
      horaLordNowName: CHALDEAN_NAMES[currentHoraLord],
      deity: vedicVara.deity,
      metal: vedicVara.metal,
      color: vedicVara.color,
      sunriseVedicVara: `${vedicVara.name} (${vedicVara.sanskritName})`,
      civilWeekday: civilVara.civilName,
    },
    nakshatra: {
      number: nakInfo.number,
      name: nakInfo.name,
      sanskritName: nakInfo.sanskritName || nakInfo.name,
      pada,
      percentElapsed: parseFloat(nakPercent.toFixed(1)),
      lord: nakInfo.lord,
      deity: nakInfo.deity,
      gana: nakInfo.gana,
      yoni: nakInfo.yoni,
      nadi: nakInfo.nadi,
      varna: nakAttr.varna,
      tattva: nakAttr.tattva,
      paya: nakAttr.paya,
      akshara: padaAkshara,
      udayaNakshatra,
      startTime: nakStartTimeStr,
      endTime: nakEndTimeStr,
      endTimeJD: nakEndJD,
      durationLeftHours: parseFloat(nakHoursLeft.toFixed(1)),
      nextNakshatraName: nextNakName,
    },
    yoga: {
      number: yogaIndex + 1,
      name: yogaInfo.name,
      sanskritName: yogaInfo.devanagari,
      percentElapsed: parseFloat(yogaPercent.toFixed(1)),
      auspiciousness: yogaInfo.auspiciousness as 'Auspicious (Śubha)' | 'Inauspicious (Aśubha)',
      deity: yogaInfo.deity,
      udayaYoga,
      startTime: yogaStartTimeStr,
      endTime: yogaEndTimeStr,
      endTimeJD: yogaEndJD,
      durationLeftHours: parseFloat(yogaHoursLeft.toFixed(1)),
      nextYogaName,
    },
    karana: {
      number: karanaIndex + 1,
      name: karanaName,
      sanskritName: karanaSanskrit,
      type: karanaType,
      deity: karanaDeity,
      percentElapsed: parseFloat(karanaPercent.toFixed(1)),
      isBhadraActive,
      bhadraLocation,
      udayaKarana,
      startTime: karanaStartTimeStr,
      endTime: karanaEndTimeStr,
      endTimeJD: karanaEndJD,
      durationLeftHours: parseFloat(karanaHoursLeft.toFixed(1)),
      nextKaranaName,
    },
    sunTimes: {
      sunrise: sunTimes.sunriseLocalHours,
      sunset: sunTimes.sunsetLocalHours,
      moonrise: lunarTimes.moonriseLocalHours,
      moonset: lunarTimes.moonsetLocalHours,
      solarNoon: formatJDTo12Hour(sunTimes.solarNoonJD, jd, timezoneOffsetHours),
      civilDawn: sunTimes.civilDawnLocalHours,
      civilDusk: sunTimes.civilDuskLocalHours,
      nauticalDawn: sunTimes.nauticalDawnLocalHours,
      astronomicalDawn: sunTimes.astronomicalDawnLocalHours,
      dayDuration: `${Math.floor(dayLengthHours)}h ${Math.round((dayLengthHours % 1) * 60)}m`,
      nightDuration: `${Math.floor(nightLengthHours)}h ${Math.round((nightLengthHours % 1) * 60)}m`,
      dayDurationGhatis: `${dayGhatiInt} Ghatis ${dayPalaInt} Palas`,
      nightDurationGhatis: `${nightGhatiInt} Ghatis ${nightPalaInt} Palas`,
      sunriseJD: sunTimes.sunriseJD,
      sunsetJD: sunTimes.sunsetJD,
      solarNoonJD: sunTimes.solarNoonJD,
      equationOfTime: `${sunTimes.equationOfTimeMinutes > 0 ? '+' : ''}${sunTimes.equationOfTimeMinutes.toFixed(2)} mins`,
      sunDeclination: `${sunTimes.sunDeclinationDeg.toFixed(2)}°`,
      moonPhaseName: lunarTimes.moonPhaseName,
      moonIlluminationPct: lunarTimes.moonIlluminationPct,
    },
    muhurtas: {
      rahukala,
      yamaghanta,
      gulikakala,
      abhijit,
      brahmaMuhurta,
      pratahSandhya,
      godhuli,
      sayahnaSandhya,
      vijaya,
      nishita,
      durmuhurta: durmuhurtaList,
      amritKalam,
      varjyam,
      amritaSiddhiYoga,
      sarvarthaSiddhiYoga,
      pushyaYoga,
      choghadiyaDay,
      choghadiyaNight,
    },
    calendar: {
      solarMonth: {
        number: sankrantiInfo.currentSignIndex + 1,
        name: solarMonthInfo.name,
        sanskritName: solarMonthInfo.sanskrit,
        rashiName: solarMonthInfo.signName,
        solarDay,
        sunDegreeInRashi: sunDegreeInRashiStr,
      },
      lunarMonth: {
        amantaName: lunarMonthData.amantaName,
        purnimantaName: lunarMonthData.purnimantaName,
        isAdhika: lunarMonthData.isAdhika,
        isKshaya: lunarMonthData.isKshaya,
        status: lunarMonthData.status,
      },
      sankranti: {
        currentSankrantiName,
        nextSankrantiName,
        nextSankrantiDateTime: nextSankrantiDateStr,
        nextSankrantiJD: sankrantiInfo.nextSankrantiJD,
        punyaKalaWindow,
      },
      rtu,
      ayana,
      eras,
    },
  };
}

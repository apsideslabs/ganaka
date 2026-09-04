/**
 * Gaṇaka — Jaimini Upadeśa Sūtra Engine
 * Computes:
 * - 7/8 Chara Karakas (AK, AmK, BK, MK, PiK, PK, GK, DK)
 * - 12 Arūḍha Padas (AL, UL, A2..A12) with classical 1st/7th exception rules
 * - Kārakāṃśa and Swāṃśa
 * strictly per Maharṣi Jaimini Upadeśa Sūtras (Ch. 1-3).
 */

import { PlanetId } from '../astronomy/ephemeris';
import { JaiminiFactors, RashiNumber } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import { calculateVargaRashi } from '../vargas/varga-engine';

export const CHARA_KARAKA_NAMES = {
  AK: { name: 'Ātmakāraka (AK)', sanskrit: 'आत्मकारक', role: 'Soul, self, spiritual destiny, true core purpose' },
  AmK: { name: 'Amātyakāraka (AmK)', sanskrit: 'अमात्यकारक', role: 'Career, minister, intellectual execution, status' },
  BK: { name: 'Bhrātṛkāraka (BK)', sanskrit: 'भ्रातृकारक', role: 'Siblings, guru, mentors, courage' },
  MK: { name: 'Mātṛkāraka (MK)', sanskrit: 'मातृकारक', role: 'Mother, emotional peace, education, residence' },
  PiK: { name: 'Pitṛkāraka (PiK)', sanskrit: 'पितृकारक', role: 'Father, lineage, ancestry (8-karaka scheme)' },
  PK: { name: 'Putrakāraka (PK)', sanskrit: 'पुत्रकारक', role: 'Progeny, creativity, intelligence, mantra siddhi' },
  GK: { name: 'Jñātikāraka (GK)', sanskrit: 'ज्ञातिकारक', role: 'Relatives, obstacles, rivalries, struggle' },
  DK: { name: 'Dārakāraka (DK)', sanskrit: 'दारकारक', role: 'Spouse, partnerships, intimacy, worldly desires' },
};

export interface CharaKarakaClassicalInfo {
  key: 'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK';
  name: string;
  sanskrit: string;
  shortLabel: string;
  role: string;
  order7: number | null;
  order8: number;
  literalMeaning: string;
  significations: string[];
  jaiminiSutraRef: {
    sutra: string;
    sanskrit: string;
    transliteration: string;
    translation: string;
  };
  bphsRef: {
    reference: string;
    sanskrit: string;
    transliteration: string;
    translation: string;
  };
  classicalApplication: string;
}

export const CHARA_KARAKA_CLASSICAL_DATA: Record<
  'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK',
  CharaKarakaClassicalInfo
> = {
  AK: {
    key: 'AK',
    name: 'Ātmakāraka',
    sanskrit: 'आत्मकारक',
    shortLabel: 'AK',
    role: 'Soul Indicator, Supreme arbiter of Destiny, Bondage & Liberation',
    order7: 1,
    order8: 1,
    literalMeaning: 'Significator of the Inner Self / Soul (Ātman)',
    significations: [
      'Core soul purpose, spiritual incarnation mission, and physical constitution (tanu)',
      'Primary arbiter of spiritual liberation (Mokṣa) or karmic bondage (Bandha)',
      'King (Pradhāna / Rājā) of the entire horoscope; all other grahas act as subjects',
      'Determines Kārakāṃśa (D-9 Navāṃśa sign of AK) for spiritual gifts and destiny',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.10–12',
      sanskrit: 'अथ आत्माधिकः कलादिभिर्नभोगः सप्तानामष्टानां वा॥ स इष्टे बन्धमोक्षयोः॥ प्रधानः सः॥',
      transliteration: 'atha ātmādhikaḥ kalādibhirnabhogaḥ saptānāmaṣṭānāṃ vā || sa iṣṭe bandhamokṣayoḥ || pradhānaḥ saḥ ||',
      translation:
        'Of the seven or eight planets, the one having traversed the highest degree, minute, and second in a sign is the Ātmakāraka. It is the lord of bondage and liberation, and the supreme sovereign of the nativity.',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.5–6',
      sanskrit: 'अंशाधिको ग्रहो ज्ञेयः सर्वकारकमुख्यतः। आत्मकारकनामासौ सर्वकर्माधिकारी च॥',
      transliteration: 'aṃśādhiko graho jñeyaḥ sarvakārakamukhyataḥ | ātmakārakanāmāsau sarvakarmādhikārī ca ||',
      translation:
        'The planet with the highest advancement in degrees is foremost among all Kārakas. Termed Ātmakāraka, it holds supreme authority over all actions and karmas.',
    },
    classicalApplication:
      'The sign occupied by Ātmakāraka in Navāṃśa (D-9) is the Kārakāṃśa. Benefic influences on Kārakāṃśa give spiritual elevation, whereas affliction signifies intense karmic tests and spiritual purification.',
  },
  AmK: {
    key: 'AmK',
    name: 'Amātyakāraka',
    sanskrit: 'अमात्यकारक',
    shortLabel: 'AmK',
    role: 'Mind, Intellect, Career Execution, Ministerial Rank & Status',
    order7: 2,
    order8: 2,
    literalMeaning: 'Significator of the Minister / Chief Executive Advisor',
    significations: [
      'Intellect in execution (buddhi), career path, profession, and administrative power',
      'Ministerial counsel, official authority, royal patronage, and social status',
      'Primary collaborator with the Ātmakāraka; their connection defines Rāja Yogas',
      'Financial achievement, vocational leadership, and public influence',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.13',
      sanskrit: 'तस्यानुसरणादमात्यः॥',
      transliteration: 'tasyānusaraṇādamātyaḥ ||',
      translation:
        'The planet following the Ātmakāraka in degree advancement becomes the Amātyakāraka (Minister/Counselor).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.14',
      sanskrit: 'तदल्पभागो यो ज्ञेयो ह्यमात्यः स निगद्यते। कर्मणां च तदाधीनो राज्यसंस्थानमेव च॥',
      transliteration: 'tadalpabhāgo yo jñeyo hyamātyaḥ sa nigadyate | karmaṇāṃ ca tadadhīno rājyasaṃsthānameva ca ||',
      translation:
        'The planet with degrees immediately lesser than Ātmakāraka is declared Amātyakāraka. Under its governance are all actions, official duties, and state establishment.',
    },
    classicalApplication:
      'When AK and AmK are conjunct, in mutual aspect (Rāśi Dṛṣṭi), or placed in Kendra/Trikona from each other, it produces powerful Jaimini Rāja Yogas for high executive rank and prestige.',
  },
  BK: {
    key: 'BK',
    name: 'Bhrātṛkāraka',
    sanskrit: 'भ्रातृकारक',
    shortLabel: 'BK',
    role: 'Siblings, Spiritual Preceptor (Guru), Mentors & Valour',
    order7: 3,
    order8: 3,
    literalMeaning: 'Significator of Brothers, Comrades & Gurus',
    significations: [
      'Siblings (co-borns), spiritual mentors, Gurus, preceptors, and guides',
      'Inner courage, heroism (parākrama), enterprise, and chivalrous drive',
      'Spiritual companions and trusted allies on the dharmic journey',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.14',
      sanskrit: 'तस्यानु भ्राता॥',
      transliteration: 'tasyānu bhrātā ||',
      translation:
        'Following the Amātyakāraka in degree advancement is the Bhrātṛkāraka (Brothers & Gurus).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.15',
      sanskrit: 'तदल्पभागो यो ज्ञेयो भ्रातृकारक उच्यते। सहोदराणां गुरोश्च पराक्रमविचारणे॥',
      transliteration: 'tadalpabhāgo yo jñeyo bhrātṛkāraka ucyate | sahodarāṇāṃ gurośca parākramavicāraṇe ||',
      translation:
        'The planet with degrees next lower is designated Bhrātṛkāraka, investigated for brothers, spiritual Gurus, and valorous enterprises.',
    },
    classicalApplication:
      'In Jaimini, BK is specifically examined for the Guru and spiritual preceptors in addition to co-borns. Connection of BK with AK in D-9 indicates profound guidance from an enlightened master.',
  },
  MK: {
    key: 'MK',
    name: 'Mātṛkāraka',
    sanskrit: 'मातृकारक',
    shortLabel: 'MK',
    role: 'Mother, Emotional Peace, Nurturing, Dwelling & Conveyances',
    order7: 4,
    order8: 4,
    literalMeaning: 'Significator of Mother & Domestic Bliss',
    significations: [
      'Mother, emotional contentment (hṛdaya sukha), inner peace, and maternal lineage',
      'Vehicles (vāhana), landed property, residential comforts, and domestic foundation',
      'Primary education, emotional stability, and psychological wellness',
      'In the 7-kāraka system, Mātṛkāraka also encompasses paternal welfare when Pitṛkāraka is merged',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.15',
      sanskrit: 'तस्यानु माता॥',
      transliteration: 'tasyānu mātā ||',
      translation:
        'Following the Bhrātṛkāraka in degree advancement is the Mātṛkāraka (Mother).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.16',
      sanskrit: 'ततोऽल्पभागो यो ज्ञेयो मातृकारक उच्यते। सुखस्य वाहनादेश्च भूम्यादीनां प्रदायकः॥',
      transliteration: "tato'lpabhāgo yo jñeyo mātṛkāraka ucyate | sukhasya vāhanādeśca bhūmyādīnāṃ pradāyakaḥ ||",
      translation:
        'The planet with degrees next lower is known as Mātṛkāraka, bestowing motherly nurturing, happiness, conveyances, and landed property.',
    },
    classicalApplication:
      'A fortified MK in friendly signs or Kendra from Lagna/AL bestows great domestic prosperity, emotional serenity, and acquisition of fine properties and conveyances.',
  },
  PiK: {
    key: 'PiK',
    name: 'Pitṛkāraka',
    sanskrit: 'पितृकारक',
    shortLabel: 'PiK',
    role: 'Father, Ancestral Lineage & Dharma (8-Kāraka Scheme)',
    order7: null,
    order8: 5,
    literalMeaning: 'Significator of Father & Ancestral Heritage',
    significations: [
      'Father, paternal lineage, ancestral heritage, and blessings of the Pitṛs',
      'Righteousness (Dharma), ancestral tradition (kula-dharma), and spiritual heritage',
      'Active specifically in the 8-kāraka classical tradition where Rāhu is included',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.16 (Aṣṭakāraka Pakṣa)',
      sanskrit: 'तस्यानु पिता॥',
      transliteration: 'tasyānu pitā ||',
      translation:
        'In the eight-kāraka tradition, the planet next in order of advancement is the Pitṛkāraka (Father).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.17',
      sanskrit: 'अष्टकारके पक्षे तु पितृकारक उच्यते। धर्मस्य च पितुश्चैव वंशस्य च प्रवर्धकः॥',
      transliteration: 'aṣṭakārake pakṣe tu pitṛkāraka ucyate | dharmasya ca pituścaiva vaṃśasya ca pravardhakaḥ ||',
      translation:
        'In the 8-kāraka system, the subsequent planet is Pitṛkāraka, promoting righteousness, fatherly protection, and lineage continuity.',
    },
    classicalApplication:
      'Used exclusively in the classical 8-kāraka methodology (with Rāhu). Affliction to PiK points to Pitṛ Doṣa or difficulties regarding paternal inheritance and paternal longevity.',
  },
  PK: {
    key: 'PK',
    name: 'Putrakāraka',
    sanskrit: 'पुत्रकारक',
    shortLabel: 'PK',
    role: 'Children, Creative Genius, Intellect, Mantra Siddhi & Merit',
    order7: 5,
    order8: 6,
    literalMeaning: 'Significator of Progeny, Wisdom & Creative Intellect',
    significations: [
      'Progeny (children), creative faculties, and discriminative wisdom (prajñā)',
      'Sacred knowledge, higher scholarship, memory, and mantra-japa siddhi',
      'Merit acquired from previous incarnations (Pūrva Puṇya), students, and disciples',
      'Speculative judgment, intuitive intelligence, and creative literature/art',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.16/17',
      sanskrit: 'तस्यानु पुत्रः॥',
      transliteration: 'tasyānu putraḥ ||',
      translation:
        'The planet following in degree advancement is the Putrakāraka (Progeny & Intellect).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.18',
      sanskrit: 'ततोऽल्पभागो यः खेटः पुत्रकारक उच्यते। प्रजायाश्चापि विद्याया मन्त्रादीनां प्रसाधकः॥',
      transliteration: 'tato\'lpabhāgo yaḥ kheṭaḥ putrakāraka ucyate | prajāyāścāpi vidyāyā mantrādīnāṃ prasādhakaḥ ||',
      translation:
        'The planet with lesser degrees is Putrakāraka, accomplishing matters of progeny, higher learning, intellect, and sacred mantras.',
    },
    classicalApplication:
      'Connection between AK and PK produces Jaimini Saraswatī and Vidyā Yogas, conferring profound erudition, authorship, and spiritual disciples.',
  },
  GK: {
    key: 'GK',
    name: 'Jñātikāraka',
    sanskrit: 'ज्ञातिकारक',
    shortLabel: 'GK',
    role: 'Kinsmen, Collaterals, Obstacles, Rivalries & Karmic Battles',
    order7: 6,
    order8: 7,
    literalMeaning: 'Significator of Kinsmen, Competitors & Struggles',
    significations: [
      'Collateral relatives, cousins, kinsmen, and competitive peers',
      'Rivalries, legal disputes, litigation, open or secret adversaries, and opposition',
      'Physical ailments, diseases, systemic vulnerabilities, debts, and karmic hurdles',
      'Endurance through adversity, resilience, and triumph over challenges',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.18',
      sanskrit: 'तस्यानु ज्ञातिः॥',
      transliteration: 'tasyānu jñātiḥ ||',
      translation:
        'The planet following in degree advancement is the Jñātikāraka (Kinsmen & Obstacles).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.19',
      sanskrit: 'ततोऽल्पभागो यो ज्ञेयो ज्ञातिकारक उच्यते। बन्धूनां रिपुभावानां रोगाणां च प्रदर्शकः॥',
      transliteration: "tato'lpabhāgo yo jñeyo jñātikāraka ucyate | bandhūnāṃ ripubhāvānāṃ rogāṇāṃ ca pradarśakaḥ ||",
      translation:
        'The planet with degrees next lower is Jñātikāraka, indicating collateral kinsmen, hostile adversaries, and physical ailments.',
    },
    classicalApplication:
      'In Jaimini Daśā analysis, periods of signs occupied or aspected by GK signify periods of intense struggle, litigation, or rivalry requiring stoic resilience.',
  },
  DK: {
    key: 'DK',
    name: 'Dārakāraka',
    sanskrit: 'दारकारक',
    shortLabel: 'DK',
    role: 'Spouse, Marriage, Intimacy, Worldly Partnerships & Contracts',
    order7: 7,
    order8: 8,
    literalMeaning: 'Significator of Spouse & Worldly Alliances',
    significations: [
      'Spouse, marriage partner, intimacy, romantic compatibility, and marital harmony',
      'Business partnerships, commercial trades, public contracts, and legal unions',
      'Sensory enjoyment (bhoga), worldly desires, and external manifestations of relationship',
      'Mutual relationship with Upapada Lagna (UL / A7) defines marital durability',
    ],
    jaiminiSutraRef: {
      sutra: 'Jaimini Upadeśa Sūtra 1.1.19',
      sanskrit: 'तस्यानु दारः॥',
      transliteration: 'tasyānu dāraḥ ||',
      translation:
        'The planet having the lowest advancement in degrees is the Dārakāraka (Spouse).',
    },
    bphsRef: {
      reference: 'Bṛhat Parāśara Horā Śāstra 32.20',
      sanskrit: 'सर्वतोऽल्पतमांशो यः स ज्ञेयो दारकारकः। जायायाश्च विवाहादेर्भोगानां च प्रसाधकः॥',
      transliteration: 'sarvato\'lpatamāṃśo yaḥ sa jñeyo dārakārakaḥ | jāyāyāśca vivāhāderbhogānāṃ ca prasādhakaḥ ||',
      translation:
        'The planet with the least degrees among all is known as Dārakāraka, accomplishing matters of spouse, marriage, and worldly enjoyment.',
    },
    classicalApplication:
      'The nature and placement of DK reveals the character, profession, and appearance of the spouse. A strong connection between AK and DK produces enduring marriage and profound mutual loyalty.',
  },
};

/**
 * Calculates 7 or 8 Chara Karakas, 12 Arūḍha Padas, and Kārakāṃśa.
 */
export function calculateJaiminiFactors(
  planets: Record<PlanetId, { siderealLongitude: number }>,
  lagnaLongitude: number,
  scheme: '7_karaka' | '8_karaka' = '7_karaka'
): JaiminiFactors {
  const eligibleGrahas: PlanetId[] =
    scheme === '8_karaka'
      ? ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu']
      : ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

  // Degrees in sign (0 to 30)
  // Rahu is retrograde, in Jaimini some take 30 - deg, standard is degree advanced
  const sorted = eligibleGrahas
    .map((pId) => {
      const pos = planets[pId];
      let degInRashi = pos.siderealLongitude % 30;
      if (pId === 'rahu' && scheme === '8_karaka') {
        degInRashi = 30.0 - degInRashi; // Rahu traverses backward
      }
      return {
        planet: pId,
        planetName: pId.toUpperCase(),
        degrees: degInRashi,
      };
    })
    .sort((a, b) => b.degrees - a.degrees);

  const keys7: Array<'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK'> = [
    'AK',
    'AmK',
    'BK',
    'MK',
    'PK',
    'GK',
    'DK',
  ];

  const keys8: Array<'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK'> = [
    'AK',
    'AmK',
    'BK',
    'MK',
    'PiK',
    'PK',
    'GK',
    'DK',
  ];

  const keys = scheme === '8_karaka' ? keys8 : keys7;

  const charaKarakas = sorted.map((item, idx) => {
    const kKey = keys[idx];
    return {
      planet: item.planet,
      planetName: item.planetName,
      karakaKey: kKey,
      karakaName: CHARA_KARAKA_NAMES[kKey].name,
      degrees: parseFloat(item.degrees.toFixed(4)),
    };
  });

  // Calculate 12 Arūḍha Padas (A1=AL, A2..A12, A12=UL/Upapada)
  const lagnaRashi = (Math.floor(lagnaLongitude / 30) + 1) as RashiNumber;
  const arudhaPadas: JaiminiFactors['arudhaPadas'] = [];

  for (let h = 1; h <= 12; h++) {
    const houseRashi = (((lagnaRashi - 1 + (h - 1)) % 12) + 1) as RashiNumber;
    const lord = RASHIS[houseRashi].lord;
    const lordPos = planets[lord];
    const lordRashi = lordPos
      ? ((Math.floor(lordPos.siderealLongitude / 30) + 1) as RashiNumber)
      : houseRashi;

    // Distance from house to lord (in signs, 1 to 12)
    let dist = lordRashi - houseRashi;
    if (dist < 0) dist += 12;
    dist += 1; // 1-indexed

    // Raw Pada = lordRashi + dist - 1
    let rawPadaRashi = (((lordRashi - 1 + (dist - 1)) % 12) + 1) as RashiNumber;

    // Jaimini Exception Rules for Arūḍha:
    // If the Pada falls in the same sign (1st) -> shift to 10th sign
    // If the Pada falls in the 7th sign from the house -> shift to 4th sign (10th from 7th)
    let finalPadaRashi = rawPadaRashi;
    if (rawPadaRashi === houseRashi) {
      finalPadaRashi = (((houseRashi - 1 + 9) % 12) + 1) as RashiNumber; // 10th sign
    } else {
      const distFromHouse = (((rawPadaRashi - houseRashi + 12) % 12) + 1);
      if (distFromHouse === 7) {
        finalPadaRashi = (((houseRashi - 1 + 3) % 12) + 1) as RashiNumber; // 4th sign (10th from 7th)
      }
    }

    let pName = `A${h}`;
    if (h === 1) pName = 'AL (Arūḍha Lagna)';
    else if (h === 12) pName = 'UL (Upapada Lagna)';
    else if (h === 4) pName = 'A4 (Mātṛ Pada)';
    else if (h === 7) pName = 'A7 (Dāra Pada)';
    else if (h === 9) pName = 'A9 (Bhāgya Pada)';
    else if (h === 10) pName = 'A10 (Rājya Pada)';

    arudhaPadas.push({
      house: h,
      name: pName,
      rashiNumber: finalPadaRashi,
      rashiName: RASHIS[finalPadaRashi].sanskritName,
    });
  }

  // Kārakāṃśa: Sign occupied by Ātmakāraka in Navāṃśa (D9)
  const ak = charaKarakas[0];
  const akLong = planets[ak.planet].siderealLongitude;
  const akNavamsha = calculateVargaRashi(akLong, 'D9');
  const karakamshaRashi = akNavamsha.rashiNumber;

  // Swāṃśa: Lagna in Navāṃśa
  const lagnaNavamsha = calculateVargaRashi(lagnaLongitude, 'D9');
  const swamshaRashi = lagnaNavamsha.rashiNumber;

  return {
    charaKarakas,
    arudhaPadas,
    karakamshaRashi,
    swamshaRashi,
  };
}

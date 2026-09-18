/**
 * Gaṇaka — Deeper Classical Marriage Matching Engine
 * 
 * Implements classical factors beyond the 8-Kūṭa lunar matrix:
 * 1. 7th Bhāva & 7th Lord Affinity (BPHS Ch. 80, Jātaka Pārijāta Ch. 14)
 * 2. Natural Significators (Śukra / Guru) Harmony (Phaladīpikā Ch. 10)
 * 3. Navāṃśa (D-9) Lagna & Moon Harmony (Phaladīpikā Ch. 10, Jātaka Pārijāta)
 * 4. Jaimini Upapada Lagna (UL) & Dārakāraka (DK) Agreement (Jaimini Upadeśa Sūtras Ch. 1 Pt. 4)
 * 5. Kuja Doṣa Sāmya (Equilibrium of Martian Affliction per Muhūrta Cintāmaṇi Ch. 2)
 * 6. Daśā Sandhi Risk (Phaladīpikā / Kerala Tradition)
 */

import { JyotishaChart, PlanetId, RashiNumber } from '../types';
import { RASHIS } from '../constants';
import { calculateNaturalFriendship } from '../dignity';
import { DeeperHoroscopeMatching, MangalaDoshaComparison } from './types';

export function evaluateDeeperHoroscopeMatching(groomChart: JyotishaChart, brideChart: JyotishaChart): DeeperHoroscopeMatching {
  // 1. 7th House & 7th Lord
  // In JyotishaChart, bhavas is an array of 12 BhavaCusp items (index 0 is House 1, index 6 is House 7)
  const g7thCusp = groomChart.bhavas?.[6];
  const b7thCusp = brideChart.bhavas?.[6];

  const g7thSign = (g7thCusp?.rashiNumber || (((groomChart.lagna.rashiNumber + 6 - 1) % 12) + 1)) as RashiNumber;
  const b7thSign = (b7thCusp?.rashiNumber || (((brideChart.lagna.rashiNumber + 6 - 1) % 12) + 1)) as RashiNumber;

  const g7thLord: PlanetId = g7thCusp?.rashiLord || RASHIS[g7thSign].lord;
  const b7thLord: PlanetId = b7thCusp?.rashiLord || RASHIS[b7thSign].lord;

  const relationshipBetween7thLords =
    g7thLord === b7thLord ? 'Mitra' : calculateNaturalFriendship(g7thLord, b7thLord);

  let signDisplacement = (g7thSign - b7thSign + 1);
  if (signDisplacement <= 0) signDisplacement += 12;

  let seventhHouseVerdict = '';
  if (relationshipBetween7thLords === 'Mitra' && [1, 5, 7, 9, 11].includes(signDisplacement)) {
    seventhHouseVerdict = 'Highly supportive 7th house and lord compatibility. Mutual emotional fulfillment and longevity.';
  } else if (relationshipBetween7thLords === 'Shatru') {
    seventhHouseVerdict = '7th house lords are natural enemies. Potential for differing relationship expectations requiring mutual maturity.';
  } else {
    seventhHouseVerdict = 'Moderate 7th house harmony with balanced planetary temperament.';
  }

  // 2. Natural Significators (Venus & Jupiter)
  const gVenus = groomChart.planets.venus.rashiNumber;
  const bVenus = brideChart.planets.venus.rashiNumber;
  let vDisp = (gVenus - bVenus + 1);
  if (vDisp <= 0) vDisp += 12;

  const gJupiter = groomChart.planets.jupiter.rashiNumber;
  const bJupiter = brideChart.planets.jupiter.rashiNumber;
  let jDisp = (gJupiter - bJupiter + 1);
  if (jDisp <= 0) jDisp += 12;

  const isVenusHarmonious = [1, 3, 5, 7, 9, 11].includes(vDisp);
  const isJupiterHarmonious = [1, 5, 7, 9].includes(jDisp);

  const significatorVerdict =
    isVenusHarmonious && isJupiterHarmonious
      ? 'Venus and Jupiter form harmonious Kendra/Trikona geometry between the charts. Bestows affection, shared spiritual values, and noble domestic life.'
      : isVenusHarmonious
      ? 'Venus configuration supports deep mutual affection and romantic compatibility.'
      : 'Significators display non-standard displacement; individual spiritual maturity and patience recommended.';

  // 3. Navāṃśa (D-9) Lagna & Moon Harmony
  const gD9Lagna = groomChart.vargas?.D9?.lagnaRashi || 1;
  const bD9Lagna = brideChart.vargas?.D9?.lagnaRashi || 1;
  const gD9Moon = groomChart.vargas?.D9?.planets?.moon?.rashiNumber || groomChart.planets.moon.rashiNumber;
  const bD9Moon = brideChart.vargas?.D9?.planets?.moon?.rashiNumber || brideChart.planets.moon.rashiNumber;

  let d9LagnaDisp = (gD9Lagna - bD9Lagna + 1);
  if (d9LagnaDisp <= 0) d9LagnaDisp += 12;

  let d9MoonDisp = (gD9Moon - bD9Moon + 1);
  if (d9MoonDisp <= 0) d9MoonDisp += 12;

  const isD9LagnaKendraTrikona = [1, 4, 5, 7, 9, 10].includes(d9LagnaDisp);
  const isD9MoonKendraTrikona = [1, 5, 7, 9].includes(d9MoonDisp);

  const navamshaVerdict =
    isD9LagnaKendraTrikona && isD9MoonKendraTrikona
      ? 'Exceptional Navāṃśa (D-9) resonance. The subtle dharmic blueprint of both souls shows harmonious alignment in inner spiritual journey.'
      : isD9LagnaKendraTrikona
      ? 'Navāṃśa Ascendants align in Kendra/Trikona, indicating strong shared life philosophy.'
      : 'Navāṃśa positions show independent spiritual journeys with diverse dharmic inclinations.';

  // 4. Jaimini Upapada Lagna (UL) & Dārakāraka (DK)
  // Find UL from arudhaPadas for house 12 (A12 is Upapada Lagna)
  const gULItem = groomChart.jaimini?.arudhaPadas?.find((p) => p.house === 12);
  const bULItem = brideChart.jaimini?.arudhaPadas?.find((p) => p.house === 12);
  const gUL = gULItem?.rashiNumber || 1;
  const bUL = bULItem?.rashiNumber || 1;

  let ulDisp = (gUL - bUL + 1);
  if (ulDisp <= 0) ulDisp += 12;

  // Find DK (Darakaraka) from charaKarakas
  const gDKItem = groomChart.jaimini?.charaKarakas?.find((k) => k.karakaKey === 'DK');
  const bDKItem = brideChart.jaimini?.charaKarakas?.find((k) => k.karakaKey === 'DK');
  const gDK: PlanetId = gDKItem?.planet || 'venus';
  const bDK: PlanetId = bDKItem?.planet || 'jupiter';

  const mutualDKMaitri =
    gDK === bDK ? 'Mitra' : calculateNaturalFriendship(gDK, bDK);

  const jaiminiVerdict =
    [1, 5, 7, 9].includes(ulDisp) && mutualDKMaitri === 'Mitra'
      ? 'Upapada Lagnas (UL) and Dārakārakas (DK) resonate in full Jaimini harmony. Indicates auspicious institutional marriage and deep marital devotion.'
      : [1, 5, 7, 9].includes(ulDisp)
      ? 'Upapada Lagnas form mutual trines/angles, supporting longevity of wedlock.'
      : 'Upapada displacement requires dedicated communication to harmonize domestic expectations.';

  // 5. Kuja Doṣa Sāmya (Mangala Balancement)
  const gMarsHouse = groomChart.planets.mars.house;
  const bMarsHouse = brideChart.planets.mars.house;
  const KUJA_HOUSES = [1, 2, 4, 7, 8, 12];

  const gHasKuja = KUJA_HOUSES.includes(gMarsHouse);
  const bHasKuja = KUJA_HOUSES.includes(bMarsHouse);

  // Check classical cancellations
  const gMarsRashi = groomChart.planets.mars.rashiNumber;
  const bMarsRashi = brideChart.planets.mars.rashiNumber;
  const gCancelled = [1, 8, 10].includes(gMarsRashi); // Own sign or exalted
  const bCancelled = [1, 8, 10].includes(bMarsRashi);

  let neutralizationStatus: MangalaDoshaComparison['neutralizationStatus'];
  let mangalaVerdict = '';

  if (!gHasKuja && !bHasKuja) {
    neutralizationStatus = 'Both Free of Affliction';
    mangalaVerdict = 'Both horoscopes are naturally free of Kuja / Maṅgala Doṣa. Completely serene energetic balance.';
  } else if (gHasKuja && bHasKuja) {
    neutralizationStatus = 'Sama-Kuja (Perfect Balancement)';
    mangalaVerdict = 'Both charts possess Kuja Doṣa, fulfilling classical Kuja Sāmya (कुज साम्य). Equal martial energies neutralize each other completely.';
  } else if (gCancelled || bCancelled) {
    neutralizationStatus = 'Mitigated by Parihāra';
    mangalaVerdict = 'Kuja affliction is rendered benign through classical cancellation (own sign or exalted Mars).';
  } else {
    neutralizationStatus = 'One-Sided Affliction';
    mangalaVerdict = 'Asymmetric Kuja Doṣa: one partner possesses unmitigated Martian placement while the other does not. Classical texts advise caution or specific remedial vows.';
  }

  const mangalaComparison: MangalaDoshaComparison = {
    groom: {
      hasDosha: gHasKuja,
      isCancelled: gCancelled,
      severity: !gHasKuja ? 'None' : gCancelled ? 'Mild' : 'Medium',
      afflictedHouses: gHasKuja ? [gMarsHouse] : [],
      cancellationReasons: gCancelled ? ['Mars in own sign or exaltation (Aries, Scorpio, or Capricorn)'] : [],
      description: `Mars is in House ${gMarsHouse} (${RASHIS[gMarsRashi].sanskritName}).`,
    },
    bride: {
      hasDosha: bHasKuja,
      isCancelled: bCancelled,
      severity: !bHasKuja ? 'None' : bCancelled ? 'Mild' : 'Medium',
      afflictedHouses: bHasKuja ? [bMarsHouse] : [],
      cancellationReasons: bCancelled ? ['Mars in own sign or exaltation (Aries, Scorpio, or Capricorn)'] : [],
      description: `Mars is in House ${bMarsHouse} (${RASHIS[bMarsRashi].sanskritName}).`,
    },
    neutralizationStatus,
    verdict: mangalaVerdict,
    citation: {
      primaryText: 'Muhūrta Cintāmaṇi & BPHS',
      sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
      chapterOrSection: 'Ch. 2 v. 23–25 / BPHS Ch. 80',
      shlokaOriginal: 'लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे ।... दम्पत्योः साम्ये सति न दोषः ॥',
      translation: 'Mars in 1, 2, 4, 7, 8, 12 causes Kuja Dosha. When both partners possess equal Kuja placement (Kuja Sāmya), the defect is neutralized.',
    },
  };

  // 6. Daśā Sandhi Risk
  const gDashaLord = groomChart.vimshottari?.balanceAtBirth?.lord || 'jupiter';
  const bDashaLord = brideChart.vimshottari?.balanceAtBirth?.lord || 'saturn';
  const isSandhiRisk = gDashaLord === bDashaLord;

  return {
    seventhHouseAffinity: {
      groom7thLord: g7thLord,
      bride7thLord: b7thLord,
      relationshipBetween7thLords,
      groom7thSign: g7thSign,
      bride7thSign: b7thSign,
      signDisplacement,
      verdict: seventhHouseVerdict,
      citation: {
        primaryText: 'Jātaka Pārijāta & BPHS',
        sanskritTextName: 'जातकपारिजातः / बृहत्पाराशर',
        chapterOrSection: 'Ch. 14 / BPHS Ch. 80',
        translation: 'Friendship between the 7th lords and harmonious trinal/kendra disposition between 7th cusps guarantees mutual respect and conjugal felicity.',
      },
    },
    significatorAffinity: {
      groomVenusRashi: gVenus,
      brideVenusRashi: bVenus,
      venusDisplacement: vDisp,
      groomJupiterRashi: gJupiter,
      brideJupiterRashi: bJupiter,
      jupiterDisplacement: jDisp,
      verdict: significatorVerdict,
      citation: {
        primaryText: 'Phaladīpikā',
        sanskritTextName: 'फलदीपिका',
        chapterOrSection: 'Ch. 10 v. 14',
        translation: 'Harmonious mutual positioning of Venus (Kalatrakāraka) and Jupiter ensures enduring conjugal affection, noble progeny, and moral fidelity.',
      },
    },
    navamshaHarmony: {
      groomD9LagnaRashi: gD9Lagna,
      brideD9LagnaRashi: bD9Lagna,
      groomD9MoonRashi: gD9Moon,
      brideD9MoonRashi: bD9Moon,
      d9LagnaDisplacement: d9LagnaDisp,
      d9MoonDisplacement: d9MoonDisp,
      isTrikonaOrKendra: isD9LagnaKendraTrikona && isD9MoonKendraTrikona,
      verdict: navamshaVerdict,
      citation: {
        primaryText: 'Phaladīpikā & Jātaka Pārijāta',
        sanskritTextName: 'फलदीपिका / जातकपारिजातः',
        chapterOrSection: 'Phaladīpikā Ch. 10 / JP Ch. 14',
        translation: 'When the Navāṃśa Lagnas and Navāṃśa Moons of husband and wife are in mutual Kendra or Trikona, the marriage is anchored by celestial grace.',
      },
    },
    jaiminiKuta: {
      groomULRashi: gUL,
      brideULRashi: bUL,
      ulDisplacement: ulDisp,
      groomDKPlanet: gDK,
      brideDKPlanet: bDK,
      mutualDKMaitri,
      verdict: jaiminiVerdict,
      citation: {
        primaryText: 'Jaimini Upadeśa Sūtras',
        sanskritTextName: 'जैमिनि उपदेश सूत्राणि',
        chapterOrSection: 'Ch. 1 Pāda 4',
        translation: 'Harmonious mutual trine or kendra placement of Upapada Lagnas (UL) and natural friendship of Dārakārakas secures lifelong marital stability.',
      },
    },
    mangalaComparison,
    dashaSandhi: {
      groomCurrentDashaLord: gDashaLord,
      brideCurrentDashaLord: bDashaLord,
      isSandhiRisk,
      explanation: isSandhiRisk
        ? 'Both partners are currently operating under the Mahādaśā of the same planetary archetype. While creating shared experiences, simultaneous major dasha transitions (Daśā Sandhi) require mindful emotional awareness.'
        : 'Different Mahādaśā lords active. Provides complementary life rhythms and stabilizes energetic transitions.',
      citation: {
        primaryText: 'Prasna Marga & Mādhavīya',
        sanskritTextName: 'प्रश्नमार्गः / माधवीयम्',
        chapterOrSection: 'Vivāha Sandhi Prakaraṇa',
        translation: 'Simultaneous termination and initiation of major Mahādaśās in both charts (Daśā Sandhi) produces concentrated transformative pressure and requires scrutiny.',
      },
    },
  };
}

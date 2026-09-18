import { calculateFullJyotishaChart, CalculationInput } from '../calculator';
import { calculateKutaMilan } from './kuta-engine';
import { calculateVarnaKuta, calculateBhakutaKuta, calculateNadiKuta, PersonLunarData } from './ashtakuta-calculator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[KUTA_TEST_FAILED]: ${message}`);
  }
}

export function runKutaMilanTests(): { success: boolean; testsRun: number; logs: string[] } {
  const logs: string[] = [];
  let testsRun = 0;

  // Test 1: Varṇa Kūṭa scoring
  const gScorpio: PersonLunarData = {
    rashiNumber: 8, // Brāhmaṇa (Rank 4)
    rashiLord: 'mars',
    rashiName: 'Vṛścika',
    nakshatraIndex: 16,
    nakshatraNumber: 17,
    nakshatraName: 'Anurādhā',
    nakshatraPada: 1,
    longitude: 215,
  };

  const bTaurus: PersonLunarData = {
    rashiNumber: 2, // Vaiśya (Rank 2)
    rashiLord: 'venus',
    rashiName: 'Vṛṣabha',
    nakshatraIndex: 3,
    nakshatraNumber: 4,
    nakshatraName: 'Rohiṇī',
    nakshatraPada: 2,
    longitude: 45,
  };

  const varna1 = calculateVarnaKuta(gScorpio, bTaurus);
  assert(varna1.obtainedScore === 1, 'Groom Brāhmaṇa (4) ≥ Bride Vaiśya (2) must be 1 point');
  testsRun++;
  logs.push('Test 1 Passed: Varṇa Kūṭa Groom >= Bride yields 1 point');

  const varna2 = calculateVarnaKuta(bTaurus, gScorpio);
  assert(varna2.obtainedScore === 0, 'Groom Vaiśya (2) < Bride Brāhmaṇa (4) must be 0 points');
  testsRun++;
  logs.push('Test 2 Passed: Varṇa Kūṭa Groom < Bride yields 0 points');

  // Test 3: Bhakūṭa 6-8 (Ṣaḍaṣṭaka) with SAME LORD (Aries vs Scorpio -> Mars)
  // Must trigger Ekeśa Bhakūṭa Bhaṅga exception and restore 7 points!
  const gAries: PersonLunarData = {
    rashiNumber: 1,
    rashiLord: 'mars',
    rashiName: 'Meṣa',
    nakshatraIndex: 0,
    nakshatraNumber: 1,
    nakshatraName: 'Aśvinī',
    nakshatraPada: 1,
    longitude: 5,
  };

  const bhakutaSameLord = calculateBhakutaKuta(gAries, gScorpio);
  assert(bhakutaSameLord.rawScore === 0, 'Aries-Scorpio is raw 6-8 displacement (0 points)');
  assert(bhakutaSameLord.isCancelledByException === true, 'Aries-Scorpio must be cancelled by same Mars lordship');
  assert(bhakutaSameLord.obtainedScore === 7, 'Bhakūṭa cancelled score must restore 7 points');
  testsRun++;
  logs.push('Test 3 Passed: Bhakūṭa 6-8 Aries-Scorpio cancels via same Mars lordship to 7 points');

  // Test 4: Eka-Nāḍī Doṣa with Same Rāśi Different Nakṣatra (Classical Parihāra)
  // Both Aries, Groom Aśvinī (Ādi Nāḍī), Bride Ārdrā or another Nakṣatra
  const bAriesBharani: PersonLunarData = {
    rashiNumber: 1,
    rashiLord: 'mars',
    rashiName: 'Meṣa',
    nakshatraIndex: 0, // Let's test same nadi: Aśvinī (Ādi) and Ārdrā (Ādi)
    nakshatraNumber: 1,
    nakshatraName: 'Aśvinī',
    nakshatraPada: 1,
    longitude: 5,
  };

  const gArdra: PersonLunarData = {
    rashiNumber: 3, // Gemini
    rashiLord: 'mercury',
    rashiName: 'Mithuna',
    nakshatraIndex: 5,
    nakshatraNumber: 6, // Ārdrā is Ādi Nāḍī
    nakshatraName: 'Ārdrā',
    nakshatraPada: 2,
    longitude: 70,
  };

  const nadiRawDefect = calculateNadiKuta(gArdra, bAriesBharani);
  assert(nadiRawDefect.rawScore === 0, 'Both Ārdrā and Aśvinī are Ādi Nāḍī -> raw score 0');
  testsRun++;
  logs.push('Test 4 Passed: Raw Eka-Nāḍī detected correctly (0 points)');

  // Test 5: Full Chart calculation with Kuṭa Milan orchestration
  const inputGroom: CalculationInput = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 10,
    minute: 30,
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetHours: 5.5,
    locationName: 'New Delhi, India',
  };

  const inputBride: CalculationInput = {
    year: 1993,
    month: 11,
    day: 22,
    hour: 14,
    minute: 15,
    latitude: 19.076,
    longitude: 72.8777,
    timezoneOffsetHours: 5.5,
    locationName: 'Mumbai, India',
  };

  const groomChart = calculateFullJyotishaChart(inputGroom);
  const brideChart = calculateFullJyotishaChart(inputBride);

  const kutaMilanResult = calculateKutaMilan(groomChart, brideChart, 'ashtakuta');
  assert(kutaMilanResult.maxTotalScore === 36, 'Aṣṭakūṭa total max score must be 36');
  assert(kutaMilanResult.totalScore >= 0 && kutaMilanResult.totalScore <= 36, 'Score must be in range 0-36');
  assert(kutaMilanResult.kutaResults.length === 8, 'Aṣṭakūṭa must have 8 individual kūṭas');
  testsRun++;
  logs.push(`Test 5 Passed: Full Kuṭa Milan computed deterministically with score: ${kutaMilanResult.totalScore}/36`);

  // Test 6: South Indian Daśakūṭa
  const dashakutaResult = calculateKutaMilan(groomChart, brideChart, 'dashakuta');
  assert(dashakutaResult.kutaResults.length === 12, 'Daśakūṭa configuration must contain 8 + 4 = 12 factors');
  assert(dashakutaResult.maxTotalScore === 40, 'Daśakūṭa max total score is 40');
  testsRun++;
  logs.push(`Test 6 Passed: South Indian Daśakūṭa computed with 12 distinct factors`);

  return { success: true, testsRun, logs };
}

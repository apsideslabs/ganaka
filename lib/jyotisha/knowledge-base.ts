/**
 * Gaṇaka — the textual knowledge base.
 *
 * Every rule the engine applies should be a record, not an untraceable branch.
 * The audit checklist asks for sixteen fields per rule; this module defines them
 * and seeds the base with the rules whose verses were read and checked while the
 * engine was built — the daśā year tables, Bhāva Bala, Ishta/Kaṣṭa, the special
 * lagnas and the Prasna sphuṭas.
 *
 * The point of the `disagreement` field is that it is populated. Several of
 * these rules have more than one published reading, and a knowledge base that
 * presents one silently is worse than one that admits the split — the Varṇada
 * counting rule has three published readings that give three different signs,
 * and Bhāva Bala's pañcavargīya weighting has at least two.
 *
 * What this base does NOT yet hold is the full corpus. It is a seed: the rules
 * the engine actually implements, with the verses behind them. Extending it is
 * adding records, not changing the schema.
 */

export interface RuleRecord {
  /** Unique identifier. */
  id: string;
  /** Human title. */
  title: string;
  /** The work. */
  work: string;
  /** Author or traditional attribution. */
  author: string;
  /** Edition or translation consulted. */
  edition: string;
  /** Chapter and verse. */
  location: string;
  /** Original Sanskrit, where verified. */
  sanskrit?: string;
  /** IAST transliteration, where the Sanskrit is held. */
  transliteration?: string;
  /** English translation. */
  translation: string;
  /** Which school the rule belongs to. */
  school: 'Parāśarī' | 'Jaimini' | 'Tājika' | 'Prasna' | 'General';
  /** The chart conditions the rule tests. */
  conditions: string;
  /** Cancellations, overrides and exceptions. */
  exceptions?: string;
  /** The classical result. */
  interpretation: string;
  /** Competing readings, and what differs between them. */
  disagreement?: string;
  /** Where the engine implements it. */
  implementation: string;
  /** Whether the Sanskrit was read directly or taken from a translation. */
  confidence: 'verse-verified' | 'translation-verified' | 'chapter-level';
}

const BPHS = 'Bṛhat Parāśara Horā Śāstra';
const BJ = 'Bṛhat Jātaka';
const PM = 'Prasna Marga';
const JS = 'Jaimini Upadeśa Sūtras';
const SANTHANAM = 'Santhanam (Ranjan)';
const NEELY = 'Michael D Neely (2017)';
const RAMAN = 'B.V. Raman';

export const KNOWLEDGE_BASE: RuleRecord[] = [
  // ---------------------------------------------------------------- strength
  {
    id: 'bphs_27_26_bhava_bala',
    title: 'Bhāva Bala — house strength',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 27, vv. 26–31',
    sanskrit: 'एवं ग्रहबलं प्रोक्तमथ भावबलं श‍ृणु ।',
    transliteration: 'evaṃ grahabalaṃ proktam atha bhāvabalaṃ śṛṇu |',
    translation:
      'Thus the strength of the planets has been told; now hear the strength of the houses. ' +
      'Deduct the descendant from a bhāva falling in Virgo, Gemini, Libra, Aquarius or the first ' +
      'half of Sagittarius; the nadir from one in Aries, Taurus, Leo, the first half of Capricorn ' +
      'or the second half of Sagittarius; the ascendant from one in Cancer or Scorpio; and the ' +
      'meridian from one in the second half of Capricorn or Pisces. Convert the remainder to ' +
      'degrees and divide by three. Increase by a quarter where a benefic aspects, reduce by a ' +
      'quarter where a malefic does, add the dṛg bala of Jupiter or Mercury if they aspect, and ' +
      'then add the strength of the bhāva’s lord.',
    school: 'Parāśarī',
    conditions: 'Every bhāva; the sign the bhāva falls in selects the reference angle.',
    exceptions:
      'A bhāva holding Jupiter or Mercury gains a rūpa; one holding Saturn, Mars or the Sun ' +
      'loses a rūpa. Fifteen virūpas go to Śīrṣodaya signs on a day birth, Ubhayodaya at ' +
      'twilight, and Pṛṣṭhodaya at night.',
    interpretation: 'The strength of the house as a whole, distinct from its lord’s strength.',
    disagreement:
      'Sources differ on whether the reference is the bhāva’s sign or its cusp longitude. ' +
      'With whole-sign houses every madhya sits at 15°, so the Sagittarius and Capricorn ' +
      'half-sign split degenerates; it acts as written only with real cusps.',
    implementation: 'lib/shadbala/bhava-bala.ts',
    confidence: 'translation-verified',
  },
  {
    id: 'bphs_28_6_ishta_kashta',
    title: 'Ishta and Kaṣṭa Phala',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 28, vv. 2–6',
    translation:
      'Subtract the planet’s own debilitation point from its position; if the result is more than ' +
      'six signs, take it from the circle. That is the Ucca Rashmi. From the Cheṣṭā Kendra work ' +
      'out the Cheṣṭā Rashmi the same way. Reduce the Ucca and Cheṣṭā rashmis by one each, ' +
      'multiply by ten, and add them; half of that is Ishta, and Kaṣṭa is that subtracted from sixty.',
    school: 'Parāśarī',
    conditions: 'The seven tāras; the Sun and Moon use their own Cheṣṭā Kendra definitions.',
    interpretation:
      'A planet’s capacity to deliver good rather than difficult results. The two always total sixty.',
    disagreement:
      'Note what the arithmetic does: a rashmi runs 1 to 7, so (rashmi − 1) × 10 is exactly the ' +
      'virūpa value the śaḍbala already computes. Ishta therefore reduces to (Ucca Bala + Cheṣṭā ' +
      'Bala) / 2 with no approximation — but only if Cheṣṭā is capped at sixty, which the ' +
      'engine’s own Cheṣṭā value is not.',
    implementation: 'lib/jyotisha/phala-advanced.ts',
    confidence: 'translation-verified',
  },

  // ------------------------------------------------------------------ dasas
  {
    id: 'bphs_46_168_sthira_years',
    title: 'Sthira Daśā — the fixed years',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 46, v. 168',
    sanskrit: 'चरे सप्त स्थिरे चाऽष्टौ द्वन्द्वे नव समाः स्मृताः ॥ १६८॥',
    transliteration: 'care sapta sthire cāṣṭau dvandve nava samāḥ smṛtāḥ || 168 ||',
    translation:
      'Seven years in movable signs, eight in fixed, nine in dual — so are the daśā years ' +
      'remembered.',
    school: 'Jaimini',
    conditions: 'Every sign; the daśā begins from the sign of the Brahma graha.',
    interpretation: 'The twelve rāśi periods total ninety-six years.',
    disagreement:
      'Jaimini Sūtras 7.3 gives the same figures by katapayādi code (śaśi 7, nanda 8, pāvaka 9), ' +
      'so the years themselves are not in dispute — only the seed.',
    implementation: 'lib/dashas/jaimini-sthira.ts',
    confidence: 'verse-verified',
  },
  {
    id: 'bphs_46_170_brahma',
    title: 'The Brahma graha',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 46, vv. 170–173',
    translation:
      'From among the lords of the 6th, 8th and 12th, the graha possessing the greatest strength ' +
      'and placed in the lagna, or in the 7th with strength, the one placed in an odd sign within ' +
      'the sixth bhāva from the bhāva concerned, is called the Brahma graha. The lord of the 8th ' +
      'in the 8th is also accepted. If a number of grahas qualify, the one with the most degrees ' +
      'becomes Brahma; on parity, the most powerful.',
    school: 'Jaimini',
    conditions: 'Lords of the 6th, 8th and 12th; placement in the lagna or the 7th.',
    exceptions: 'The 8th lord in the 8th is accepted without the placement test.',
    interpretation: 'The sign Brahma occupies seeds the Sthira daśā.',
    disagreement:
      'The verse’s phrase about the “sixth bhāva from the bhāva concerned” is read differently ' +
      'between commentaries, and the tie-break between degree and strength is not ordered.',
    implementation: 'lib/dashas/jaimini-sthira.ts',
    confidence: 'translation-verified',
  },
  {
    id: 'bphs_46_24_shodashottari',
    title: 'Ṣoḍaśottarī Daśā',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 46, vv. 24–26',
    translation:
      'Count the nakṣatras from Puṣya to the janma nakṣatra and divide by eight. The remainder ' +
      'indicates the daśās of the Sun, Mars, Jupiter, Saturn, Ketu, Moon, Mercury and Venus, ' +
      'which are of 11, 12, 13, 14, 15, 16, 17 and 18 years.',
    school: 'Parāśarī',
    conditions:
      'Lagna in the Moon’s horā with a Kṛṣṇa-pakṣa birth, or in the Sun’s horā with a Śukla-pakṣa birth.',
    interpretation: 'A 116-year cycle over eight lords, Rāhu omitted.',
    implementation: 'lib/dashas/conditional-dashas.ts',
    confidence: 'translation-verified',
  },
  {
    id: 'bphs_46_32_shatabdika',
    title: 'Śatābdika Daśā',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 46, vv. 32–34',
    translation:
      'Count from Revatī to the janma nakṣatra and divide by seven. The remainder indicates the ' +
      'lords in the order Sun, Moon, Venus, Mercury, Jupiter, Mars, Saturn, whose daśās are of ' +
      '5, 5, 10, 10, 20, 20 and 30 years.',
    school: 'Parāśarī',
    conditions: 'A vargottama lagna — the same sign in the rāśi chart and the navāṃśa.',
    interpretation: 'A 100-year cycle weighted heavily to Jupiter, Mars and Saturn.',
    disagreement:
      'The chapter’s own worked example is a Mrigāśīrṣa birth: six counted from Revatī leaves six ' +
      'over seven, giving Mars and twenty years. The engine reproduces it.',
    implementation: 'lib/dashas/conditional-dashas.ts',
    confidence: 'translation-verified',
  },
  {
    id: 'bphs_46_179_mandooka',
    title: 'Maṇḍūka Daśā — the frog leap',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 46, vv. 179–180',
    translation:
      'The daśā leaps by threes through the signs, exhausting one trinal quartet before passing ' +
      'to the next.',
    school: 'Jaimini',
    conditions: 'Seeded from the stronger of the lagna and the 7th.',
    interpretation: 'Twelve rāśi periods whose lengths depend on where each sign lord sits.',
    disagreement:
      'Two published duration branches exist. K.N. Rao counts from the sign to its lord (own sign ' +
      '12, lord in the 7th 10); Sanjay Rath gives a flat 7/8/9 by modality as Sthira does. The ' +
      'engine ships the Rao branch. The two produce entirely different dates from the first ' +
      'period onward.',
    implementation: 'lib/dashas/jaimini-mandooka-trikona.ts',
    confidence: 'translation-verified',
  },
  {
    id: 'bphs_46_183_trikona',
    title: 'Trikoṇa Daśā',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 46, vv. 183–184',
    translation:
      'The daśā begins from whichever of the lagna, the 5th and the 9th is strongest, and runs ' +
      'through the signs according to the seed’s class.',
    school: 'Jaimini',
    conditions: 'Strength of the lagna, 5th and 9th.',
    interpretation: 'Twelve rāśi periods counted out to each sign lord.',
    disagreement:
      'Commentaries disagree on the succession for fixed and dual seeds. Read as an arithmetic ' +
      'step of six or four the order revisits two or three signs and never covers twelve, so the ' +
      'engine walks the trinal groups instead.',
    implementation: 'lib/dashas/jaimini-mandooka-trikona.ts',
    confidence: 'chapter-level',
  },

  // ---------------------------------------------------------- special lagnas
  {
    id: 'bphs_5_10_varnada',
    title: 'Varṇada Lagna',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 5, vv. 10–13',
    translation:
      'If the natal ascendant is an odd sign count directly from Aries to it; if even, count from ' +
      'Pisces in reverse. Do the same for the Horā Lagna. If both products are of one class, add ' +
      'them; if one is odd and the other even, take the difference. Count the result out again — ' +
      'odd from Aries, even from Pisces in reverse.',
    school: 'Parāśarī',
    conditions: 'The natal lagna and the Horā Lagna.',
    interpretation: 'A sign used in Jaimini for longevity work.',
    disagreement:
      'Three readings are published and they give three different signs. Santhanam’s note tests ' +
      'the two figures; the verse read literally tests the two signs; Suryanarain Rao subtracts in ' +
      'every case. Because every figure the count can produce is odd, the first reading always ' +
      'adds. The engine follows the Parāśara/Santhanam reading, which reproduces the one worked ' +
      'example the text gives (Libra lagna with Scorpio horā lagna → Aries).',
    implementation: 'lib/jyotisha/special-lagnas.ts',
    confidence: 'verse-verified',
  },
  {
    id: 'bphs_3_71_pranapada',
    title: 'Praṇapada Lagna',
    work: BPHS,
    author: 'Parāśara (traditional attribution)',
    edition: SANTHANAM,
    location: 'Ch. 3, vv. 71–74',
    sanskrit: 'भांशपादसमैः प्राणैश्चराद्यर्कत्रिकोणभात् । उदयादिष्टकालान्तं यद्भं प्राणपदं हि तत् ॥७१॥',
    transliteration:
      'bhāṃśapādasamaiḥ prāṇaiś carādyarkatrikoṇabhāt | udayādiṣṭakālāntaṃ yad bhaṃ prāṇapadaṃ hi tat || 71 ||',
    translation:
      'Convert the time since sunrise to vighaṭikās and divide by fifteen. The result in signs and ' +
      'degrees is added to the Sun if he is in a movable sign; add a further 240 degrees if he is ' +
      'in a fixed sign, and 120 if in a dual one. The point so reached is Praṇapada.',
    school: 'Parāśarī',
    conditions: 'Sunrise, the birth instant and the Sun’s longitude.',
    interpretation:
      'A birth is called auspicious when Praṇapada falls in the 2nd, 4th, 5th, 9th, 10th or 11th ' +
      'from the lagna, and inauspicious otherwise.',
    disagreement:
      'Verse 71 does not say what “the given time” is counted from, nor which sunrise definition ' +
      'to use. The engine counts from sunrise, as chapter 4 does for the other special lagnas. At ' +
      'five degrees per clock minute, a different sunrise convention can move the sign.',
    implementation: 'lib/jyotisha/pranapada.ts',
    confidence: 'verse-verified',
  },
  {
    id: 'pm_5_8_kunda',
    title: 'Kunda — the rectification point',
    work: PM,
    author: 'Traditional attribution',
    edition: RAMAN,
    location: 'Ch. 5, vv. 8–9',
    sanskrit: 'कुन्दनिघ्ने पृथग्लग्ने प्रष्टृतारा न चेद्भवेत् ।',
    transliteration: 'kundanighne pṛthaglagne praṣṭṛtārā na ced bhavet |',
    translation:
      'Multiply the lagna by kunda — eighty-one — and cast out whole circles. The result should ' +
      'fall in the birth nakṣatra or one of its trines. If it does not, move the lagna by ten ' +
      'minutes of arc per nakṣatra and repeat until it does.',
    school: 'Prasna',
    conditions: 'The exact lagna longitude.',
    interpretation: 'A test of whether the recorded birth time is sound.',
    disagreement:
      'Kunda is identical to the nava-navāṃśa (D-81) by construction, R × 81, but some software ' +
      'computes the two by different routes and gets different answers.',
    implementation: 'lib/jyotisha/special-lagnas.ts',
    confidence: 'translation-verified',
  },

  // -------------------------------------------------------------- prasna
  {
    id: 'pm_5_7_arudha',
    title: 'Arudha — the direction rule',
    work: PM,
    author: 'Traditional attribution',
    edition: RAMAN,
    location: 'Ch. 5, vv. 7–11',
    translation:
      'Aries and Taurus are east; Gemini south-east; Cancer and Leo south; Virgo south-west; ' +
      'Libra and Scorpio west; Sagittarius north-west; Capricorn and Aquarius north; Pisces ' +
      'north-east. The arudha is the sign answering to the direction the questioner faces.',
    school: 'Prasna',
    conditions: 'The compass direction of the questioner at the moment of asking.',
    interpretation: 'The arudha is one of the six factors a prasna is judged on.',
    disagreement:
      'Where the direction is unclear the text allows the questioner to place a piece of gold on ' +
      'a prepared diagram; the sign so touched is taken as the arudha. That procedure has no ' +
      'computational equivalent and is left to the astrologer.',
    implementation: 'lib/jyotisha/prashna.ts',
    confidence: 'translation-verified',
  },
  {
    id: 'pm_5_17_trisphuta',
    title: 'Trisphuṭa and the derived sphuṭas',
    work: PM,
    author: 'Traditional attribution',
    edition: RAMAN,
    location: 'Ch. 5, vv. 17–20',
    translation:
      'Add the lagna, the Moon and Māndi: that is the trisphuṭa. Add the Sun for the catusphuṭa, ' +
      'and Rāhu on top of that for the pañcasphuṭa. The prāṇa and deha sphuṭas are built from the ' +
      'same three bodies; with the Sun added, Māndi gives the mṛtyu sphuṭa.',
    school: 'Prasna',
    conditions: 'Lagna, Moon and Māndi at the moment of the question.',
    interpretation: 'Sensitive points used to judge the prasna.',
    disagreement:
      'The multipliers for prāṇa and deha are given as syllables in the verse rather than as ' +
      'numerals, and the readings differ. The engine’s constants should be treated as provisional.',
    implementation: 'lib/jyotisha/prashna.ts',
    confidence: 'chapter-level',
  },
  {
    id: 'pm_8_1_six_factors',
    title: 'The six factors of a prasna',
    work: PM,
    author: 'Traditional attribution',
    edition: RAMAN,
    location: 'Ch. 8, v. 1',
    translation:
      'Six things are studied in a question chart: the arudha, the lagna, the lagna’s navāṃśa, ' +
      'the chhatra, the sign of the body part touched, and the sign the Moon occupies.',
    school: 'Prasna',
    conditions: 'The question moment and the sitting.',
    interpretation: 'Health or illness, good or bad, from how these six meet benefics and malefics.',
    disagreement:
      'The chhatra and the touched-limb sign depend on how the questioner sat and what they ' +
      'touched. Neither can come from an ephemeris; the engine marks both as not computable ' +
      'rather than guessing them.',
    implementation: 'lib/jyotisha/prashna.ts',
    confidence: 'translation-verified',
  },

  // -------------------------------------------------------------- gender
  {
    id: 'bj_4_11_sex',
    title: 'Determining the sex of the native',
    work: BJ,
    author: 'Varāhamihira',
    edition: NEELY,
    location: 'Ch. 4, v. 11',
    sanskrit:
      'ओजऋक्षे पुरुषांशकेषु बलिभिर्लग्नार्क गुर्विन्दुभिः पुंजन्म प्रवदेत् समांशक गतैर्युग्मेषु तैर्योषितः ।',
    transliteration:
      'ojaṛkṣe puruṣāṃśakeṣu balibhir lagnārka gurvindubhiḥ puṃjanma pravadet samāṃśakagatair yugmeṣu tair yoṣitaḥ |',
    translation:
      'With the lagna, the Sun, Jupiter and the Moon strong, in odd signs and male navāṃśas, a ' +
      'male birth should be indicated; with them in even signs and even navāṃśas, female births. ' +
      'Jupiter and the Sun in an odd sign — a man. The Moon, Venus and Mars in an even sign — a ' +
      'female.',
    school: 'General',
    conditions:
      'Four significators — lagna, Sun, Jupiter, Moon — each tested for odd/even rāśi and odd/even navāṃśa.',
    exceptions:
      'Where some are odd and some even the commentary directs the astrologer to whichever ' +
      'predominates.',
    interpretation: 'A traditional sex determination from the birth chart.',
    disagreement:
      'The verse is genuinely underdetermined when the four significators split, and the ' +
      'predominance note sits in a commentary rather than the verse. Applying it to two known ' +
      'charts gives opposite answers depending on whether the rule is read as “all four” or ' +
      '“the majority”. The engine implements it because the text does; that is not evidence the ' +
      'method predicts anything.',
    implementation: 'lib/jyotisha/phala-advanced.ts (not wired to a panel)',
    confidence: 'verse-verified',
  },
  {
    id: 'bj_4_12_saturn',
    title: 'Saturn’s rule for sex',
    work: BJ,
    author: 'Varāhamihira',
    edition: NEELY,
    location: 'Ch. 4, v. 12',
    sanskrit: 'विहाय लग्नं विषमऋक्ष संस्थः सौरोऽपि पुंजन्म करो विलग्नात् ।',
    transliteration: 'vihāya lagnaṃ viṣamaṛkṣa saṃsthaḥ sauro ’pi puṃjanma karo vilagnāt |',
    translation:
      'With the exception of the lagna, even Saturn situated in the odd houses from the lagna ' +
      'produces a male birth; otherwise a female birth is to be inferred.',
    school: 'General',
    conditions: 'Saturn’s house counted from the lagna, the first excluded.',
    interpretation: 'A secondary rule applied when the primary one is mixed.',
    disagreement:
      'The word is viṣamaṛkṣa — odd sign — but one widely used translation renders it “odd ' +
      'houses”, and the two readings disagree on a chart where Saturn sits in an odd sign that is ' +
      'an even house. The engine reads houses, matching the “from the lagna” clause.',
    implementation: 'lib/jyotisha/phala-advanced.ts (not wired to a panel)',
    confidence: 'verse-verified',
  },
];

/** Look up a record by id. */
export function getRule(id: string): RuleRecord | undefined {
  return KNOWLEDGE_BASE.find((r) => r.id === id);
}

/** Free-text search across title, work, translation and conditions. */
export function searchRules(query: string): RuleRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return KNOWLEDGE_BASE;
  return KNOWLEDGE_BASE.filter((r) =>
    [r.id, r.title, r.work, r.translation, r.conditions, r.location, r.implementation]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
}

/** Every rule that cites a given work. */
export function rulesByWork(work: string): RuleRecord[] {
  return KNOWLEDGE_BASE.filter((r) => r.work === work);
}

/** Coverage summary, for the panel header. */
export function knowledgeBaseSummary() {
  const bySchool: Record<string, number> = {};
  const byConfidence: Record<string, number> = {};
  for (const r of KNOWLEDGE_BASE) {
    bySchool[r.school] = (bySchool[r.school] ?? 0) + 1;
    byConfidence[r.confidence] = (byConfidence[r.confidence] ?? 0) + 1;
  }
  return {
    total: KNOWLEDGE_BASE.length,
    withSanskrit: KNOWLEDGE_BASE.filter((r) => r.sanskrit).length,
    withTransliteration: KNOWLEDGE_BASE.filter((r) => r.transliteration).length,
    withDisagreement: KNOWLEDGE_BASE.filter((r) => r.disagreement).length,
    bySchool,
    byConfidence,
  };
}

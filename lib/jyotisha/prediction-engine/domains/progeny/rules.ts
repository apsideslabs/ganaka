/**
 * Gaṇaka — Domain 7: Children & Progeny (Santāna / Putra) Rules
 * Classical rule definitions cataloging primary shastric criteria for progeny.
 */

export interface ProgenyRuleDefinition {
  ruleId: string;
  source: string;
  chapterAndVerse: string;
  sanskritTitle: string;
  description: string;
  tradition: string;
  schoolVariant: string;
  confidenceScore: number;
}

export const PROGENY_RULES: Record<string, ProgenyRuleDefinition> = {
  // --- 1. D1 5th House & 5th Lord Foundations ---
  BPHS_13_PUTRA_BHAVA_SUBHA: {
    ruleId: 'BPHS_13_PUTRA_BHAVA_SUBHA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 1–4',
    sanskritTitle: 'शुभयुक्त-दृष्ट-पञ्चमभाव-फलम्',
    description:
      'If the 5th house is occupied or aspected by natural benefics (Jupiter, Venus, Mercury), or its lord is well placed in a Kendra or Koṇa with good dignity, auspicious, virtuous, and thriving progeny is assured.',
    tradition: 'Parāśari',
    schoolVariant: 'Standard Parāśari',
    confidenceScore: 92,
  },

  BPHS_13_PUTRESHA_DUSTHANA: {
    ruleId: 'BPHS_13_PUTRESHA_DUSTHANA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 12–16',
    sanskritTitle: 'पञ्चमेशस्य दुःस्थानस्थितिफलम्',
    description:
      'If the 5th lord is placed in the 6th, 8th, or 12th house (Dusthānas), or is debilitated or combust, difficulty, friction in conception, or sorrow on account of children is experienced, unless mitigated by strong benefic aspects.',
    tradition: 'Parāśari',
    schoolVariant: 'Standard Parāśari',
    confidenceScore: 88,
  },

  SARAVALI_34_MANDA_VILAMBA: {
    ruleId: 'SARAVALI_34_MANDA_VILAMBA',
    source: 'Sārāvalī (Kalyāṇavarman)',
    chapterAndVerse: 'Ch. 34, Śloka 25–28',
    sanskritTitle: 'शनि-युक्त-दृष्ट-पञ्चम-विलम्बयोगः',
    description:
      'When Saturn occupies or aspects the 5th house or the 5th lord without benefic relief, it indicates Manda-Vilamba (mature or delayed childbearing). Children arrive in mature adulthood, often after Saturn maturation (age 36).',
    tradition: 'Classical Horā',
    schoolVariant: 'Kalyāṇavarman Sārāvalī',
    confidenceScore: 89,
  },

  PHALADIPIKA_12_BAHU_PUTRA: {
    ruleId: 'PHALADIPIKA_12_BAHU_PUTRA',
    source: 'Phaladīpikā (Mantreśvara)',
    chapterAndVerse: 'Ch. 12, Śloka 8–11',
    sanskritTitle: 'बहुपुत्र-योगलक्षणम्',
    description:
      'If the 5th lord is exalted or in own house, conjunct or aspected by Jupiter and Venus, and the 5th house falls in a fruitful sign with high SAV bindus, the native is blessed with multiple flourishing children.',
    tradition: 'Mantreśvara Phaladīpikā',
    schoolVariant: 'Fruitful Sign Abundance',
    confidenceScore: 91,
  },

  PHALADIPIKA_12_ALPA_PUTRA_BARREN: {
    ruleId: 'PHALADIPIKA_12_ALPA_PUTRA_BARREN',
    source: 'Phaladīpikā (Mantreśvara)',
    chapterAndVerse: 'Ch. 12, Śloka 5–7',
    sanskritTitle: 'वन्ध्याराशि-अल्पपुत्रयोगः',
    description:
      'When the 5th house falls in barren signs (Aries, Leo, Virgo) or is occupied by the Sun or Mars without benefic intervention, progeny is limited (Alpa-Putra) or arrives after medical or religious remedies.',
    tradition: 'Mantreśvara Phaladīpikā',
    schoolVariant: 'Vandhyā Rāśi Consideration',
    confidenceScore: 84,
  },

  BPHS_13_KARAKO_BHAVA_NASHAYA: {
    ruleId: 'BPHS_13_KARAKO_BHAVA_NASHAYA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 31 & Jātaka Pārijāta 13.12',
    sanskritTitle: 'कारको भावनाशाय विचारः',
    description:
      'If Jupiter (Putrakāraka) is placed alone in the 5th house without the association of any other benefic, it can cause delayed realization, anxiety over offspring, or a single surviving child (*Kārako Bhāva Nāśāya*).',
    tradition: 'Classical Horā Doctrine',
    schoolVariant: 'Kāraka Principle',
    confidenceScore: 82,
  },

  // --- 2. Karmic Curses (Santāna Śāpas per BPHS Ch. 13) ---
  BPHS_13_SARPA_SHAPA: {
    ruleId: 'BPHS_13_SARPA_SHAPA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 32–41',
    sanskritTitle: 'सर्पशाप-लक्षण-विधानम्',
    description:
      'Rahu occupying the 5th house aspected by Mars, or Mars in the 5th in a sign of Saturn aspected by Rahu, constitutes Sarpa Śāpa (curse of serpents / Nāga doṣa), causing reproductive delays requiring Nāga-pratiṣṭhā or Mahāmṛtyuñjaya japa.',
    tradition: 'Parāśari Karmic Curses',
    schoolVariant: 'BPHS Śāpa Adhyāya',
    confidenceScore: 87,
  },

  BPHS_13_PITRI_SHAPA: {
    ruleId: 'BPHS_13_PITRI_SHAPA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 42–52',
    sanskritTitle: 'पितृशाप-लक्षणम्',
    description:
      'Sun placed in the 5th house afflicted by Saturn and Rahu, or the 5th lord conjunct Sun in the 8th house, constitutes Pitṛ Śāpa (ancestral debt), causing obstacles in lineage continuation until Pitṛ Tarpaṇa or Śrāddha is performed.',
    tradition: 'Parāśari Karmic Curses',
    schoolVariant: 'BPHS Śāpa Adhyāya',
    confidenceScore: 86,
  },

  BPHS_13_MATRI_SHAPA: {
    ruleId: 'BPHS_13_MATRI_SHAPA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 53–62',
    sanskritTitle: 'मातृशाप-लक्षणम्',
    description:
      'Moon in the 5th house debilitated or hemmed by Saturn and Mars, or 5th lord conjunct afflicted Moon in Dusthāna, constitutes Mātṛ Śāpa, causing maternal and reproductive distress requiring Devi-ārādhanā.',
    tradition: 'Parāśari Karmic Curses',
    schoolVariant: 'BPHS Śāpa Adhyāya',
    confidenceScore: 85,
  },

  BPHS_13_BRAHMANA_SHAPA: {
    ruleId: 'BPHS_13_BRAHMANA_SHAPA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13, Śloka 63–73',
    sanskritTitle: 'ब्राह्मणशाप-लक्षणम्',
    description:
      'Jupiter debilitated in the 5th or conjunct Saturn and Rahu while the 5th lord is in Dusthāna constitutes Brāhmaṇa / Guru Śāpa, resolved via Dāna, Sahasranāma, and honoring spiritual preceptors.',
    tradition: 'Parāśari Karmic Curses',
    schoolVariant: 'BPHS Śāpa Adhyāya',
    confidenceScore: 85,
  },

  // --- 3. D7 Saptāṃśa & Inter-Varga Rules ---
  BPHS_6_SAPTAMSHA_PUTRA: {
    ruleId: 'BPHS_6_SAPTAMSHA_PUTRA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 6, Śloka 9–10 & Ch. 7',
    sanskritTitle: 'सप्तांशे पुत्रपौत्राणां विचारः',
    description:
      'Progeny, lineage, and grandchildren are judged primarily through the Saptāṃśa (D7) chart. The strength of D7 Lagna, D7 5th house, and D7 Jupiter determines the actualized manifestation of the D1 seed.',
    tradition: 'Parāśari Śoḍaśavarga',
    schoolVariant: 'Canonical Saptāṃśa',
    confidenceScore: 94,
  },

  SARVARTHA_5_D1_D7_HARMONY: {
    ruleId: 'SARVARTHA_5_D1_D7_HARMONY',
    source: 'Sarvārtha Cintāmaṇi (Veṅkaṭeśa Śarmā)',
    chapterAndVerse: 'Ch. 5, Śloka 38–42',
    sanskritTitle: 'सप्तांश-वर्गबल-समन्वयः',
    description:
      'If the D1 5th lord attains a Kendra or Koṇa in D7 or is exalted/vargottama, the native enjoys blessed children. If the D1 5th lord is debilitated or in 6/8/12 in D7, favorable D1 promises encounter severe practical friction.',
    tradition: 'Classical Horā Integration',
    schoolVariant: 'D1-D7 Inter-Varga',
    confidenceScore: 90,
  },

  // --- 4. Specialized Sphuṭas: Bīja & Kṣetra ---
  BPHS_83_BEEJA_SPHUTA: {
    ruleId: 'BPHS_83_BEEJA_SPHUTA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 83, Śloka 1–6 & Phaladīpikā 12.14',
    sanskritTitle: 'बीजस्फुट-निर्णयः (पुरुष-वीर्यबलम्)',
    description:
      'Bīja Sphuṭa (Sun + Venus + Jupiter) falling in an Odd sign in both Rāśi and Navāṃśa confirms robust procreative potency (*Sampūrṇa Bīja*). Mixed polarities require minor remedies; both even signs indicate genetic or vitality obstruction.',
    tradition: 'Parāśari Procreative Sphuṭa',
    schoolVariant: 'Male Fecundity Formula',
    confidenceScore: 93,
  },

  BPHS_83_KSHETRA_SPHUTA: {
    ruleId: 'BPHS_83_KSHETRA_SPHUTA',
    source: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 83, Śloka 7–12 & Phaladīpikā 12.17',
    sanskritTitle: 'क्षेत्रस्फुट-निर्णयः (स्त्री-गर्भबलम्)',
    description:
      'Kṣetra Sphuṭa (Moon + Mars + Jupiter) falling in an Even sign in both Rāśi and Navāṃśa confirms fertile uterine receptivity (*Sampūrṇa Kṣetra*). Odd signs indicate hormonal or physiological friction requiring propitiation.',
    tradition: 'Parāśari Procreative Sphuṭa',
    schoolVariant: 'Female Fecundity Formula',
    confidenceScore: 93,
  },

  PHALADIPIKA_12_SANTANA_TITHI: {
    ruleId: 'PHALADIPIKA_12_SANTANA_TITHI',
    source: 'Phaladīpikā (Mantreśvara)',
    chapterAndVerse: 'Ch. 12, Śloka 23–25',
    sanskritTitle: 'सन्तानतिथि-स्फुट-निर्णयः',
    description:
      'Santāna Sphuṭa calculated as 5 × (Moon - Sun) yields the Santāna Tithi. Auspicious Śukla Pakṣa tithis assure smooth conception; Riktā (4, 9, 14), Amāvāsyā, or Viṣṭi Karana indicate subtle conception barriers.',
    tradition: 'Mantreśvara Phaladīpikā',
    schoolVariant: 'Santāna Tithi Doctrine',
    confidenceScore: 86,
  },

  // --- 5. Jaimini Progeny Doctrines ---
  JAIMINI_1_PUTRAKARAKA: {
    ruleId: 'JAIMINI_1_PUTRAKARAKA',
    source: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'Adhyāya 1, Pāda 4, Sūtra 24–29',
    sanskritTitle: 'जैमिनि-पुत्रकारक एवं कारकांश-पञ्चमविचारः',
    description:
      'The Putrakāraka (PK) and planets placed in or aspecting (via Rāśi Dṛṣṭi) the 5th from Kārakāṃśa (KL) govern progeny. Benefics in 5th from KL bestow intelligent, noble offspring; malefics indicate trials or spiritual detachment.',
    tradition: 'Jaimini Sūtras',
    schoolVariant: 'Chara Kāraka System',
    confidenceScore: 90,
  },

  JAIMINI_PUTRAPADA_A5: {
    ruleId: 'JAIMINI_PUTRAPADA_A5',
    source: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'Adhyāya 1, Pāda 3 & BPHS Ch. 30',
    sanskritTitle: 'मन्त्रपद (A5) फलविचारः',
    description:
      'Putrapada (A5 / Mantra Pada) in harmonious relationship with Lagna and Ārūḍha Lagna (AL) indicates societal celebration of lineage. A5 placed in 6, 8, or 12 from AL suggests public or family friction concerning children.',
    tradition: 'Jaimini Sūtras',
    schoolVariant: 'Arūḍha Pada System',
    confidenceScore: 84,
  },

  // --- 6. Shastric Bhaṅga & Cancellation ---
  SARVARTHA_5_ANAPATYA_BHANGA: {
    ruleId: 'SARVARTHA_5_ANAPATYA_BHANGA',
    source: 'Sarvārtha Cintāmaṇi (Veṅkaṭeśa Śarmā)',
    chapterAndVerse: 'Ch. 5, Śloka 45–48 & Jātaka Pārijāta 13.35',
    sanskritTitle: 'अनपत्ययोग-भङ्ग-परिहारः',
    description:
      'Even if multiple afflictions, curses, or barren signs afflict the 5th house, if Jupiter is powerfully placed in a Kendra, or casts a full aspect on the 5th house or Lagna, all Anapatya combinations are dissolved (Bhaṅga), ensuring surviving progeny.',
    tradition: 'Classical Horā Synthesis',
    schoolVariant: 'Bhaṅga & Mitigation Doctrine',
    confidenceScore: 92,
  },
};

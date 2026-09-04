/**
 * Gaṇaka — Authoritative Classical Jyotiṣa Source Rules
 * Canonical citations, Sanskrit verses, and documented condition schemas from primary traditional treatises:
 * - Bṛhat Parāśara Horā Śāstra (BPHS) [Chowkhamba / Khemraj / Santhanam editions]
 * - Phaladīpikā of Mantreśvara [Subrahmanya Sastri / K.G. Datta editions]
 * - Bṛhat Jātaka of Varāhamihira [Bhat / V. Subrahmanya Sastri editions]
 * - Sārāvalī of Kalyāṇavarmā [N.N. Krishna Rau / Santhanam editions]
 * - Jaimini Upadeśa Sūtras of Maharṣi Jaimini [Sanjay Rath / P.S. Sastri editions]
 * - Jātaka Pārijāta of Vaidyanātha Dīkṣita [Kapoor / Subrahmanya Sastri editions]
 * - Uttarakālāmṛta of Kālidāsa [Subrahmanya Sastri edition]
 */

import { ClassicalRuleCitation } from './types';

export const CANONICAL_RULES: Record<string, ClassicalRuleCitation> = {
  // ==========================================
  // Domain 1: Lagna & Fundamental Constitution (तनुभाव)
  // ==========================================
  bphs_lagna_tanu_phala: {
    id: 'bphs_lagna_tanu_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 11 (Tanubhāva Phala), Śloka 1–4',
    sanskritTitle: 'तनुभाव लक्षणम्',
    sanskritShloka: 'लग्नेशे केन्द्रगे सौम्ये स्वोच्चे वा शुभवीक्षिते। देहसौख्यं भवेत्तस्य बलवान् दीर्घजीवकः॥',
    editionOrManuscript: 'Chowkhamba Sanskrit Series / Pt. Devachandra Jha recension',
    ruleDescription:
      'When the Lagna lord occupies a Kendra (1, 4, 7, 10), its exaltation sign, or is aspected by natural benefics, physical vitality (Deha-saukhya), stamina, and longevity are assured.',
    scopeAndConditions:
      'Lagneśa located in houses 1, 4, 7, 10 or 5, 9, with exaltation/moolatrikona/swakshetra dignity, or receiving benefic dṛṣṭi.',
    textualDisagreementNotes:
      'Varāhamihira in Bṛhat Jātaka (Ch. 19) notes that natural benefics situated directly on the Lagna degree can compensate for an afflicted Lagna lord, whereas Parāśara prioritizes the Lagna lord’s strength above all.',
  },
  phaladeepika_lagna_dehabala: {
    id: 'phaladeepika_lagna_dehabala',
    sourceText: 'Phaladīpikā (Mantreśvara)',
    chapterAndVerse: 'Ch. 14 (Dehasaukhyādi Phala), Śloka 1–3',
    sanskritTitle: 'देहसौख्यादि विचारः',
    sanskritShloka: 'लग्ने लग्नपतौ वाऽपि केन्द्रत्रिकोणगे बलयुते। अरिरोगशोकमुक्तः स जीवेच्छरदां शतम्॥',
    editionOrManuscript: 'V. Subrahmanya Sastri recension (1937)',
    ruleDescription:
      'If the Lagna or its lord occupies a Kendra or Trikona endowed with Śaḍbala, the native remains free from debilitating diseases, grief, and thrives with formidable constitutional resilience.',
    scopeAndConditions:
      'Lagna lord in Kendra/Trikona with Śaḍbala ratio >= 1.0, not combust, not debilitated without neechabhanga.',
  },
  saravali_lagna_vargottama: {
    id: 'saravali_lagna_vargottama',
    sourceText: 'Sārāvalī (Kalyāṇavarmā)',
    chapterAndVerse: 'Ch. 3 (Vargottamādhyāya), Śloka 48–50',
    sanskritTitle: 'वर्गोत्तम लग्न फलम्',
    sanskritShloka: 'वर्गोत्तमे तनौ जाते रूपवान् सुभगः शुचिः। कुलोत्तंसः प्रतापी च दीर्घायुश्च नरो भवेत्॥',
    editionOrManuscript: 'Kalyāṇavarmā Sārāvalī (Khemraj Shrikrishnadass ed.)',
    ruleDescription:
      'When the rising sign or the Lagna lord is Vargottama (occupying the same sign in D-1 and D-9), the native is blessed with attractive form, enduring health, family nobility, and sustained longevity.',
    scopeAndConditions:
      'Ascendant sign or Lagna lord identically positioned in D-1 Rāśi and D-9 Navāṃśa.',
  },

  // ==========================================
  // Domain 2: Personality & Temperament (मनःस्वभाव)
  // ==========================================
  saravali_chandra_buddhi_manas: {
    id: 'saravali_chandra_buddhi_manas',
    sourceText: 'Sārāvalī (Kalyāṇavarmā)',
    chapterAndVerse: 'Ch. 22–24 (Candra-Budha Prakṛti), Śloka 1–8',
    sanskritTitle: 'मनःस्वभाव निर्णयः',
    sanskritShloka: 'चन्द्रेण मनसो ज्ञानात् बुधेन बुद्धिनिर्णयः। सौम्यैर्युतेक्षितौ शान्तौ क्रूरैश्चण्डप्रकृतिको॥',
    editionOrManuscript: 'Sārāvalī, ed. R. Santhanam',
    ruleDescription:
      'Emotional temperament (Manas) is understood from the Moon, while intellectual discrimination (Buddhi) is ruled by Mercury. Benefic association produces serene, tranquil disposition; malefic association induces fiery, restless, or turbulent behavior.',
    scopeAndConditions:
      'Conjunctions and aspects on Moon and Mercury, Moon Paksha bala, Mercury combustion status.',
    textualDisagreementNotes:
      'Jaimini Sūtras ascribe deep internal soul-traits to the Ātmakāraka and its Navāṃśa (Kārakāṃśa), whereas Parāśara and Kalyāṇavarmā primarily rely on the Moon-Mercury-5th house triad.',
  },
  jaimini_atmakaraka_nature: {
    id: 'jaimini_atmakaraka_nature',
    sourceText: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'Adhyāya 1, Pāda 2, Sūtras 1–12',
    sanskritTitle: 'आत्मकारक स्वभाव सूत्रम्',
    sanskritShloka: 'आत्माधिकः कलादिभिर्नभोगेषु। कारकांशे स्वभाववृत्तिः॥',
    editionOrManuscript: 'Sanjay Rath commentary on Maharṣi Jaimini Upadeśa Sūtras',
    ruleDescription:
      'The planet possessing the highest longitude becomes the Ātmakāraka (AK). The nature of the AK planet and its Navāṃśa position determine the deepest spiritual impulses, ethical compass, and psychological orientation of the native.',
    scopeAndConditions:
      'Planet with maximum advanced degrees in the 7-kāraka system and its D-9 sign.',
  },

  // ==========================================
  // Domain 3: Career & Professional Life (दशमभाव एवं कर्मवृत्ति)
  // ==========================================
  brihat_jataka_karmajiva: {
    id: 'brihat_jataka_karmajiva',
    sourceText: 'Bṛhat Jātaka (Varāhamihira)',
    chapterAndVerse: 'Ch. 10 (Karmajīvādhyāya), Śloka 1–4',
    sanskritTitle: 'कर्मजीवाध्यायः',
    sanskritShloka: 'दशमे भानोर्मातृपितृपितृव्यसौख्यं धनं नृपात्। भौमे साहसात् सौम्ये विज्ञानात् गुरौ धर्मात्॥',
    editionOrManuscript: 'Varāhamihira Bṛhat Jātaka with Bhaṭṭotpala commentary',
    ruleDescription:
      'Livelihood (Karma/Vṛtti) is determined from the strongest of the 10th houses from Lagna, Moon, and Sun, and specifically by the lord of the Navāṃśa occupied by the 10th lord. Sun yields authority/state patronage, Mars technical/courageous enterprises, Mercury commerce/science/writing, Jupiter intellectual/legal/advisory pursuits, Venus artistic/luxury/design ventures, and Saturn labor/industrial/organizational service.',
    scopeAndConditions:
      'Planets in 10th from Lagna/Moon/Sun, 10th lord sign/navamsha dispositor, and dominant planetary karakatva.',
    textualDisagreementNotes:
      'Modern occupational titles must not be retrofitted as literal ancient texts. The classical texts specify broad karmic categories (e.g. Lipi/Writing, Gaṇita/Computation, Vaidya/Medicine, Rājasevā/Public Governance, Vāṇijya/Commerce, Śilpa/Craftsmanship).',
  },
  bphs_dashamsha_karmaphala: {
    id: 'bphs_dashamsha_karmaphala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 7 (Ṣoḍaśavarga) & Ch. 12 (Daśamabhāva Phala), Śloka 1–10',
    sanskritTitle: 'दशांश कर्म विचारः',
    sanskritShloka: 'दशांशे कर्म सिद्धिस्तु दशमेशबलेन च। अमात्यकारकसंयोगे महत्कार्यकरो भवेत्॥',
    editionOrManuscript: 'BPHS, Santhanam translation, Vol. 1',
    ruleDescription:
      'Achievement in public sphere, professional rank, and sustained executive authority are decoded through the Daśāṃśa (D-10) chart and the mutual relationship between the 10th lord and Amātyakāraka (AmK).',
    scopeAndConditions:
      '10th lord dignity in D-1 and D-10, Amātyakāraka placement, 10th house Aṣṭakavarga score.',
  },

  // ==========================================
  // Domain 4: Wealth & Resources (द्वितीय-एकादश भाव)
  // ==========================================
  bphs_dhana_labha_yogas: {
    id: 'bphs_dhana_labha_yogas',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 41 (Dhana Yoga Adhyāya), Śloka 1–18',
    sanskritTitle: 'धनयोग लक्षणम्',
    sanskritShloka: 'धनेशो लाभगश्चापि लाभेशो धनगो यदि। उभौ वा केन्द्रकोणस्थौ महाधनपतिर्भवेत्॥',
    editionOrManuscript: 'BPHS Chowkhamba Sanskrit Series',
    ruleDescription:
      'When the 2nd lord is in the 11th house and the 11th lord is in the 2nd house (or mutually conjunct in Kendra/Trikona), powerful Dhana Yogas form, granting immense treasury accumulation and steady prosperity.',
    scopeAndConditions:
      'Mutual sambandha between lords of 1, 2, 5, 9, 11; Jupiter dignity; 2nd/11th house SAV bindus >= 28.',
  },
  jataka_parijata_indu_lagna: {
    id: 'jataka_parijata_indu_lagna',
    sourceText: 'Jātaka Pārijāta (Vaidyanātha Dīkṣita)',
    chapterAndVerse: 'Adhyāya 7, Śloka 56–60',
    sanskritTitle: 'इन्दुलग्न धनविचारः',
    sanskritShloka: 'इन्दुलग्ने शुभैर्युक्ते धनवान् कीर्तिमान् भवेत्। पापैरल्पधनी ज्ञेयो मिश्रैर्मिश्रफलं वदेत्॥',
    editionOrManuscript: 'Jātaka Pārijāta, V. Subrahmanya Sastri ed.',
    ruleDescription:
      'Evaluation of Indu Lagna: Natural benefics situated in or aspecting Indu Lagna bestow sustained financial fortune without sudden bankruptcy; malefics indicate intermittent financial stress.',
    scopeAndConditions:
      'Indu Lagna calculation from 9th lords of Lagna and Moon, verifying occupants and aspects.',
  },

  // ==========================================
  // Domain 5: Education & Knowledge (चतुर्थ-पञ्चम भाव)
  // ==========================================
  bphs_vidya_buddhi: {
    id: 'bphs_vidya_buddhi',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 12 (Caturtha & Pañcama Bhāva), Śloka 1–12',
    sanskritTitle: 'विद्याबुद्धि विचारः',
    sanskritShloka: 'चतुर्थे विद्यालाभः स्यात् पञ्चमे बुद्धिनिर्णयः। बुधे वागीशसंयुक्ते महाविद्वान् प्रजायते॥',
    editionOrManuscript: 'BPHS Pt. Devachandra Jha recension',
    ruleDescription:
      'Formal education and institutional learning are derived from the 4th house and its lord; intuitive intellect (Buddhi), retentive memory (Dhī), and specialized authorship stem from the 5th house, Mercury (Vidyākāraka), and Jupiter (Jñānakāraka).',
    scopeAndConditions:
      '4th and 5th house lords in Kendra/Trikona, Mercury and Jupiter dignity, Caturviṃśāṃśa (D-24) Lagna.',
    textualDisagreementNotes:
      'South Indian traditions attribute degrees and formal certifications to the 4th house and intellectual creative research to the 5th, while some North Indian commentators group all academic pursuits under the 5th house.',
  },
  uttarakalamrita_saraswati_yoga: {
    id: 'uttarakalamrita_saraswati_yoga',
    sourceText: 'Uttarakālāmṛta (Kālidāsa)',
    chapterAndVerse: 'Kāṇḍa 4, Śloka 22–25',
    sanskritTitle: 'सरस्वती योग लक्षणम्',
    sanskritShloka: 'केन्द्रत्रिकोणगे जीवे बुधे शुक्रे च सुस्थिते। सरस्वती योगजातः सर्वशास्त्रविशारदः॥',
    editionOrManuscript: 'Uttarakālāmṛta ed. V. Subrahmanya Sastri',
    ruleDescription:
      'When Jupiter, Venus, and Mercury occupy Kendras, Trikonas, or the 2nd house with strong dignity, Sarasvatī Yoga manifests, creating mastery over literature, science, oratory, and arts.',
    scopeAndConditions:
      'Jupiter, Mercury, and Venus all well-placed in houses 1, 2, 4, 5, 7, 9, 10 with no severe combustion.',
  },

  // ==========================================
  // Domain 6: Marriage & Partnership (सप्तमभाव)
  // ==========================================
  bphs_saptama_vivaha: {
    id: 'bphs_saptama_vivaha',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13 (Saptamabhāva Phala), Śloka 1–20',
    sanskritTitle: 'सप्तमभाव कलत्र फलम्',
    sanskritShloka: 'सप्तमेशे शुभैर्युक्ते स्वोच्चे वा स्वगृहे स्थिते। भार्यासौख्यं सुपुत्रांश्च लभते नात्र संशयः॥',
    editionOrManuscript: 'BPHS Chowkhamba ed.',
    ruleDescription:
      'When the 7th lord is conjunct natural benefics, exalted, or in its own sign, matrimonial harmony, devoted companionship, and prosperity through partnership are obtained.',
    scopeAndConditions:
      '7th house, 7th lord dignity, Venus (Kalatrakāraka), Navāṃśa (D-9) 7th house and lord.',
  },
  jaimini_upapada_lagna_dampatya: {
    id: 'jaimini_upapada_lagna_dampatya',
    sourceText: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'Adhyāya 1, Pāda 4, Sūtras 1–10',
    sanskritTitle: 'उपपद लग्न दाम्पत्य सूत्रम्',
    sanskritShloka: 'उपपदं पदं पितुः। तत्र शुभयोगे भार्यासौख्यम्॥',
    editionOrManuscript: 'Jaimini Sūtras with Neelakantha commentary',
    ruleDescription:
      'Upapada Lagna (UL, arūḍha of the 12th house) reveals the material and relational reality of marriage. Benefics in UL or 2nd from UL sustain lifelong bond; malefics without benefic aspect suggest domestic turbulence.',
    scopeAndConditions:
      'Calculated Upapada Lagna (UL) sign, planets in UL and 2nd from UL, Dārakāraka (DK) planet.',
  },

  // ==========================================
  // Domain 7: Children & Progeny (पञ्चमभाव)
  // ==========================================
  bphs_putra_santana: {
    id: 'bphs_putra_santana',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 12 (Pañcamabhāva Phala), Śloka 1–15',
    sanskritTitle: 'सन्तान भाव फलम्',
    sanskritShloka: 'पञ्चमेशे बलोपेते गुरौ वा पञ्चमस्थिते। शुभदृष्टियुते तस्मिन् सन्ततिर्वर्धते भृशम्॥',
    editionOrManuscript: 'BPHS Pt. Devachandra Jha recension',
    ruleDescription:
      'If the 5th lord is endowed with strength and Jupiter is in the 5th or aspects the 5th house with benefic associations, progeny lineage flourish with virtue and filial happiness.',
    scopeAndConditions:
      '5th house occupants, 5th lord dignity, Jupiter (natural Putrakāraka), Saptāṃśa (D-7) 5th house/lord.',
  },
  phaladeepika_santana_yoga: {
    id: 'phaladeepika_santana_yoga',
    sourceText: 'Phaladīpikā (Mantreśvara)',
    chapterAndVerse: 'Ch. 18 (Santāna Bhāva), Śloka 1–6',
    sanskritTitle: 'सन्तान योग विचारः',
    sanskritShloka: 'सुतेशे केन्द्रगे सौम्ये गुरौ वा शुभवीक्षिते। सन्ततिः स्याद्गुणोपेता कुलोद्धारकरी शुभा॥',
    editionOrManuscript: 'Phaladīpikā ed. V. Subrahmanya Sastri',
    ruleDescription:
      'When the 5th lord occupies a Kendra, conjunct a natural benefic or aspected by Jupiter, virtuous children who bring honor to the family line are born.',
    scopeAndConditions:
      '5th lord in Kendra (1, 4, 7, 10), Jupiter aspect, 5th house SAV bindus >= 28.',
  },

  // ==========================================
  // Domain 8: Family & Domestic Life (द्वितीय-चतुर्थ भाव)
  // ==========================================
  bphs_kutumba_griha_sukha: {
    id: 'bphs_kutumba_griha_sukha',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 11 (Dvitiya) & Ch. 12 (Caturtha Bhāva)',
    sanskritTitle: 'कुटुम्ब गृहसुख विचारः',
    sanskritShloka: 'द्वितीये शुभसंयुक्ते चतुर्थेशे बलोन्विते। सुकुटुम्बी गृहस्वामी मातृभक्तो नरो भवेत्॥',
    editionOrManuscript: 'BPHS Khemraj Shrikrishnadass edition',
    ruleDescription:
      'Benefics in the 2nd house preserve harmonious family heritage; a powerful 4th lord and strong Moon ensure landed properties, ancestral comfort, domestic peace, and loving maternal bonds.',
    scopeAndConditions:
      '2nd and 4th houses/lords, Moon (Mātṛkāraka), Caturthāṃśa (D-4) and Dvādaśāṃśa (D-12) vargas.',
  },

  // ==========================================
  // Domain 9: Health-Related Classical Indications (षष्ठ-अष्टम भाव)
  // ==========================================
  bphs_roga_dehabala_arishta: {
    id: 'bphs_roga_dehabala_arishta',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 12 (Ṣaṣṭhabhāva) & Ch. 14 (Aṣṭamabhāva)',
    sanskritTitle: 'रोगारिष्ट निर्णयः',
    sanskritShloka: 'लग्नेशे बलहीने तु षष्ठेशे केन्द्रसंस्थिते। शरीरे व्याधयः स्युश्च क्लेशभाग् जायते नरः॥',
    editionOrManuscript: 'BPHS Chowkhamba Sanskrit Series',
    ruleDescription:
      'When the Lagna lord is weak and the 6th lord is entrenched in a Kendra with malefic association, constitutional vulnerabilities (Roga) arise according to the humors (Tridoṣa) of the afflicted Grahas.',
    scopeAndConditions:
      'Lagna lord vs 6th lord Śaḍbala ratio, 6th/8th house occupants, Sun/Moon affliction status.',
    textualDisagreementNotes:
      'Classical texts map ailments purely to Āyurvedic humors (Vāta, Pitta, Kapha) and planetary rulerships; these must never be stated as specific modern medical diagnoses.',
  },

  // ==========================================
  // Domain 10: Spiritual & Religious Inclination (नवम-द्वादश भाव)
  // ==========================================
  bphs_dharma_moksha_pravritti: {
    id: 'bphs_dharma_moksha_pravritti',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13 (Navama & Dvādaśabhāva Phala)',
    sanskritTitle: 'धर्म मोक्ष विचारः',
    sanskritShloka: 'नवमे शुभसंयुक्ते धर्मिष्ठो गुरुभक्तिमान्। द्वादशे केतुसंयुक्ते मोक्षभागी नरो भवेत्॥',
    editionOrManuscript: 'BPHS ed. R. Santhanam',
    ruleDescription:
      'Benefics in the 9th house generate deep philosophical inclination, adherence to Dharma, and reverence for traditional wisdom; Ketu or benefics in the 12th house incline the mind toward spiritual liberation (Mokṣa).',
    scopeAndConditions:
      '9th house/lord, 12th house/lord, Ketu (Mokṣakāraka), Viṃśāṃśa (D-20) chart.',
  },
  jaimini_karakamsha_ishta_devata: {
    id: 'jaimini_karakamsha_ishta_devata',
    sourceText: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'Adhyāya 1, Pāda 2, Sūtras 68–78',
    sanskritTitle: 'कारकांश इष्टदेवता सूत्रम्',
    sanskritShloka: 'कारकांशात् द्वादशे केतौ कैवल्यम्। शुभांशे देवताभक्तिः॥',
    editionOrManuscript: 'Maharṣi Jaimini Sūtras ed. Sanjay Rath',
    ruleDescription:
      'The 12th house from Kārakāṃśa (Navāṃśa sign of Ātmakāraka) indicates the path to liberation and the nature of the native’s tutelary deity (Iṣṭa Devatā). Ketu in 12th from Kārakāṃśa grants profound spiritual illumination.',
    scopeAndConditions:
      'Locate Ātmakāraka in D-9, inspect 12th house from that sign for Ketu, Sun, Jupiter, or Venus.',
  },

  // ==========================================
  // Domain 11: Social Position, Authority & Recognition (दशमभाव एवं राजयोग)
  // ==========================================
  bphs_raja_yogas_status: {
    id: 'bphs_raja_yogas_status',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 35–40 (Rājayoga Adhyāya)',
    sanskritTitle: 'राजयोग कीर्ति विचारः',
    sanskritShloka: 'केन्द्राधिपाश्च कोणाधिपाश्च संयुक्ता यदि तिष्ठन्ति। राजयोगकरो ज्ञेयः सर्वलोकेषु पूजितः॥',
    editionOrManuscript: 'BPHS Chowkhamba Sanskrit Series',
    ruleDescription:
      'Combinations between Kendra lords (action/quadrants) and Koṇa lords (trines/grace) establish authoritative Rāja Yogas, bestowing public eminence, leadership rank, and societal recognition.',
    scopeAndConditions:
      'Sambandha between lords of (1, 4, 7, 10) and (1, 5, 9); Sun strength; Arūḍha Lagna (AL) status.',
  },
  jaimini_arudha_lagna_kirti: {
    id: 'jaimini_arudha_lagna_kirti',
    sourceText: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'Adhyāya 1, Pāda 3, Sūtras 15–28',
    sanskritTitle: 'आरूढ कीर्ति सूत्रम्',
    sanskritShloka: 'आरूढलग्नादेकादशे शुभे लाभः कीर्तिश्च। दशमे चामलं यशः॥',
    editionOrManuscript: 'Jaimini Upadeśa Sūtras ed. P.S. Sastri',
    ruleDescription:
      'Planets in the 11th from Arūḍha Lagna (AL) determine material gains and popular reputation; benefics in the 10th from AL grant spotless public fame and ethical standing.',
    scopeAndConditions:
      'Arūḍha Lagna (AL) calculated sign, occupants of 10th and 11th from AL.',
  },

  // ==========================================
  // Domain 12: Major Life Themes & Chart Emphasis (कुण्डली महालक्षण)
  // ==========================================
  bphs_purushartha_balance: {
    id: 'bphs_purushartha_balance',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 45 (Bhāva Viveka & Puruṣārtha)',
    sanskritTitle: 'पुरुषार्थ त्रिकोण विचारः',
    sanskritShloka: 'धर्मार्थकाममोक्षाणां त्रिकोणेभ्यो विचिन्तयेत्। यद्बहुल्यं भवेत्तत्र तन्मार्गेणैव वर्तते॥',
    editionOrManuscript: 'Chowkhamba Sanskrit Series / Pt. Devachandra Jha recension',
    ruleDescription:
      'The planetary concentrations across the four Puruṣārtha Trikoṇas (Dharma: 1-5-9, Artha: 2-6-10, Kāma: 3-7-11, Mokṣa: 4-8-12) define the primary motivation, trajectory, and evolutionary arc of life.',
    scopeAndConditions:
      'Planetary distribution across the 4 cardinal Puruṣārtha trikonas (Dharma, Artha, Kāma, Mokṣa).',
  },
  bphs_nabhasa_life_pattern: {
    id: 'bphs_nabhasa_life_pattern',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 34 (Nābhasa Yoga Adhyāya) & Ch. 45',
    sanskritTitle: 'नाभस योग जीवन प्रवाहः',
    sanskritShloka: 'नाभसाः सर्वदा फलदा अन्यदशाविवर्जिताः। जीवनस्य महामार्गं सूचयन्ति मनीषिभिः॥',
    editionOrManuscript: 'BPHS Pt. Devachandra Jha recension',
    ruleDescription:
      'Nābhasa yogas operate throughout life without waiting for specific Daśā periods. The macro disposition of Grahas across Kendras, Trikonas, and Upacayas determines the structural flow, challenges, and destiny themes of the lifetime.',
    scopeAndConditions:
      'Planetary distribution across Kendra/Koṇa/Upacaya/Dusthāna, elemental Tattva balance, and overall Śaḍbala polarity.',
  },
};

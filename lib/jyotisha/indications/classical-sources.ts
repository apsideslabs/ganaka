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
 *
 * CHAPTER NUMBERING — one convention throughout: R. Santhanam's two-volume
 * English edition, which is what the bhāva chapters below are cited from.
 * The bhāva-phala chapters are 12 (1st) through 23 (12th) and 24 (house
 * lords). Girish Chand Sharma's edition numbers the same chapters two higher
 * (14 through 25), so a "Ch. 14 Tanu Bhāva" in Sharma is "Ch. 12" here.
 * Every citation states which text and chapter; verse counts follow the
 * Sanskrit text at sanskritdocuments.org, which uses the Santhanam order.
 */

import { ClassicalRuleCitation } from './types';

export const CANONICAL_RULES: Record<string, ClassicalRuleCitation> = {
  // ==========================================
  // Domain 1: Lagna & Fundamental Constitution (तनुभाव)
  // ==========================================
  bphs_lagna_tanu_phala: {
    id: 'bphs_lagna_tanu_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 12 (Tanubhāva Phala), Śloka 1–15',
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
    chapterAndVerse: 'Ch. 21 (Karmabhāva Phala), Śloka 1–22',
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
    chapterAndVerse: 'Ch. 15–16 (Sukha & Pañcama Bhāva), Śloka 1–14 and 1–32',
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
    chapterAndVerse: 'Ch. 18 (Jāyābhāva Phala), Śloka 1–42',
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
    chapterAndVerse: 'Ch. 16 (Pañcamabhāva Phala), Śloka 1–32',
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
    chapterAndVerse: 'Ch. 13 (Dhanabhāva) & Ch. 15 (Sukhabhāva)',
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
    chapterAndVerse: 'Ch. 17 (Ṣaṣṭhabhāva) & Ch. 19 (Āyurbhāva)',
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
    chapterAndVerse: 'Ch. 20 (Bhāgyabhāva) & Ch. 23 (Vyayabhāva)',
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
    chapterAndVerse: 'Ch. 39 (Rājayoga) & Ch. 40 (Rājyasambandha Yoga)',
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
    chapterAndVerse: 'Ch. 11 (Bhāvaviveka), Śloka 1–13',
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
    chapterAndVerse: 'Ch. 35 (Nābhasa Yoga)',
    sanskritTitle: 'नाभस योग जीवन प्रवाहः',
    sanskritShloka: 'नाभसाः सर्वदा फलदा अन्यदशाविवर्जिताः। जीवनस्य महामार्गं सूचयन्ति मनीषिभिः॥',
    editionOrManuscript: 'BPHS Pt. Devachandra Jha recension',
    ruleDescription:
      'Nābhasa yogas operate throughout life without waiting for specific Daśā periods. The macro disposition of Grahas across Kendras, Trikonas, and Upacayas determines the structural flow, challenges, and destiny themes of the lifetime.',
    scopeAndConditions:
      'Planetary distribution across Kendra/Koṇa/Upacaya/Dusthāna, elemental Tattva balance, and overall Śaḍbala polarity.',
  },
  // ==========================================
  // Bhāva-viveka — how a bhāva's result is judged at all
  // ==========================================
  bphs_bhava_viveka_judgement: {
    id: 'bphs_bhava_viveka_judgement',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 11 (Bhāvaviveka), Śloka 14–16',
    sanskritTitle: 'भावविवेकाध्यायः',
    sanskritShloka:
      'यो यो शुभैर्युतो दृष्टो भावो वा पतिदृष्टयुक् । युवा प्रवृद्धो राज्यस्थः कुमारो वाऽपि यत्पतिः ॥१४॥ तदीक्षणवशात् तत्तद्भावसौख्यं वदेद् बुधः । यद्यद् भावपतिर्नष्टस्त्रिकेशाद्यैश्च संयुक्तः ॥१५॥ भावं न वीक्षते सम्यक् सुप्तो वृद्धोमृतोऽथवा । पीडितो वाऽस्य भावस्य फलं नष्टं वदेद् ध्रुवम् ॥१६॥',
    ruleDescription:
      'A bhāva gives its result according to its lord. Joined with or aspected by benefics, the lord is "young and grown" and the bhāva flourishes; lost among the trikeśas (6th, 8th, 12th lords) or asleep, aged or dead, it gives nothing. The lord must actually see its own bhāva.',
    scopeAndConditions:
      'Bhāveśa in 6/8/12, combust, in an enemy sign, or receiving no aspect on its own bhāva — the bhāva result is destroyed. Benefic conjunction or dṛṣṭi on the lord restores it.',
    editionOrManuscript: 'R. Santhanam, Vol. 1 (Sanskrit per sanskritdocuments.org)',
    textualDisagreementNotes:
      'This is the master gate the later bhāva chapters assume. Applying the bhāva-phala verses without it is the commonest error in software: a rule is read as met when its lord is destroyed.',
  },

  // ==========================================
  // Domain 3: Dhana — wealth (2nd bhāva)
  // ==========================================
  bphs_dhana_bhava_phala: {
    id: 'bphs_dhana_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 13 (Dhanabhāva Phala), Śloka 1–5',
    sanskritTitle: 'धनभावफलाध्यायः',
    sanskritShloka:
      'धनभावफलं वच्मि श‍ृणु त्वं द्विजसत्तम । धनेशो धनभावस्थः केन्द्रकोणगतोऽपि वा ॥१॥ धनवृद्धिकरो ज्ञेयस्त्रिकस्थो धनहानिकृत् । धनदश्च धने सौम्यः पापो धनविनाशकृत् ॥२॥ धनाधिपो गुरुर्यस्य धनभावगतो भवेत् । भौमेन सहितो वाऽपि धनवान् स धनवान् नरो भवेत् ॥३॥ धनेशे लाभभावस्थे लाभेशे वा धनं गते । तावुभौ केन्द्रकोणस्थौ धनवान् स धनवान् नरो भवेत् ॥४॥ धनेशे केन्द्रराशिस्थे लाभेशे तत्त्रिकोणगे । गुरुशुक्रयुते दृष्टे धनलाभमुदीरयेत् ॥५॥',
    ruleDescription:
      'The 2nd lord in the 2nd, or in a kendra or trikoṇa, increases wealth; in a trika house (6/8/12) it destroys it. A benefic in the 2nd gives wealth, a malefic destroys it. The 2nd and 11th lords together in kendra/trikoṇa, joined or aspected by Jupiter and Venus, give definite gain.',
    scopeAndConditions:
      'Dhana gives when the 2nd lord is in 1/4/7/10 or 5/9; the 11th lord in a trikoṇa; both receiving benefic dṛṣṭi. Trika placement of either reverses it.',
    editionOrManuscript: 'R. Santhanam, Vol. 1 (Sanskrit per sanskritdocuments.org)',
    textualDisagreementNotes:
      'BPHS Ch. 41 develops the same lordship logic into named wealth yogas; Ch. 13 is the base statement. Where the two conflict, Ch. 41 is the later refinement.',
  },

  bphs_labha_bhava_phala: {
    id: 'bphs_labha_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 22 (Lābhabhāva Phala), Śloka 1–11',
    ruleDescription:
      'The 11th bhāva governs income and the fulfilment of desires. Its lord in a kendra or trikoṇa, or in the 11th itself, gives steady gain; in a trika house it gives debt and loss of income.',
    scopeAndConditions:
      'Lābheśa placement, occupants of the 11th, and the 11th lord\'s relation to the 2nd and 5th lords.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
  },

  bphs_daridra_yogas: {
    id: 'bphs_daridra_yogas',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 42 (Dāridryayoga), Śloka 1–18',
    ruleDescription:
      'Combinations for penury: the 2nd and 11th lords in dusthānas, joined with malefics, or bereft of strength; the 6th, 8th and 12th lords linked to the wealth lords. The text pairs these with the countervailing wealth yogas of Ch. 41 rather than reading them alone.',
    scopeAndConditions:
      'Wealth-lord placement in 6/8/12 with malefic conjunction, and the absence of any Ch. 41 dhana yoga.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
    textualDisagreementNotes:
      'A dāridra yoga is read only when no dhana yoga of comparable strength opposes it — the text says so explicitly, and reading either in isolation gives a false verdict.',
  },

  // ==========================================
  // Domain 8: Family — 3rd and 4th bhāvas
  // ==========================================
  bphs_sahaja_bhava_phala: {
    id: 'bphs_sahaja_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 14 (Sahajabhāva Phala), Śloka 1–15',
    sanskritTitle: 'सहजभावफलाध्यायः',
    sanskritShloka:
      'अथ विक्रमभावस्य फलं वक्ष्यामि भो द्विज । सहजे सौम्ययुग्दृष्टे भ्रातृमान् विक्रमी भ्रातृमान् नरः ॥१॥ सभौमो भ्रातृभावेशो भ्रातृभावं प्रपश्यति । भ्रातृक्षेत्रगतो वाऽपि भ्रातृभावं विनिर्दिशेत् ॥२॥',
    ruleDescription:
      'The 3rd bhāva governs siblings and courage. Aspected by benefics, the native has brothers and valour; the 3rd lord in its own bhāva or seeing it confirms siblings. Malefic conjunction with the 3rd lord and its bhāva destroys the siblings.',
    scopeAndConditions:
      '3rd lord placement and dṛṣṭi on the 3rd; benefic versus malefic occupancy.',
    editionOrManuscript: 'R. Santhanam, Vol. 1 (Sanskrit per sanskritdocuments.org)',
  },

  bphs_sukha_bhava_phala: {
    id: 'bphs_sukha_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 15 (Sukhabhāva Phala), Śloka 1–14',
    sanskritTitle: 'सुखभावफलाध्यायः',
    sanskritShloka:
      'सुखेशे सुखभावस्थे लग्नेशे तद्गतेऽपि वा । शुभदृष्टे च जातस्य पूर्णं गृहसुखं वदेत् ॥२॥ स्वगेहे स्वांशके स्वोच्चे सुखस्थानाधिपो यदि । भूमियानगृहादीनां सुखं वाद्यभवं तथा ॥३॥ बन्धुस्थानेश्वरे सौम्ये शुभग्रहयुतेक्षिते । शशिजे लग्नसंयुक्ते बन्धुपूज्यो भवेन्नरः ॥५॥',
    ruleDescription:
      'The 4th bhāva governs home, mother and domestic happiness. Its lord in the 4th, or the lagna lord there, with benefic dṛṣṭi, gives full domestic comfort; the 4th lord in its own sign, own aṃśa or exaltation gives land, vehicles and houses.',
    scopeAndConditions:
      '4th lord dignity and placement, benefic aspect on the 4th, and the 4th lord\'s relation to the 10th lord for the quality of the dwelling.',
    editionOrManuscript: 'R. Santhanam, Vol. 1 (Sanskrit per sanskritdocuments.org)',
  },

  // ==========================================
  // Domain 9: Health — 6th and 8th bhāvas
  // ==========================================
  bphs_shashtha_bhava_phala: {
    id: 'bphs_shashtha_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 17 (Ṣaṣṭhabhāva Phala), Śloka 1–28',
    sanskritTitle: 'षष्ठभावफलाध्यायः',
    sanskritShloka:
      'अथ विप्र फलं वक्ष्ये षष्ठभावसमुद्भवम् । देहे रोगव्रणाद्यं तत् श्रूयतामेकचेतसा ॥१॥ षष्ठाधिपः स्वगेहे वा देहे वाऽप्यष्टमे स्थितः । तदा व्रणा भवेद्देहे षष्ठराशिसमाश्रिते ॥२॥',
    ruleDescription:
      'The 6th bhāva governs disease, wounds and enemies. Its lord in its own sign, in the lagna, or in the 8th gives wounds on the body; the specific limb and nature of the disease follow from the graha conjunct the 6th lord (Sun — head, Moon — face, Mars — throat, Mercury — navel, Jupiter — nose, Venus — eyes, Saturn — feet, Rāhu — belly).',
    scopeAndConditions:
      '6th lord placement, and the graha joined with the 6th lord and 8th lord, which names the affected region. Malefic strength in the 6th increases the affliction.',
    editionOrManuscript: 'R. Santhanam, Vol. 1 (Sanskrit per sanskritdocuments.org)',
  },

  bphs_ayur_bhava_phala: {
    id: 'bphs_ayur_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 19 (Āyurbhāva Phala), Śloka 1–15',
    ruleDescription:
      'The 8th bhāva governs longevity, sudden events and the manner of death. Its lord strong and well placed lengthens life; afflicted, or joined to the 6th and 12th lords, it shortens it. BPHS pairs this chapter with Ch. 43 (longevity calculations) and Ch. 44 (māraka grahas), and reads none of them alone.',
    scopeAndConditions:
      '8th lord strength and placement, with the māraka analysis of Ch. 44 required before any longevity statement.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
    textualDisagreementNotes:
      'BPHS warns repeatedly against pronouncing longevity from a single factor; Ch. 43 lists several competing methods (Piṇḍāyu, Naisargāyu, Aṃśāyu) that do not always agree.',
  },

  // ==========================================
  // Domain 5: Education — 4th and 5th bhāvas
  // ==========================================
  bphs_panchama_bhava_phala: {
    id: 'bphs_panchama_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 16 (Pañcamabhāva Phala), Śloka 1–32',
    ruleDescription:
      'The 5th bhāva governs learning, children and merit. Its lord in a kendra or trikoṇa, with Mercury and Jupiter well placed, gives sharp intelligence and success in study; in a trika house, or with the 5th lord combust, it gives interruption of education.',
    scopeAndConditions:
      '5th lord placement and dignity; Mercury (buddhi) and Jupiter (jñāna) strength; the 4th lord for formal schooling.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
  },

  // ==========================================
  // Domain 6: Marriage — 7th bhāva
  // ==========================================
  bphs_jaya_bhava_phala: {
    id: 'bphs_jaya_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 18 (Jāyābhāva Phala), Śloka 1–42',
    ruleDescription:
      'The 7th bhāva governs the spouse and partnership. Its lord in a kendra or trikoṇa, with Venus strong, gives a good spouse and lasting union; the 7th lord in a trika house, combust, or joined to malefics gives delay, discord or loss of the spouse. The chapter is the longest of the bhāva chapters at 42 verses because it also treats the spouse\'s family, the timing of marriage and remarriage.',
    scopeAndConditions:
      '7th lord placement and dignity, Venus\'s strength, benefic versus malefic occupancy of the 7th, and the Upapada for the spouse\'s nature.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
  },

  // ==========================================
  // Domain 10: Spirituality — 9th and 12th bhāvas
  // ==========================================
  bphs_bhagya_bhava_phala: {
    id: 'bphs_bhagya_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 20 (Bhāgyabhāva Phala), Śloka 1–32',
    ruleDescription:
      'The 9th bhāva governs dharma, fortune, the guru and long journeys. Its lord strong in a trikoṇa gives fortune and faith; joined to the 12th lord or to Saturn it turns the native toward renunciation. The 9th lord with Jupiter well placed is the classical marker of a religious or scholarly life.',
    scopeAndConditions:
      '9th lord placement, Jupiter\'s condition, and the 9th lord\'s link to the 12th (moksha) and 5th (upāsana).',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
  },

  bphs_vyaya_bhava_phala: {
    id: 'bphs_vyaya_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 23 (Vyayabhāva Phala), Śloka 1–14',
    ruleDescription:
      'The 12th bhāva governs expenditure, loss, foreign lands and final liberation. Its lord strong gives generous spending and residence abroad; joined to the 9th lord it gives moksha. Malefic occupancy of the 12th without benefic relief gives wasteful loss.',
    scopeAndConditions:
      '12th lord placement and dignity, occupancy of the 12th, and the 12th lord\'s relation to the 9th lord for the liberation reading.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
  },

  // ==========================================
  // Domain 4: Career — 10th bhāva
  // ==========================================
  bphs_karma_bhava_phala: {
    id: 'bphs_karma_bhava_phala',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'Ch. 21 (Karmabhāva Phala), Śloka 1–22',
    ruleDescription:
      'The 10th bhāva governs action, profession and standing. Its lord in a kendra or trikoṇa, in its own sign or exaltation, gives high position and honour from authority; in a trika house it gives servitude and obstruction in work. The graha in the 10th names the profession.',
    scopeAndConditions:
      '10th lord placement and dignity, the graha occupying the 10th, and the Daśāṃśa (D-10) for the specific occupation.',
    editionOrManuscript: 'R. Santhanam, Vol. 1',
  },

};

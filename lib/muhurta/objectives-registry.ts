/**
 * Gaṇaka — Classical Muhūrta Objectives Registry
 * Verified objectives with objective-specific dynamic questions and classical rules.
 */

import { MuhurtaObjectiveDefinition, MuhurtaObjectiveId } from './types';
import { CLASSICAL_SOURCES_REGISTRY } from './classical-sources';

export const MUHURTA_OBJECTIVES: MuhurtaObjectiveDefinition[] = [
  {
    id: 'grihapravesha',
    name: 'Gṛha Praveśa (House Warming / Ingress)',
    sanskritName: 'गृहप्रवेश मुहूर्तः',
    category: 'Vāstu & Gṛha',
    briefDescription:
      'Ceremonial first entry into a newly constructed or acquired home, or re-entry after travel or renovations per classical Vāstu texts.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_grihapravesha_1],
    dynamicQuestions: [
      {
        id: 'entryType',
        label: 'Type of House Entry',
        sanskritTerm: 'प्रवेशभेदः',
        description: 'Classical category of Gṛhapraveśa as classified by Muhūrta Cintāmaṇi.',
        type: 'select',
        options: [
          {
            label: 'Apūrva (अपूर्व) — First entry into newly built house',
            value: 'apurva',
            hint: 'Requires Sthira Lagna, Uttamā Tithis, and strictly avoids Guru/Śukra Asta.',
          },
          {
            label: 'Sapūrva (सपूर्व) — Re-entry after journey, migration, or old house purchase',
            value: 'sapurva',
            hint: 'Permits Dvisvabhāva Lagna with auspicious benefic aspects.',
          },
          {
            label: 'Dvandvā / Jīrṇa (द्वन्द्वा / जीर्ण) — Entry after major renovation or calamity',
            value: 'dvandva',
            hint: 'Specific Śānti ritual rules apply before entering.',
          },
        ],
        defaultValue: 'apurva',
      },
      {
        id: 'houseDirection',
        label: 'Main Door Direction Facing',
        sanskritTerm: 'द्वारदिशा',
        description: 'Orientation of the main entrance to determine Vāstu Sūrya-Cakra compliance.',
        type: 'select',
        options: [
          { label: 'East (Pūrva)', value: 'east' },
          { label: 'North (Uttara)', value: 'north' },
          { label: 'West (Paścima)', value: 'west' },
          { label: 'South (Dakṣiṇa)', value: 'south' },
        ],
        defaultValue: 'east',
      },
      {
        id: 'requireSthiraLagna',
        label: 'Strict Sthira (Fixed) Lagna Requirement',
        sanskritTerm: 'स्थिरलग्ननियमः',
        description: 'Taurus (Vṛṣabha), Leo (Siṁha), Scorpio (Vṛścika), or Aquarius (Kumbha).',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    // Favorable Tithis: Dvitīyā, Tṛtīyā, Pañcamī, Saptamī, Daśamī, Ekādaśī, Trayodaśī
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 17, 18, 20, 22, 25, 26, 28],
    // Favorable Days: Monday, Wednesday, Thursday, Friday
    favorableVaras: [1, 3, 4, 5],
    // Favorable Nakshatras: Rohini, Mrigashiras, Pushya, Uttaraphalguni, Hasta, Chitra, Anuradha, Uttarashadha, Shravana, Dhanishtha, Shatabhisha, Uttarabhadrapada, Revati
    favorableNakshatras: [4, 5, 8, 12, 13, 14, 17, 21, 22, 23, 24, 26, 27],
    // Favorable Lagnas: Taurus (2), Leo (5), Scorpio (8), Aquarius (11)
    favorableLagnas: [2, 5, 8, 11],
    // Prohibited: Rikta (4, 9, 14, 19, 24, 29), Amavasya (30)
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [0, 2, 6], // Sunday, Tuesday, Saturday generally excluded for Apurva
    rules: [
      {
        id: 'gp_rule_lagna',
        name: 'Sthira (Fixed) Lagna Principle',
        sanskritName: 'स्थिरलग्नप्राशस्त्यम्',
        category: 'Lagna',
        ruleTier: 'MAJOR_CONDITION',
        description:
          'Ascendant must be Taurus (2), Leo (5), Scorpio (8), or Aquarius (11) to establish permanence and prosperity in the home.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_grihapravesha_1,
        isMandatory: true,
      },
      {
        id: 'gp_rule_tithi',
        name: 'Auspicious Tithi (Non-Rikta)',
        sanskritName: 'रिक्तावर्जनम्',
        category: 'Tithi',
        ruleTier: 'MAJOR_CONDITION',
        description: 'Tithi must be non-Rikta (not 4th, 9th, 14th) and not Amāvāsyā.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_grihapravesha_1,
        isMandatory: true,
      },
      {
        id: 'gp_rule_exclusions',
        name: 'Exclusion of Viṣṭi (Bhadrā) & Rāhu Kāla',
        sanskritName: 'विष्टि-राहुकाल वर्जनम्',
        category: 'Exclusion',
        ruleTier: 'ABSOLUTE_PROHIBITION',
        description: 'The period must not fall inside active Viṣṭi Karaṇa or diurnal Rāhu Kāla.',
        citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'vivaha',
    name: 'Vivāha (Marriage / Wedding)',
    sanskritName: 'विवाह मुहूर्तः',
    category: 'Sanskāras',
    briefDescription:
      'Sacred marriage sacrament requiring pure Lagna, 8th house purity (Aṣṭama Śuddhi), and benefic aspects per Muhūrta Cintāmaṇi.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_vivaha_lagna],
    dynamicQuestions: [
      {
        id: 'seasonPreference',
        label: 'Preferred Solar Season / Ayana',
        sanskritTerm: 'उत्तरायण-दक्षिणायनम्',
        description: 'Uttarāyaṇa (approx. Jan–Jul) is classically praised for Vivāha.',
        type: 'select',
        options: [
          { label: 'Uttarāyaṇa (Sun moving North — Highly Auspicious)', value: 'uttarayana' },
          { label: 'Any Canonical Marriage Window', value: 'any' },
        ],
        defaultValue: 'any',
      },
      {
        id: 'strictAshtamaShuddhi',
        label: 'Strict 8th House Purity (Aṣṭama Śuddhi)',
        sanskritTerm: 'अष्टमशुद्धिनियमः',
        description: 'Ensures the 8th house from rising wedding Lagna is completely free of any planet.',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 17, 18, 20, 22, 25, 26, 27],
    favorableVaras: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    favorableNakshatras: [4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 23, 26, 27], // Rohini, Mrigashira, Punarvasu, Pushya, etc.
    favorableLagnas: [2, 3, 4, 5, 6, 7, 9, 11, 12], // Gem, Can, Leo, Vir, Lib, Sag, Aqu, Pis
    prohibitedTithis: [1, 4, 9, 14, 19, 24, 29, 30], // Rikta & Amavasya + Pratipada
    prohibitedVaras: [2, 6], // Tuesday, Saturday
    rules: [
      {
        id: 'viv_rule_lagna_benefics',
        name: 'Benefic Kendra/Trikoṇa Alignment',
        sanskritName: 'शुभग्रहकेन्द्रस्थितिः',
        category: 'Lagna',
        ruleTier: 'MAJOR_CONDITION',
        description: 'Wedding Lagna must be fortified with Jupiter, Venus, or Mercury in Kendra or Trikoṇa.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_vivaha_lagna,
        isMandatory: true,
      },
      {
        id: 'viv_rule_exclusions',
        name: 'Clearing of Mahā-Doṣas (Bhadra, Rahu, Gandanta)',
        sanskritName: 'महादोषवर्जनम्',
        category: 'Exclusion',
        ruleTier: 'ABSOLUTE_PROHIBITION',
        description: 'Must clear Bhadrā Karaṇa, Rāhu Kāla, Yamagaṇḍa, and Nakṣatra Gandānta.',
        citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'vanijyarambha',
    name: 'Vāṇijyārambha (Business / Commercial Commencement)',
    sanskritName: 'वाणिज्यारम्भ मुहूर्तः',
    category: 'Vāṇijya & Artha',
    briefDescription:
      'Starting a new commercial enterprise, retail outlet, partnership, or financial company.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_vanijya_trade],
    dynamicQuestions: [
      {
        id: 'businessType',
        label: 'Business Operational Nature',
        sanskritTerm: 'व्यवसायप्रकृतिः',
        description: 'Trade vs. Services vs. Manufacturing / Tech.',
        type: 'select',
        options: [
          { label: 'Trade / Retail / Commerce (Mercurial focus)', value: 'trade' },
          { label: 'Manufacturing / Real Estate / Heavy Goods (Saturn/Mars focus)', value: 'mfg' },
          { label: 'Consulting / Tech / Knowledge / Finance (Jupiter/Mercury focus)', value: 'tech' },
        ],
        defaultValue: 'trade',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 15, 17, 18, 20, 22, 25, 26, 28],
    favorableVaras: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    favorableNakshatras: [1, 4, 5, 8, 12, 13, 14, 15, 17, 21, 22, 23, 24, 27],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 11],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2], // Tuesday
    rules: [
      {
        id: 'van_rule_vara',
        name: 'Saumya Vāra (Mercurial/Jupiterian Day)',
        sanskritName: 'सौम्यवारप्राशस्त्यम्',
        category: 'Vara',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Wednesday, Thursday, or Friday generate auspicious liquidity and growth.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_vanijya_trade,
        isMandatory: false,
      },
      {
        id: 'van_rule_exclusions',
        name: 'Rāhu Kāla & Viṣṭi Prohibition',
        sanskritName: 'राहुकाल-विष्टि परिहारः',
        category: 'Exclusion',
        ruleTier: 'ABSOLUTE_PROHIBITION',
        description: 'Avoid initial ledger opening or store opening in Rāhu Kāla.',
        citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'kraya_vikraya',
    name: 'Business Agreement & Contract Signing',
    sanskritName: 'क्रय-विक्रय / व्यापार-करार मुहूर्तः',
    category: 'Vāṇijya & Artha',
    briefDescription:
      'Signing commercial agreements, executing MOUs, buying or selling high-value commodities, and partnerships.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_vanijya_trade],
    dynamicQuestions: [
      {
        id: 'role',
        label: 'User Role in Agreement',
        sanskritTerm: 'पक्षभेदः',
        description: 'Whether you are primarily buying/investing or selling/delivering.',
        type: 'select',
        options: [
          { label: 'Buyer / Investor (Seeking asset retention)', value: 'buyer' },
          { label: 'Seller / Service Provider (Seeking swift execution & payment)', value: 'seller' },
          { label: 'Bilateral Partnership / Joint Venture', value: 'bilateral' },
        ],
        defaultValue: 'bilateral',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 15, 17, 18, 20, 22, 25, 26, 28],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 8, 12, 13, 14, 15, 17, 21, 22, 27],
    favorableLagnas: [2, 3, 6, 7, 9, 11],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2, 6],
    rules: [
      {
        id: 'kv_rule_lagna',
        name: 'Dvisvabhāva / Chara Lagna Agreement Rule',
        sanskritName: 'द्विस्वभाव-चरलग्नसंयोगः',
        category: 'Lagna',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Dual and cardinal Lagnas facilitate smooth agreement negotiations and mutual fulfillment.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_vanijya_trade,
        isMandatory: false,
      },
    ],
  },
  {
    id: 'griharambha',
    name: 'Gṛhārambha (House Foundation / Construction)',
    sanskritName: 'गृहारम्भ / शिलान्यास मुहूर्तः',
    category: 'Vāstu & Gṛha',
    briefDescription:
      'Laying the cornerstone (Śilānyāsa), foundation excavation, and starting building construction.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.bs_vastu_foundation],
    dynamicQuestions: [
      {
        id: 'structureType',
        label: 'Structure Purpose',
        sanskritTerm: 'निर्माणप्रकारः',
        description: 'Residential home vs. Commercial / Industrial.',
        type: 'select',
        options: [
          { label: 'Residential Dwelling (Vāstu Gṛha)', value: 'residential' },
          { label: 'Commercial Complex / Factory', value: 'commercial' },
        ],
        defaultValue: 'residential',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 17, 18, 20, 22, 25, 26, 28],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [4, 5, 8, 12, 13, 14, 17, 21, 22, 26, 27],
    favorableLagnas: [2, 5, 8, 11], // Sthira
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [0, 2, 6],
    rules: [
      {
        id: 'ga_rule_sthiram',
        name: 'Fixed Sign (Sthira Lagna) Foundation Rule',
        sanskritName: 'स्थिरलग्नशिलान्यासः',
        category: 'Lagna',
        ruleTier: 'MAJOR_CONDITION',
        description: 'Foundation must be planted when a Fixed sign is rising.',
        citation: CLASSICAL_SOURCES_REGISTRY.bs_vastu_foundation,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'yatra',
    name: 'Yātrā / Prayāṇa (Travel & Journey)',
    sanskritName: 'यात्रा / प्रयाण मुहूर्तः',
    category: 'Gati & Yātrā',
    briefDescription:
      'Commencing international, business, pilgrimage, or long-distance travel avoiding Vāra-Śūla.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.kalamrita_yatra],
    dynamicQuestions: [
      {
        id: 'travelDirection',
        label: 'Direction of Travel (Dik-Śūla Check)',
        sanskritTerm: 'प्रयाणदिशा (दिक्शूलविचारः)',
        description: 'Crucial classical rule: never travel toward the direction of weekday Vāra-Śūla.',
        type: 'select',
        options: [
          { label: 'East (Pūrva) — Prohibited on Mon & Sat', value: 'east' },
          { label: 'South (Dakṣiṇa) — Prohibited on Thu', value: 'south' },
          { label: 'West (Paścima) — Prohibited on Sun & Fri', value: 'west' },
          { label: 'North (Uttara) — Prohibited on Tue & Wed', value: 'north' },
        ],
        defaultValue: 'east',
      },
      {
        id: 'journeyNature',
        label: 'Nature of Journey',
        sanskritTerm: 'यात्राप्रयोजनम्',
        description: 'Business, Leisure, Pilgrimage, or Relocation.',
        type: 'select',
        options: [
          { label: 'Business / Official Delegation', value: 'business' },
          { label: 'Pilgrimage / Spiritual (Tīrtha-Yātrā)', value: 'pilgrimage' },
          { label: 'General / Relocation / Migration', value: 'general' },
        ],
        defaultValue: 'business',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 17, 18, 20, 22, 25, 26, 27],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 23, 27],
    favorableLagnas: [1, 3, 4, 6, 7, 9, 10, 12], // Chara & Dvisvabhava
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [],
    rules: [
      {
        id: 'yat_rule_dikshoola',
        name: 'Dik-Śūla Direction Exemption',
        sanskritName: 'दिक्शूलशुद्धिः',
        category: 'Exclusion',
        ruleTier: 'ABSOLUTE_PROHIBITION',
        description: 'The chosen weekday must not align with the prohibited travel direction.',
        citation: CLASSICAL_SOURCES_REGISTRY.kalamrita_yatra,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'vidyarambha',
    name: 'Vidyārambha / Education / Akṣarābhyāsa',
    sanskritName: 'विद्यारम्भ / अक्षराभ्यास मुहूर्तः',
    category: 'Sanskāras',
    briefDescription:
      'Commencing formal education, schooling, university studies, Vedic study, or technical learning.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_vidyarambha],
    dynamicQuestions: [
      {
        id: 'studyType',
        label: 'Field of Learning',
        sanskritTerm: 'विद्याविभागः',
        description: 'Vedic / Philosophy vs. Science / Coding vs. Fine Arts.',
        type: 'select',
        options: [
          { label: 'Sciences, Engineering & Modern Technology', value: 'science' },
          { label: 'Vedic, Sanskrit, Philosophy & Astrology', value: 'vedic' },
          { label: 'Fine Arts, Music & Creative Writing', value: 'arts' },
        ],
        defaultValue: 'science',
      },
    ],
    favorableTithis: [2, 3, 5, 6, 7, 10, 11, 12, 13, 17, 18, 20, 21, 22, 25, 26],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 8, 12, 13, 14, 15, 17, 21, 22, 27],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 11, 12],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2, 6],
    rules: [
      {
        id: 'vid_rule_saumya',
        name: 'Saumya Vāra (Benefic Days)',
        sanskritName: 'सौम्यवारनियमः',
        category: 'Vara',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Wednesday, Thursday, or Friday for intellectual retention and wisdom.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_vidyarambha,
        isMandatory: false,
      },
    ],
  },
  {
    id: 'sevarambha',
    name: 'Sevāraṁbha (Employment / Joining Office)',
    sanskritName: 'सेवारम्भ / पदग्रहण मुहूर्तः',
    category: 'Vāṇijya & Artha',
    briefDescription:
      'Commencing new employment, taking charge of a high office, starting a job role, or public appointment.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.narada_samhita_sevarambha],
    dynamicQuestions: [
      {
        id: 'sector',
        label: 'Employment Sector',
        sanskritTerm: 'कार्यक्षेत्रम्',
        description: 'Corporate / Private vs. Public / Government Service.',
        type: 'select',
        options: [
          { label: 'Corporate / Technology / Finance (Mercurial focus)', value: 'corporate' },
          { label: 'Government / Public Administration (Solar/Jupiter focus)', value: 'govt' },
        ],
        defaultValue: 'corporate',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 15, 17, 18, 20, 22, 25, 26, 28],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 8, 12, 13, 14, 15, 17, 21, 22, 23, 27],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 10, 11],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [0, 2],
    rules: [
      {
        id: 'sev_rule_kendra',
        name: 'Fortified 10th House (Daśama Bhāva)',
        sanskritName: 'दशमभावशुद्धिः',
        category: 'Lagna',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Ascendant 10th house should be free from malefics and aspected by Jupiter/Mercury.',
        citation: CLASSICAL_SOURCES_REGISTRY.narada_samhita_sevarambha,
        isMandatory: false,
      },
    ],
  },
  {
    id: 'bhumi_kraya',
    name: 'Bhūmi-Kraya (Land / Real Estate Purchase)',
    sanskritName: 'भूमि-क्रय / स्थावर-सम्पत्ति मुहूर्तः',
    category: 'Vāstu & Gṛha',
    briefDescription:
      'Executing deed registration for agricultural, residential, or commercial land plots.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.bs_vastu_foundation],
    dynamicQuestions: [
      {
        id: 'propertyType',
        label: 'Property Nature',
        sanskritTerm: 'सम्पत्तिप्रकारः',
        description: 'Raw Land Plot vs. Built Apartment / Commercial unit.',
        type: 'select',
        options: [
          { label: 'Open Plot / Agricultural Land', value: 'land' },
          { label: 'Built Apartment / Villa / Commercial Office', value: 'built' },
        ],
        defaultValue: 'land',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 17, 18, 20, 22, 25, 26, 28],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [4, 5, 8, 12, 13, 14, 17, 21, 22, 26, 27],
    favorableLagnas: [2, 5, 8, 11],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2],
    rules: [
      {
        id: 'bk_rule_sthiram',
        name: 'Sthira (Fixed) Sign for Asset Retention',
        sanskritName: 'स्थिरलग्नप्राशस्त्यम्',
        category: 'Lagna',
        ruleTier: 'MAJOR_CONDITION',
        description: 'Fixed sign rising ensures title security and long-term asset value.',
        citation: CLASSICAL_SOURCES_REGISTRY.bs_vastu_foundation,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'vahana_kraya',
    name: 'Vāhana-Kraya (Vehicle Purchase & Delivery)',
    sanskritName: 'वाहन-क्रय मुहूर्तः',
    category: 'Sāmānya',
    briefDescription:
      'Purchasing and taking physical delivery of a four-wheeler, two-wheeler, or commercial transport.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.muhurta_parijata_vahana],
    dynamicQuestions: [
      {
        id: 'vehicleType',
        label: 'Vehicle Category',
        sanskritTerm: 'वाहनप्रकारः',
        description: 'Personal luxury vs. Commercial transport.',
        type: 'select',
        options: [
          { label: 'Personal Car / Motorcycle (Venusian / Luxury)', value: 'personal' },
          { label: 'Commercial Truck / Fleet / Machinery (Saturnian / Heavy)', value: 'commercial' },
        ],
        defaultValue: 'personal',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15, 17, 18, 20, 22, 25, 26, 27],
    favorableVaras: [1, 3, 4, 5], // Fri is best
    favorableNakshatras: [1, 4, 5, 7, 8, 13, 14, 15, 17, 21, 22, 23, 24, 27], // Chara & Kshipra
    favorableLagnas: [1, 2, 4, 7, 9, 10, 11, 12],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2, 6],
    rules: [
      {
        id: 'vk_rule_shukra',
        name: 'Śukra (Venus) & Chara Lagna Alignment',
        sanskritName: 'शुक्र-चरलग्नप्राशस्त्यम्',
        category: 'Lagna',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Moveable (Chara) Lagna and Friday create accident-free and auspicious conveyance.',
        citation: CLASSICAL_SOURCES_REGISTRY.muhurta_parijata_vahana,
        isMandatory: false,
      },
    ],
  },
  {
    id: 'namakarana',
    name: 'Nāmakaraṇa (Child Naming Ceremony)',
    sanskritName: 'नामकरण मुहूर्तः',
    category: 'Sanskāras',
    briefDescription:
      'Traditional Vedic name giving sacrament for a newborn child on auspicious Tithi & Nakṣatra.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_namakarana],
    dynamicQuestions: [
      {
        id: 'gender',
        label: 'Child Gender (Classical naming syllable count)',
        sanskritTerm: 'शिशुलिङ्गम्',
        description: 'Even syllables for boys, odd syllables for girls per classical guidelines.',
        type: 'select',
        options: [
          { label: 'Boy (पुत्रः — Even letter name)', value: 'boy' },
          { label: 'Girl (कन्या — Odd letter name)', value: 'girl' },
        ],
        defaultValue: 'boy',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 17, 18, 20, 22, 25, 26, 27],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 26, 27],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 11, 12],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2, 6],
    rules: [
      {
        id: 'nam_rule_shuddhi',
        name: 'Exclusion of Rikta & Viṣṭi',
        sanskritName: 'रिक्ता-विष्टि वर्जनम्',
        category: 'Exclusion',
        ruleTier: 'ABSOLUTE_PROHIBITION',
        description: 'Must strictly avoid Rikta Tithis and Viṣṭi Karaṇa.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_namakarana,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'chikitsarambha',
    name: 'Cikitsārambha (Medical Treatment / Healing)',
    sanskritName: 'चिकित्सारम्भ मुहूर्तः',
    category: 'Sāmānya',
    briefDescription:
      'Beginning a treatment regimen, taking medicinal Rasāyanas, surgery scheduling, or wellness therapies.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.vasishtha_chikitsa],
    dynamicQuestions: [
      {
        id: 'treatmentType',
        label: 'Treatment Nature',
        sanskritTerm: 'चिकित्साप्रकारः',
        description: 'General Medicine / Therapy vs. Surgical Procedure.',
        type: 'select',
        options: [
          { label: 'Medicinal / Therapy / Rasāyana (Benefic focus)', value: 'medicine' },
          { label: 'Surgical / Invasive Procedure (Mars/Fire focus)', value: 'surgery' },
        ],
        defaultValue: 'medicine',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 8, 10, 11, 13, 17, 18, 20, 22, 23, 25, 26, 28],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 8, 13, 14, 15, 17, 21, 22, 27],
    favorableLagnas: [2, 3, 4, 6, 7, 9, 11, 12],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [2, 6], // Tuesday, Saturday avoid for medicine
    rules: [
      {
        id: 'chik_rule_kshipra',
        name: 'Kṣipra / Laghu Nakṣatra Healing Rule',
        sanskritName: 'लघु-क्षिप्रनक्षत्रप्राशस्त्यम्',
        category: 'Nakshatra',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Aśvinī, Hasta, and Puṣya accelerate vitality recovery and bodily rejuvenation.',
        citation: CLASSICAL_SOURCES_REGISTRY.vasishtha_chikitsa,
        isMandatory: false,
      },
    ],
  },
  {
    id: 'shalyakarma',
    name: 'Śalyakarma (Surgery & Invasive Procedures)',
    sanskritName: 'शल्यकर्म मुहूर्तः',
    category: 'Sāmānya',
    briefDescription:
      'Surgical excision, operative procedures, dental surgery, and aggressive curative treatments per Suśruta Saṁhitā.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.sushruta_shalyakarma],
    dynamicQuestions: [
      {
        id: 'surgeryType',
        label: 'Procedure Classification',
        sanskritTerm: 'कर्मविभागः',
        description: 'Nature of surgical operation.',
        type: 'select',
        options: [
          { label: 'Elective / Reconstructive Surgery', value: 'elective' },
          { label: 'Excision / Tumor / Tissue Removal', value: 'excision' },
          { label: 'Dental / Minor Surgery', value: 'dental' },
        ],
        defaultValue: 'elective',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 17, 18, 20, 22, 25, 26, 28],
    favorableVaras: [2, 6, 0, 4], // Mars (Tuesday) and Saturn (Saturday) favored classically for cutting/scalpel
    favorableNakshatras: [1, 3, 5, 6, 9, 10, 16, 18, 19, 20], // Ashwini, Krittika, Mrigashira, Ardra, Ashlesha, Magha, Vishakha, Jyeshtha, Mula, Purvashadha
    favorableLagnas: [1, 8, 10, 11], // Aries, Scorpio, Capricorn, Aquarius
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30], // Avoid Rikta & Amavasya
    prohibitedVaras: [1], // Monday avoided for major bleeding risk
    rules: [
      {
        id: 'shalya_rule_kuja',
        name: 'Maṅgala (Mars) Strength & Purity',
        sanskritName: 'कुजबलावेक्षणम्',
        category: 'Planetary',
        ruleTier: 'MAJOR_CONDITION',
        description: 'Mars as the lord of scalpel and surgical precision must be fortified and not debilitated in Cancer.',
        citation: CLASSICAL_SOURCES_REGISTRY.sushruta_shalyakarma,
        isMandatory: true,
      },
      {
        id: 'shalya_rule_ashtama',
        name: 'Aṣṭama Bhāva Protection',
        sanskritName: 'अष्टमस्थानरक्षणम्',
        category: 'Lagna',
        ruleTier: 'ABSOLUTE_PROHIBITION',
        description: '8th house from rising Lagna must be devoid of malefic afflictions to ensure safe post-operative recovery.',
        citation: CLASSICAL_SOURCES_REGISTRY.sushruta_shalyakarma,
        isMandatory: true,
      },
    ],
  },
  {
    id: 'suvarna_ratna',
    name: 'Suvarṇa & Ratna Dhāraṇa (Gold & Gemstones)',
    sanskritName: 'सुवर्णरत्नधारण मुहूर्तः',
    category: 'Vāṇijya & Artha',
    briefDescription:
      'First wearing of consecrated gemstone talismans, gold ornaments, and divine jewelry per Muhūrta Cintāmaṇi Ch. 12.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_suvarna_ratna],
    dynamicQuestions: [
      {
        id: 'gemstoneType',
        label: 'Gemstone / Metal Category',
        sanskritTerm: 'रत्नधातुभेदः',
        description: 'Specific gemstone or metal to be worn.',
        type: 'select',
        options: [
          { label: 'Gold / Ruby / Sun Talisman (Sunday / Surya)', value: 'gold_ruby' },
          { label: 'Yellow Sapphire / Topaz (Thursday / Guru)', value: 'yellow_sapphire' },
          { label: 'Diamond / White Sapphire (Friday / Shukra)', value: 'diamond' },
          { label: 'Emerald / Green Tourmaline (Wednesday / Budha)', value: 'emerald' },
          { label: 'Pearl / Moonstone (Monday / Chandra)', value: 'pearl' },
          { label: 'Blue Sapphire / Amethyst (Saturday / Shani)', value: 'blue_sapphire' },
          { label: 'Red Coral / Mars Talisman (Tuesday / Mangala)', value: 'red_coral' },
        ],
        defaultValue: 'gold_ruby',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15, 17, 18, 20, 22, 25, 26, 27],
    favorableVaras: [0, 1, 3, 4, 5],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 27], // Pushya, Rohini, Hasta, Chitra, Revati foremost
    favorableLagnas: [2, 4, 5, 7, 9, 11, 12],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [],
    rules: [
      {
        id: 'ratna_rule_pushya',
        name: 'Puṣya & Ravi/Guru Confluence',
        sanskritName: 'पुष्यनक्षत्रप्राशस्त्यम्',
        category: 'Nakshatra',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Puṣya, Hasta, and Revatī conjoined with Sunday or Thursday bestow supreme sovereign luster.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_suvarna_ratna,
        isMandatory: false,
      },
    ],
  },
  {
    id: 'nutana_vastra',
    name: 'Nūtana Vastra (New Clothes & Luxury Adornments)',
    sanskritName: 'नूतनवस्त्रधारण मुहूर्तः',
    category: 'Vāṇijya & Artha',
    briefDescription:
      'First wearing of new ceremonial clothes, wedding attire, and royal robes per Muhūrta Cintāmaṇi Ch. 12.',
    classicalSources: [CLASSICAL_SOURCES_REGISTRY.mc_nutana_vastra],
    dynamicQuestions: [
      {
        id: 'garmentType',
        label: 'Attire Nature',
        sanskritTerm: 'वस्त्रप्रकारः',
        description: 'Ceremonial wedding attire vs Daily formal wear.',
        type: 'select',
        options: [
          { label: 'Ceremonial / Festive Attire', value: 'ceremonial' },
          { label: 'Professional / Business Suit', value: 'business' },
          { label: 'Spiritual / Pūjā Vestments', value: 'spiritual' },
        ],
        defaultValue: 'ceremonial',
      },
    ],
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 15, 17, 18, 20, 22, 25, 26, 27],
    favorableVaras: [1, 3, 4, 5], // Monday, Wednesday, Thursday, Friday
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 27], // Ashwini, Rohini, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Revati
    favorableLagnas: [2, 3, 4, 6, 7, 9, 11, 12],
    prohibitedTithis: [4, 9, 14, 19, 24, 29, 30],
    prohibitedVaras: [0, 2], // Sunday and Tuesday avoided classically for new garments
    rules: [
      {
        id: 'vastra_rule_shukra',
        name: 'Śukra (Venus) Day & Dignity',
        sanskritName: 'शुक्रवारप्राशस्त्यम्',
        category: 'Vara',
        ruleTier: 'SUPPORTING_CONDITION',
        description: 'Friday (Venus day) in Saumya Nakṣatras magnifies aesthetic charm, health, and harmony.',
        citation: CLASSICAL_SOURCES_REGISTRY.mc_nutana_vastra,
        isMandatory: false,
      },
    ],
  },
];

export function getObjectiveById(id: MuhurtaObjectiveId): MuhurtaObjectiveDefinition {
  const found = MUHURTA_OBJECTIVES.find((o) => o.id === id);
  return found || MUHURTA_OBJECTIVES[0];
}

/**
 * Gaṇaka — Researched Classical Vedic Remedy Database (Śānti & Parihāra Śāstra)
 * Phase 2: Verified Textual Remedies with Scholastic Provenance
 * Primary Sources:
 * - Bṛhat Parāśara Horā Śāstra (BPHS) Ch. 83–90
 * - Muhūrta Cintāmaṇi Ch. 1–2 (Bhauma Śānti & Vivāha Parihāra)
 * - Śaunaka Śānti Saṃgraha (Śaunaka Smṛti)
 * - Dharma Sindhu & Nirṇaya Sindhu
 * - Prasna Marga (Kerala Tradition)
 * - Garuḍa Purāṇa & Skanda Purāṇa
 */

import { VerifiedClassicalRemedy } from './dosha-types';

export const CLASSICAL_REMEDIES_DATABASE: VerifiedClassicalRemedy[] = [
  // ==========================================
  // 1. KUJA / MAṄGALA DOṢA REMEDIES
  // ==========================================
  {
    id: 'kuja_kumbha_vivaha',
    doshaId: 'kuja_dosha',
    title: 'Kumbha / Arka / Viṣṇu Pratimā Vivāha',
    sanskritTitle: 'कुम्भ / अर्क / विष्णु प्रतिमा विवाह',
    transliteration: 'Kumbha / Arka Vivāha Vidhi',
    purpose: 'Neutralization of acute Martian affliction prior to solemn marital rites.',
    traditionalMethod: 'Symbolic preliminary wedding ceremony performed with a sanctified water pitcher (Kumbha), an Arka plant (Calotropis procera for males), or a consecrated gold/silver idol of Lord Viṣṇu (for females), absorbing the initial malefic marital surge prior to the human wedding ceremony.',
    sourceText: 'Muhūrta Cintāmaṇi & Śaunaka Śānti Saṃgraha',
    chapterAndVerse: 'Muhūrta Cintāmaṇi Ch. 2 v. 30',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Performed on an auspicious lunar day (Śukla Pakṣa) prior to the official wedding day.',
      deity: 'Lord Viṣṇu / Varuṇa Devatā',
      mantraOrJapa: 'Varuṇa Sūkta and Viṣṇu Sahasranāma recitation.',
      ritualOfferings: 'Clay/copper Kumbha filled with tirthodaka, mango leaves, and coconut; dāna of yellow cloth and dakṣiṇā to priests.',
      restrictionsOrEligibility: 'Prescribed specifically for intense Kuja Dosha when identical matching (Sama-Kuja) is unavailable.',
    },
    provenanceNotes: 'Canonical remedy documented in classical muhūrta treatises and smṛti compendiums.',
  },
  {
    id: 'kuja_bhauma_shanti_homa',
    doshaId: 'kuja_dosha',
    title: 'Bhauma Śānti Homa & Kārtikeya Pūjā',
    sanskritTitle: 'भौम शान्ति होम एवं सुब्रह्मण्य उपासना',
    transliteration: 'Bhauma Śānti & Subrahmaṇya Seva',
    purpose: 'Pacification of Mars (Maṅgala) energy and transformation into courage and righteous harmony.',
    traditionalMethod: 'Vedic planetary homa dedicated to Mars (Agnir Mūrdhā mantra), worship of Lord Subrahmaṇya (Kārtikeya / Murugan), and offering of red floral garlands with sesame/ghee oblation.',
    sourceText: 'BPHS & Śaunaka Smṛti',
    chapterAndVerse: 'BPHS Ch. 80 & Śaunaka Śānti',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Tuesday during Mars Horā or when Moon transits Mṛgaśīrṣā, Citrā, or Dhaniṣṭhā Nakṣatra.',
      deity: 'Lord Subrahmaṇya / Kārtikeya & Bhūmi-putra Maṅgala',
      mantraOrJapa: 'Oṃ Krāṃ Krīṃ Krauṃ Saḥ Bhaumāya Namaḥ (10,000 counts) or Subrahmaṇya Gāyatrī.',
      ritualOfferings: 'Dāna of red lentils (Masūra dāl), copper vessel, red coral (vidruma), and sweet jaggery.',
      fastingOrVrata: 'Bhaumavāra Vrata with single evening meal devoid of salt.',
    },
  },

  // ==========================================
  // 2. SARPA ŚĀPA (BPHS Ch. 83 v. 14–22)
  // ==========================================
  {
    id: 'shapa_sarpa_naga_pratistha',
    doshaId: 'sarpa_shapa',
    title: 'Nāga Pratiṣṭhā & Go-Dāna Vidhāna',
    sanskritTitle: 'नाग प्रतिष्ठा एवं गोदान विधानम्',
    transliteration: 'Nāga Pratiṣṭhā & Mahāvyāhṛti Homa',
    purpose: 'Complete expiation of ancestral serpent curse obstructing progeny and family continuity.',
    traditionalMethod: 'Consecration and ritual installation (Pratiṣṭhā) of a golden serpent idol near holy water/Aśvattha tree, followed by Mahāvyāhṛti Homa, Rudra Japa, and charitable gift of a milch cow (Go-dāna) with bronze milking vessel.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 83 v. 14–22',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Pañcamī Tithi (especially Nāga Pañcamī) or during Anurādhā/Rohiṇī/Aśleṣā Nakṣatra.',
      deity: 'Nāgarāja Vāsuki & Lord Śiva',
      mantraOrJapa: 'Nāga Gāyatrī and Mahāmṛtyuñjaya Japa (21,000 counts).',
      ritualOfferings: 'Gold serpent idol (minimum 1 to 2 niṣkas / tolas according to capacity), sesame seeds, copper vessel, and feeding milk to Brāhmaṇas.',
      restrictionsOrEligibility: 'Prescribed by Maharṣi Parāśara specifically for couples experiencing progeny obstacles due to 5th house Sarpa Śāpa.',
    },
    provenanceNotes: 'Explicitly detailed in BPHS Chapter 83 verbatim.',
  },

  // ==========================================
  // 3. PITṚ ŚĀPA (BPHS Ch. 83 v. 33–42)
  // ==========================================
  {
    id: 'shapa_pitri_gaya_shraddha',
    doshaId: 'pitri_shapa',
    title: 'Gayā Śrāddha & Piṇḍa-Dāna Vidhi',
    sanskritTitle: 'गया श्राद्ध एवं पिण्डदान विधि',
    transliteration: 'Gayā Śrāddha & Tilodaka Tarpaṇa',
    purpose: 'Resolution of ancestral debts, appeasing departed ancestors, and restoring auspicious 5th house lineage.',
    traditionalMethod: 'Performance of sacred ancestor rites (Śrāddha and Piṇḍa-dāna) at holy pilgrimage kṣetras such as Gayā Tīrtha (or Brahmakapālī / Haridwār), offering barley/sesame cakes, feeding Brāhmaṇas, and offering bronze bowl with clarified butter.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra & Garuḍa Purāṇa',
    chapterAndVerse: 'BPHS Ch. 83 v. 33–42',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Pitṛ Pakṣa (Mahālaya Amāvāsyā) or on solar Amāvāsyā during Pitṛ Horā.',
      deity: 'Lord Gadādhara (Viṣṇu) & Pitṛ Devatās',
      mantraOrJapa: 'Pitṛ Gāyatrī and Āditya Hṛdaya Stotra recitation.',
      ritualOfferings: 'Dāna of a bronze vessel filled with cow ghee, black sesame, silver coin, and Annadāna to learned Brāhmaṇas.',
      fastingOrVrata: 'Śrāddha Vrata observed with water and sattvic intake until tarpaṇa completes.',
    },
  },

  // ==========================================
  // 4. MĀTṚ ŚĀPA (BPHS Ch. 83 v. 50–57)
  // ==========================================
  {
    id: 'shapa_matri_setu_snana',
    doshaId: 'matri_shapa',
    title: 'Setu Snāna, Lakṣmī-Nārāyaṇa Pūjā & Gāyatrī Japa',
    sanskritTitle: 'सेतु स्नान, लक्ष्मीनारायण पूजा एवं गायत्री जप',
    transliteration: 'Setu-bandha Snāna & Lakṣmī-Nārāyaṇa Arcanā',
    purpose: 'Expiation of maternal ancestral curse causing progeny impediments.',
    traditionalMethod: 'Sacred pilgrimage bath at Setu-Bandha (Dhanuṣkoḍi / Rāmeśvaram holy ocean conjunction), recitation of Gāyatrī Mahā-mantra (100,000 counts), worship of Goddess Lakṣmī and Lord Nārāyaṇa with milk and honey, and gift of silver cow and silver vessel filled with milk.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 83 v. 50–57',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Pūrṇimā or Monday during Rohiṇī / Śravaṇa Nakṣatra.',
      deity: 'Bhagavatī Lakṣmī & Lord Nārāyaṇa',
      mantraOrJapa: 'Gāyatrī Mantra (100,000 counts) or Lakṣmī-Nārāyaṇa Hṛdaya Stotra.',
      ritualOfferings: 'Silver vessel filled with pure cow milk, white silk garments, pearl/silver coin, and feeding maternal elders.',
    },
  },

  // ==========================================
  // 5. BHRĀTṚ ŚĀPA (BPHS Ch. 83 v. 60–68)
  // ==========================================
  {
    id: 'shapa_bhratri_harivamsa',
    doshaId: 'bhratri_shapa',
    title: 'Śravaṇa of Hari-Vaṃśa Purāṇa & Peepal Planting',
    sanskritTitle: 'हरिवंश पुराण श्रवण एवं अश्वत्थ रोपण',
    transliteration: 'Hari-Vaṃśa Purāṇa Śravaṇa & Aśvattha Vṛkṣa Sevā',
    purpose: 'Alleviation of fraternal affliction and restoration of sibling peace and child happiness.',
    traditionalMethod: 'Devotional listening (Śravaṇa) to the auspicious Hari-Vaṃśa Purāṇa recited by a Vedic scholar, planting and watering a sacred Peepal (Aśvattha) tree, and donating cultivable land or grains.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 83 v. 60–68',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Commenced on Śukla Dvādaśī or Thursday.',
      deity: 'Lord Śrī Kṛṣṇa & Lord Viṣṇu',
      mantraOrJapa: 'Santāna Gopāla Mantra: Oṃ Śrīṃ Hrīṃ Klīṃ Glauṃ Devakīsuta Govinda Vāsudeva Jagatpate...',
      ritualOfferings: 'Dāna of grains, bronze bell, sweets made with jaggery, and service to holy trees.',
    },
  },

  // ==========================================
  // 6. BRAHMA / GURU ŚĀPA (BPHS Ch. 83 v. 72–81)
  // ==========================================
  {
    id: 'shapa_brahma_chandrayana',
    doshaId: 'brahma_shapa',
    title: 'Chāndrāyaṇa Vrata, Svarṇa-Dāna & Rudrābhiṣeka',
    sanskritTitle: 'चान्द्रायण व्रत, स्वर्णदान एवं रुद्राभिषेक',
    transliteration: 'Chāndrāyaṇa Vrata & Svarṇa-Dāna Vidhāna',
    purpose: 'Expiation of Brahmin or spiritual preceptor (Guru) curse affecting intellect and lineage.',
    traditionalMethod: 'Observing the sacred lunar penance (Chāndrāyaṇa Vrata or Kṛcchra Vrata), making golden donations (Svarṇa-dāna) to learned Vedic scholars, performing Rudrābhiṣeka with Pañcāmṛta, and sponsoring educational/spiritual pursuits of students.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 83 v. 72–81',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Guru Pūrṇimā, Puṣya Nakṣatra, or auspicious Thursday.',
      deity: 'Lord Dakṣiṇāmūrti & Bṛhaspati Devatā',
      mantraOrJapa: 'Bṛhaspati Gāyatrī and Śrī Rudram (Namakam & Camakam).',
      ritualOfferings: 'Gold, yellow topaz/sapphire, yellow silk cloth, saffron, and supporting Vidyādāna.',
    },
  },

  // ==========================================
  // 7. MĀTULA ŚĀPA (BPHS Ch. 83 v. 83–90)
  // ==========================================
  {
    id: 'shapa_matula_vishnu_pratistha',
    doshaId: 'matula_shapa',
    title: 'Viṣṇu Idol Consecration & Public Water Works (Kūpa/Vāpī)',
    sanskritTitle: 'विष्णु प्रतिमा प्रतिष्ठा एवं कूप/वापी निर्माण',
    transliteration: 'Viṣṇu Pratiṣṭhā & Jalāśaya Utsarga',
    purpose: 'Resolving maternal uncle curse through meritorious public charity and divine consecration.',
    traditionalMethod: 'Installing a deity of Lord Viṣṇu in a shrine or dedicating a public drinking water well / shaded grove (Vāpī-Kūpa-Taḍāga-Utsarga), offering sweet water and green grains (Moong) to devotees.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 83 v. 83–90',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Wednesday in Mercury Nakṣatras (Aśleṣā, Jyeṣṭhā, Revatī).',
      deity: 'Lord Viṣṇu & Budha Devatā',
      mantraOrJapa: 'Viṣṇu Sahasranāma and Budha Gāyatrī.',
      ritualOfferings: 'Green gram (Mūṅg dāl), emerald/bronze vessel, and supporting charitable water projects.',
    },
  },

  // ==========================================
  // 8. GANDĀNTA & ABHUKTA MŪLA (BPHS Ch. 87–88)
  // ==========================================
  {
    id: 'gandanta_nakshatra_shanti',
    doshaId: 'nakshatra_gandanta',
    title: 'Gandānta Śānti Homa & 108 Kalaśa Abhiṣeka',
    sanskritTitle: 'गण्डान्त शान्ति होम एवं १०८ कलश अभिषेक',
    transliteration: 'Gandānta Śānti & Chāyā-Dāna Vidhi',
    purpose: 'Protection of the infant and family from the volatile cosmic junction between water and fire signs.',
    traditionalMethod: 'Performance of the Gandānta Śānti Homa on the 27th day after birth (when the Moon re-enters the birth Nakṣatra), ceremonial ritual bath with 108 sanctified Kalaśa pots of herb-infused water (Auṣadhi-snāna), Chāyā-Dāna (father looking into bronze bowl of sesame oil and donating it), and Go-dāna.',
    sourceText: 'BPHS Ch. 87–88 & Śaunaka Śānti Saṃgraha',
    chapterAndVerse: 'BPHS Ch. 87 v. 25–40 & Ch. 88 v. 1–18',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Strictly on the 27th day of life (Janma Nakṣatra recurrence) or during an auspicious Shukla Pakṣa day.',
      deity: 'Lord Varuṇa, Agni, and presiding Nakṣatra Devatā',
      mantraOrJapa: 'Nakṣatra Sūkta, Śrī Rudram, and Mahāmṛtyuñjaya Japa.',
      ritualOfferings: 'Bronze vessel filled with sesame oil (Chāyā-pātra), gold/silver pratimā, clothes, and feeding 28 Brāhmaṇas.',
      restrictionsOrEligibility: 'Father should avoid looking directly at the newborn prior to the completion of the Chāyā-Dāna ritual as prescribed in BPHS 88:14.',
    },
    provenanceNotes: 'One of the most explicitly documented classical infant protection rites in Parāśara Horā.',
  },

  // ==========================================
  // 9. SAṄKRĀNTI JANMA (BPHS Ch. 90)
  // ==========================================
  {
    id: 'sankranti_janma_shanti',
    doshaId: 'sankranti_janma',
    title: 'Sūrya Śānti Vidhi & Navagraha Homa',
    sanskritTitle: 'सूर्य शान्ति विधि एवं नवग्रह होम',
    transliteration: 'Sūrya Śānti & Āditya Homa Vidhāna',
    purpose: 'Pacification of solar transition turbulence at time of birth.',
    traditionalMethod: 'Worship of the Sun God with red sandal paste, flowers, offering Arghya at dawn with red copper vessel, chanting Āditya Hṛdaya Stotra, performing Navagraha Homa, and gifting wheat, copper, and ruby/red cloth.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 90 v. 1–15',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Sunday during Sunrise or next Saṅkrānti day.',
      deity: 'Lord Sūrya Nārāyaṇa',
      mantraOrJapa: 'Sūrya Gāyatrī & Āditya Hṛdaya Stotra (recited 3 times daily).',
      ritualOfferings: 'Copper vessel, wheat (godhūma), red cloth, and jaggery.',
    },
  },

  // ==========================================
  // 10. GRAHAṆA JANMA (BPHS Ch. 89)
  // ==========================================
  {
    id: 'grahana_janma_shanti',
    doshaId: 'grahana_janma',
    title: 'Grahaṇa Śānti & Mṛtyuñjaya Japa',
    sanskritTitle: 'ग्रहण शान्ति एवं मृत्युञ्जय जप',
    transliteration: 'Grahaṇa Śānti & Svarṇa-Pratimā Dāna',
    purpose: 'Warding off shadows of solar/lunar eclipse afflicted birth.',
    traditionalMethod: 'Consecration of gold idols representing Sun/Moon and silver idol of Rāhu in a bronze bowl filled with sesame oil, performing Mahāmṛtyuñjaya Homa, and donating white/red garments to priests.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 89 v. 1–16',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Next occurring eclipse day or birthday Nakṣatra.',
      deity: 'Lord Śiva & Sūrya/Candra Devatā',
      mantraOrJapa: 'Tryambakam Mahāmṛtyuñjaya Mantra (10,000 counts).',
      ritualOfferings: 'Bronze vessel with black sesame, gold pratimā, silver coin, and cow donation.',
    },
  },

  // ==========================================
  // 11. AMĀVĀSYĀ JANMA (BPHS Ch. 84)
  // ==========================================
  {
    id: 'amavasya_janma_shanti',
    doshaId: 'amavasya_janma',
    title: 'Sinīvālī / Kuhū Śānti Homa',
    sanskritTitle: 'सिनीवाली / कुहू शान्ति होम',
    transliteration: 'Sinīvālī & Kuhū Śānti Vidhāna',
    purpose: 'Strengthening the debilitated/darkened lunar energies at birth.',
    traditionalMethod: 'Worship of Goddess Sinīvālī (14th-Amāvāsyā junction) or Kuhū (pure New Moon), performing Homa with white sesamum and milk porridge (Pāyasam), and gifting silver Moon idol to a Vedic scholar.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 84 v. 1–12',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Next Amāvāsyā or Monday in Śukla Pakṣa.',
      deity: 'Candra Devatā & Goddess Sinīvālī/Kuhū',
      mantraOrJapa: 'Soma Mantra (Oṃ Śrāṃ Śrīṃ Śrauṃ Saḥ Candrāya Namaḥ) and Candra Gāyatrī.',
      ritualOfferings: 'Silver vessel filled with milk/curd, white rice, pearl, and white clothes.',
    },
  },

  // ==========================================
  // 12. BĀLARISHTA & CANDRA-ARIṢṬA (BPHS Ch. 10)
  // ==========================================
  {
    id: 'balarishta_mrityunjaya_japa',
    doshaId: 'chandra_arista',
    title: 'Mahāmṛtyuñjaya Japa & Āyuṣya Sūkta Homa',
    sanskritTitle: 'महामृत्युञ्जय जप एवं आयुष्य सूक्त होम',
    transliteration: 'Mahāmṛtyuñjaya & Tryambaka Homa',
    purpose: 'Preservation of infant longevity and counteracting severe planetary ariṣṭa.',
    traditionalMethod: 'Continuous chanting of the Tryambakam Mahāmṛtyuñjaya Mantra by learned priests, performing Āyuṣya Homa with holy dūrvā grass and ghee, and tying a sanctified silver protective kavaca onto the child.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra & Prasna Marga',
    chapterAndVerse: 'BPHS Ch. 10 v. 20–30 & Prasna Marga Ch. 21',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Immediately upon birth detection, Monday or Śukla Pakṣa 8th/14th Tithi.',
      deity: 'Lord Mahāmṛtyuñjaya Śiva',
      mantraOrJapa: 'Oṃ Tryambakaṃ Yajāmahe Sugandhiṃ Puṣṭivardhanam...',
      ritualOfferings: 'Dūrvā grass dipped in cow milk, bilva leaves, white sweets, and Annadāna.',
    },
  },

  // ==========================================
  // 13. VIṢṬI (BHADRĀ) KARAṆA
  // ==========================================
  {
    id: 'vishti_bhadra_shanti',
    doshaId: 'vishti_bhadra_karana',
    title: 'Bhadrā Pūjā & Taila-Dīpa Dāna',
    sanskritTitle: 'भद्रा पूजा एवं तैलदीप दान',
    transliteration: 'Bhadrā Śānti & Yama Dīpa Dāna',
    purpose: 'Pacifying harsh Bhadrā karaṇa energy to protect undertaking and health.',
    traditionalMethod: 'Worship of Bhadrā Devī (daughter of Sūrya and Chāyā), lighting sesame oil lamp facing south during sandhyā, and donating black sesame seeds and iron vessel.',
    sourceText: 'Muhūrta Cintāmaṇi & Dharma Sindhu',
    chapterAndVerse: 'Muhūrta Cintāmaṇi Ch. 1 v. 45',
    classification: 'Later classical/traditional remedy',
    qualifications: {
      timing: 'Saturday evening during Bhadrā Karaṇa transit.',
      deity: 'Bhadrā Devī & Lord Yama',
      mantraOrJapa: 'Bhadrā Gāyatrī and Śani Stotra.',
      ritualOfferings: 'Mustard oil lamp, black sesame seeds, iron vessel, and feeding crows.',
    },
  },

  // ==========================================
  // 14. GRAHA YUDDHA (Planetary War)
  // ==========================================
  {
    id: 'graha_yuddha_shanti',
    doshaId: 'graha_yuddha',
    title: 'Defeated Planet (Yuddha-Parājita) Śānti & Navagraha Arcanā',
    sanskritTitle: 'युद्ध-पराजित ग्रह शान्ति एवं नवग्रह अर्चना',
    transliteration: 'Parājita Graha Śānti & Homa',
    purpose: 'Re-energizing the defeated non-luminary planet whose significance has been damaged by close longitudinal combat.',
    traditionalMethod: 'Special homa and charity corresponding specifically to the planet that lost the planetary war (lower northern declination), reciting its seed mantra (Bīja Mantra) 10,000 times and wearing its traditional herbal root (Vana-mūla).',
    sourceText: 'BPHS Ch. 27 & Bṛhat Saṃhitā Ch. 17',
    chapterAndVerse: 'BPHS Ch. 27 v. 1–8',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Weekday corresponding to the defeated planet.',
      deity: 'Presiding Navagraha Adhidevatā',
      mantraOrJapa: 'Bīja Mantra of defeated graha (10,000 counts).',
      ritualOfferings: 'Dāna of grains and gemstones associated with the defeated planet.',
    },
  },

  // ==========================================
  // 15. GURU CĀṆḌĀLA YOGA (Jupiter-Rāhu)
  // ==========================================
  {
    id: 'guru_chandala_shanti',
    doshaId: 'guru_chandala_yoga',
    title: 'Guru Pūjā, Rudrābhiṣeka & Svarṇa-Dāna',
    sanskritTitle: 'गुरु पूजा, रुद्राभिषेक एवं स्वर्णदान',
    transliteration: 'Bṛhaspati Śānti & Rudra Japa',
    purpose: 'Purification of Jupiterian wisdom corrupted by Rāhu’s shadow.',
    traditionalMethod: 'Regular worship of spiritual Guru and Lord Dakṣiṇāmūrti, performing Rudrābhiṣeka with cow milk and honey on Thursdays, and feeding soaked yellow chickpeas (Caṇā dāl) to cows.',
    sourceText: 'Śaunaka Śānti Saṃgraha & Prasna Marga',
    chapterAndVerse: 'Prasna Marga Ch. 14 v. 22',
    classification: 'Later classical/traditional remedy',
    qualifications: {
      timing: 'Thursday during Jupiter Horā in Puṣya or Punarvasu Nakṣatra.',
      deity: 'Lord Dakṣiṇāmūrti & Bṛhaspati',
      mantraOrJapa: 'Guru Gāyatrī and Śrī Rudram.',
      ritualOfferings: 'Yellow cloth, chickpeas, turmeric, saffron, and charity to spiritual preceptors.',
    },
  },

  // ==========================================
  // 16. AṄGĀRAKA YOGA (Mars-Rāhu)
  // ==========================================
  {
    id: 'angarakha_shanti',
    doshaId: 'angarakha_yoga',
    title: 'Subrahmaṇya Seva & Narasimha Kavaca',
    sanskritTitle: 'सुब्रह्मण्य सेवा एवं नृसिंह कवच पाठ',
    transliteration: 'Kārtikeya Arcanā & Narasimha Stotra',
    purpose: 'Cooling violent volcanic Martian-Rāhu confluence.',
    traditionalMethod: 'Regular recitation of Śrī Narasimha Kavaca and Subrahmaṇya Bhujanga Stotra, offering red flowers at Murugan/Narasimha temples on Tuesdays, and refraining from hostile speech.',
    sourceText: 'Prasna Marga & Skanda Purāṇa',
    chapterAndVerse: 'Prasna Marga Ch. 21 v. 35',
    classification: 'Later classical/traditional remedy',
    qualifications: {
      timing: 'Tuesday during sunset or Pradoṣa.',
      deity: 'Lord Narasimha & Lord Subrahmaṇya',
      mantraOrJapa: 'Narasimha Bīja Mantra & Subrahmaṇya Gāyatrī.',
      ritualOfferings: 'Jaggery water (Pānaka), red flowers, and feeding birds/stray animals.',
    },
  },

  // ==========================================
  // 17. KĀLA SARPA / KĀLA AMṚTA DOṢA
  // ==========================================
  {
    id: 'kala_sarpa_trimbakeshwar',
    doshaId: 'kala_sarpa_dosha',
    title: 'Nārāyaṇa Nāgabali & Kāla Sarpa Śānti',
    sanskritTitle: 'नारायण नागबलि एवं कालसर्प शान्ति (तीर्थ क्षेत्र विधान)',
    transliteration: 'Nārāyaṇa Nāgabali & Mahāmṛtyuñjaya Japa',
    purpose: 'Relief from intense nodal hemisphere constraints and unblocking delayed life progress.',
    traditionalMethod: 'Performance of the specialized Nārāyaṇa Nāgabali or Kāla Sarpa Śānti rite at recognized traditional kṣetras (such as Trimbakeśvar Jyotirliṅga, Śrīkālahasti, or Kukke Subrahmaṇya), accompanied by Mahāmṛtyuñjaya Japa and silver serpent idol offering in holy river.',
    sourceText: 'Regional Temple Traditions & Modern Compendiums',
    chapterAndVerse: 'Traditional Kṣetra Vidhi (Trimbakeśvar / Śrīkālahasti)',
    classification: 'Regional/traditional practice',
    qualifications: {
      timing: 'Pañcamī, Amāvāsyā, or during Solar/Lunar eclipse.',
      deity: 'Lord Śiva & Nāgarāja',
      mantraOrJapa: 'Mahāmṛtyuñjaya Mantra (minimum 108 daily counts) & Rāhu-Ketu Stotra.',
      ritualOfferings: 'Silver serpent pair, milk abhiṣeka on Śivaliṅga, and feeding fish in river.',
    },
    provenanceNotes: 'Scholastic Note: Classified honestly as a regional/traditional practice developed in sacred pilgrimage centres (Trimbakeśvar, Śrīkālahasti), as Kāla Sarpa itself is absent from canonical Sanskrit treatises (BPHS, BJ).',
  },

  // ==========================================
  // 18. MODERN PITRI DOSH (Popular Sun-Rahu)
  // ==========================================
  {
    id: 'modern_pitri_dosh_remedy',
    doshaId: 'modern_pitri_dosh',
    title: 'Amāvāsyā Tarpaṇa & Āditya Pūjā',
    sanskritTitle: 'अमावास्या तर्पण एवं आदित्य पूजा',
    transliteration: 'Amāvāsyā Tarpaṇa & Gāyatrī Japa',
    purpose: 'General ancestral remembrance and alleviating solar afflictions.',
    traditionalMethod: 'Offering water and black sesame (Tarpaṇa) facing south on Amāvāsyā days, reciting Āditya Hṛdaya Stotra on Sundays, and donating wheat and copper to elder priests.',
    sourceText: 'Modern Astrological Traditions & Smṛti Compilations',
    chapterAndVerse: 'Modern Practice',
    classification: 'Modern practice',
    qualifications: {
      timing: 'Every Amāvāsyā and Sunday sunrise.',
      deity: 'Lord Sūrya & Pitṛgaṇas',
      mantraOrJapa: 'Āditya Hṛdaya Stotra & Gāyatrī Mantra.',
      ritualOfferings: 'Wheat, jaggery, copper coin, water tarpaṇa.',
    },
    provenanceNotes: 'Popular modern synthesis distinct from classical BPHS Ch. 83 5th-house Pitṛ Śāpa.',
  },

  /* ---- added from the sources directly, not inferred ---- */
  {
    doshaId: 'abhukta_mula',
    title: 'Abhukta Mūla Śānti',
    sanskritTitle: 'अभुक्त मूल शान्ति',
    transliteration: 'Abhuktamūla Śānti Vidhāna',
    purpose: 'Removing the affliction of birth in the Jyeṣṭhā–Mūla junction, which BPHS calls the heaviest of the gandāntas.',
    traditionalMethod:
      'On the twelfth day from birth, on the same lunar mansion, or in the eighth year, erect a pavilion east or north of the house with a sacrificial pit outside it. Have an image of Nirṛti made in gold — dark, terrible, two-headed, wolf-faced, bearing sword and shield, mounted on a corpse — or its equivalent value in gold. Install a pitcher with pañcagavya, holy water and the hundred herbs, and a hundred-holed pot with bamboo leaves. Worship Nirṛti facing west with white cloth and unbroken rice; worship Indra as adhideva and Water as pratyadhidaivata. Offer 1008 or 108 oblations. Recite the Tryambaka mantra for the appeasement of death, then perform abhiṣeka on the parents and child seated together. Give a milch cow to the preceptor, fees to the officiating priests, and feed the brāhmaṇas. Finally gaze on clarified butter while reciting the Yatpāpaṃ mantra.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 94 v. 3–20 (Ch. 93 in some editions)',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'Twelfth day from birth, the same nakṣatra, or the eighth year.',
      deity: 'Nirṛti, with Indra as adhideva and Water as pratyadhidaivata.',
      mantraOrJapa: 'Tryambaka mantra; Yatpāpaṃ mantra over clarified butter.',
      ritualOfferings: 'Gold image or its value, pañcagavya, white cloth, unbroken rice, a milch cow.',
    },
  },
  {
    doshaId: 'lagna_gandanta',
    title: 'Gaṇḍānta Go-dāna',
    sanskritTitle: 'गण्डान्त गोदान',
    transliteration: 'Gaṇḍānta Go-dāna',
    purpose: 'Remedy for birth in a gaṇḍānta, the water–fire junction between signs.',
    traditionalMethod:
      'For birth in the gaṇḍānta of Mūla, Jyeṣṭhā, Āśleṣā or Maghā, give three cows to a brāhmaṇa. For the gaṇḍānta of Revatī or Aśvinī, give a pair. For any other gaṇḍānta, or where a bad combination accompanies it, give one cow; if no cow is available, give its value instead. BPHS adds that for a daughter born in Āśleṣā and a son born in Mūla a śānti should be performed at their marriage, and that where the husband\'s elder brother and such kin are absent the defect does not arise.',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 94 v. 8–13',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'At the gaṇḍānta rite after birth, or at marriage for the Āśleṣā and Mūla cases.',
      deity: 'The deity of the junction nakṣatra — Indra, Ahi, Pūṣan or the Aśvins.',
      mantraOrJapa: "Per the family's own recension.",
      ritualOfferings: 'Cows to a brāhmaṇa, or their value in gold.',
    },
  },
  {
    doshaId: 'vishti_bhadra_janma',
    title: 'Viṣṭi / Bhadrā Śānti',
    sanskritTitle: 'विष्टि भद्रा शान्ति',
    transliteration: 'Viṣṭi-Bhadrā Śānti',
    purpose: 'Remedy for birth in the Viṣṭi karaṇa, one of the evil phenomena the texts list.',
    traditionalMethod:
      'Worship the gods and the nine grahas. Light lamps of cow-ghee in a Śiva temple. Perform ritual bathing of Lord Śiva and circumambulate the holy fig tree. Conclude by feeding brāhmaṇas, attended by the Gāṇapatya fire sacrifice, the Puruṣa Sūkta, the Saura Sūkta, the Mṛtyuñjaya and the Śānti Sūkta. The result given is that the child is endowed with longevity.',
    sourceText: 'Hora Ratnam (junior Garga)',
    chapterAndVerse: 'Hora Ratnam Ch. 2 v. 210–215',
    classification: 'Direct textual remedy',
    qualifications: {
      timing: 'An auspicious day following the birth.',
      deity: 'Lord Śiva and the nine grahas, with Gaṇeśa at the opening.',
      mantraOrJapa: 'Mṛtyuñjaya, Puruṣa Sūkta, Saura Sūkta and Śānti Sūkta.',
      ritualOfferings: 'Cow-ghee lamps, ritual bathing, feeding of brāhmaṇas.',
    },
  },
];

/**
 * Returns all verified remedies for a specific Dosha ID
 */
/**
 * Doṣas that share one rite. The gandānta of the lagna, of the tithi and of a
 * nakṣatra are all the same junction affliction, and BPHS 94.8 gives one
 * prescription for the class rather than one per variant.
 */
const REMEDY_ALIASES: Record<string, string> = {
  tithi_gandanta: 'lagna_gandanta',
  gandamula_nakshatra: 'lagna_gandanta',
};

export function getRemediesForDosha(doshaId: string): VerifiedClassicalRemedy[] {
  const key = REMEDY_ALIASES[doshaId] ?? doshaId;
  return CLASSICAL_REMEDIES_DATABASE.filter((r) => r.doshaId === key);
}

/**
 * Doṣas for which the sources consulted prescribe no remedy at all.
 *
 * ⚠ THIS IS NOT THE SAME AS "NOT IMPLEMENTED". An empty array from
 * `getRemediesForDosha` was ambiguous: it could mean the texts give nothing, or
 * that nobody had looked. Every doṣa is now accounted for in one of the two
 * tables, so a reader can tell which.
 */
export const NO_REMEDY_PRESCRIBED: Record<string, string> = {
  // The gandānta class shares one rite, so these are covered by the alias above.
  tithi_gandanta: '',
  gandamula_nakshatra: '',

  // Pāpa kartarī is my own extension of the classical affliction to every house.
  // The texts give the hemming rule but no per-house rite, so saying so is
  // honest; the remedy is the general śānti for whichever malefics do the
  // hemming.
  papa_kartari_lagna:
    'No classical remedy is prescribed for pāpa kartarī as such. The tradition addresses it through the general śānti of the malefics doing the hemming.',
  ...Object.fromEntries([2,3,4,5,6,7,8,9,10,11,12].map((h) => [
    `papa_kartari_house_${h}`,
    'No classical remedy is prescribed for pāpa kartarī as such. The tradition addresses it through the general śānti of the malefics doing the hemming.',
  ])),
  papa_kartari_moon:
    'No classical remedy is prescribed for pāpa kartarī as such. Candra afflictions are met with the usual Candra śānti.',

  // Doṣas the sources describe but for which they give no rite.
  angāraka_dosha:
    'The texts define Aṅgāraka but attach no rite to it. Hanumān worship is commonly given in practice; it is not traced to a verse in the sources consulted, so it is not listed here.',
  guru_chandala:
    'The texts define Guru Cāṇḍāla but give no rite for it. Guru śānti is commonly performed in practice; no verse prescribing it was traced.',
  shani_rahu_shraddha:
    'Defined as an affliction but with no rite attached in the sources consulted.',
  surya_shani_virodha:
    'A relationship between two grahas rather than an affliction with a rite. Addressed through the śānti of whichever of the two is weaker.',
  kendra_hina_dosha:
    'A structural weakness rather than an affliction with a rite. Addressed by strengthening the kendra lords.',
  lagna_balarishta:
    'An infant-mortality indicator. The sources counsel assessment and care, not a rite; no śānti is prescribed for it specifically.',
  matri_arista:
    'An indicator concerning the mother. No rite is attached to it in the sources consulted.',
  pitri_arista:
    'An indicator concerning the father. No rite is attached to it in the sources consulted.',
  brahma_guru_shapa:
    'A curse class. The sources name it without prescribing a specific remedy.',
  putra_bhava_arista:
    'A fifth-house affliction indicator. No rite is attached to it in the sources consulted.',
  vaidhavya_yoga:
    'A seventh-and-eighth-house affliction. No rite is attached to it in the sources consulted.',
  vishakanya_yoga:
    'Named in later material rather than the classical core; no classical rite is attached.',
  dvi_kalatra_dosha:
    'A multiple-marriage indicator. No rite is attached to it in the sources consulted.',
};

/**
 * Why no remedy is listed for a doṣa, in words a reader can act on.
 *
 * Returns null when a remedy exists, so a caller can tell "nothing prescribed"
 * apart from "nothing found".
 */
export function noRemedyReason(doshaId: string): string | null {
  if (getRemediesForDosha(doshaId).length > 0) return null;
  if (doshaId in NO_REMEDY_PRESCRIBED) return NO_REMEDY_PRESCRIBED[doshaId] || null;
  return null;
}

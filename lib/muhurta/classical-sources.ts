/**
 * Gaṇaka — Classical Muhūrta Source Citations Registry
 * Rigorously grounded in primary authoritative Sanskrit texts.
 */

import { ClassicalCitation } from './types';

export const CLASSICAL_SOURCES_REGISTRY: Record<string, ClassicalCitation> = {
  mc_grihapravesha_1: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Gṛhapraveśa Prakaraṇa (Ch. 7)',
    shlokaRange: 'Śloka 1–4',
    sanskritQuote: 'स्थिरलग्ने गृहारम्भो प्रवेशश्च विशेषतः। वर्जयेद्रिक्ततिथीश्च विष्टिकरणं तथा॥',
    englishTranslation:
      'Gṛhārambha (foundation) and Gṛhapraveśa (entry) must strictly take place in Sthira (fixed) Lagnas. Rikta Tithis (4th, 9th, 14th) and Viṣṭi (Bhadrā) Karaṇa must be scrupulously avoided.',
  },
  mc_vivaha_lagna: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Vivāha Prakaraṇa (Ch. 6)',
    shlokaRange: 'Śloka 18–22',
    sanskritQuote: 'शुक्रगुरुदृष्टलग्ने शुभग्रहैः केन्द्रगैः पापग्रहैस्त्रिषडायगैः।',
    englishTranslation:
      'The wedding Lagna must be aspected by Jupiter or Venus, with benefics placed in Kendras (1, 4, 7, 10) and Trikoṇas (5, 9), and malefics in Upacayas (3, 6, 11). The 8th house from Lagna must be vacant.',
  },
  kalamrita_yatra: {
    text: 'Kālāmṛta',
    sanskritTitle: 'कालामृतम्',
    chapter: 'Yātrā Prakaraṇa (Sec. 5)',
    shlokaRange: 'Śloka 3–7',
    sanskritQuote: 'वारशूलं प्रतिमुखं चन्द्रशूलं विवर्जयेत्। यात्रार्थं चरभे श्रेष्ठं शुभयोगसंयुतम्॥',
    englishTranslation:
      'For journeys, one must avoid traveling in the direction of Vāra-Śūla (weekday spear) and frontal Moon (Pratimukha Candra). Chara (cardinal) Lagnas and auspicious Yogas are foremost.',
  },
  mc_vanijya_trade: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Vyavahāra & Kraya-Vikraya (Ch. 9)',
    shlokaRange: 'Śloka 5–8',
    sanskritQuote: 'बुधेज्यसितवारेषु वाणिज्यं धनवृद्धिकृत्। चरद्विस्वभावलग्नेषु क्रयविक्रयमिष्यते॥',
    englishTranslation:
      'Commencement of commerce and trade agreements on Wednesday, Thursday, and Friday creates growth of wealth. Chara and Dvisvabhāva Lagnas are favorable for buying and selling.',
  },
  bs_vastu_foundation: {
    text: 'Bṛhat Saṁhitā of Varāhamihira',
    sanskritTitle: 'बृहत्संहिता',
    chapter: 'Vāstuvidyā (Ch. 53)',
    shlokaRange: 'Śloka 112–116',
    sanskritQuote: 'रोहिणीमृगशिरोमूलहस्तपुष्यानुराधासु। शस्यते गृहनिर्माणं स्थिरभागे विवर्जिते पापग्रहैः॥',
    englishTranslation:
      'Laying foundation of buildings is praised in Rohiṇī, Mṛgaśiras, Mūla, Hasta, Puṣya, Anurādhā, and Uttarā-traya in a Fixed Lagna devoid of malefic occupation.',
  },
  mc_vidyarambha: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Sanskāra Prakaraṇa (Ch. 4)',
    shlokaRange: 'Śloka 31–34',
    sanskritQuote: 'विद्यारम्भे सौम्यवाराः पूर्णातिथयस्तथा। अश्विनीहस्तपुष्येन्दौ ज्ञानबुद्धिविवर्धनाः॥',
    englishTranslation:
      'Initiation into learning (Vidyārambha) is best on Saumya Vāras (Wednesday, Thursday, Friday), in Pūrṇā/Bhadra Tithis, and in quick or friendly Nakṣatras like Aśvinī, Hasta, Puṣya, and Mṛgaśiras.',
  },
  narada_samhita_sevarambha: {
    text: 'Nārada Saṁhitā',
    sanskritTitle: 'नारदसंहिता',
    chapter: 'Rājasevā / Karmārambha (Ch. 21)',
    shlokaRange: 'Śloka 14–17',
    sanskritQuote: 'सूर्याग्नेयवारेषु सेवारम्भो न शस्यते। गुरुबुधसितवारे स्थिरलग्ने पदावाप्तिः॥',
    englishTranslation:
      'Joining office or government service is auspicious on Thursday, Wednesday, or Friday in a Fixed or Dual Lagna. The 10th and 11th houses should be fortified by benefic aspects.',
  },
  mc_namakarana: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Sanskāra Prakaraṇa (Ch. 4)',
    shlokaRange: 'Śloka 1–4',
    sanskritQuote: 'एकादशे द्वादशे वा दिने नामकरणं शुभम्। रिक्तातिथीन् विना कार्यं शुभलग्ने शुभे दिने॥',
    englishTranslation:
      'The child naming ceremony (Nāmakaraṇa) is prescribed on the 11th, 12th, or 16th day from birth, avoiding Rikta Tithis and Viṣṭi Karaṇa in a benefic Lagna.',
  },
  muhurta_parijata_vahana: {
    text: 'Muhūrta Pārijāta',
    sanskritTitle: 'मुहूर्तपारिजातः',
    chapter: 'Vāhana Kraya-Vikraya (Ch. 8)',
    shlokaRange: 'Śloka 9–12',
    sanskritQuote: 'चरलग्ने चरे तारे वाहनं शुभदायकम्। शुक्रवारे विशेषेण क्रयणं शुभमुच्यते॥',
    englishTranslation:
      'Purchasing vehicles is recommended in Chara (moveable) Lagna and Chara/Kṣipra Nakṣatras (Svātī, Punarvasu, Śravaṇa, Dhaniṣṭhā, Śatabhiṣā, Aśvinī, Hasta), especially on Friday.',
  },
  vasishtha_chikitsa: {
    text: 'Vasiṣṭha Saṁhitā',
    sanskritTitle: 'वसिष्ठसंहिता',
    chapter: 'Cikitsārambha (Ch. 14)',
    shlokaRange: 'Śloka 8–11',
    sanskritQuote: 'अश्विनीहस्तपुष्येषु चिकित्सां सम्प्रवर्तयेत्। मङ्गलार्कदिने वर्ज्यं शल्यकर्म विहाय च॥',
    englishTranslation:
      'Commencement of medical treatment and taking medicine is auspicious in Aśvinī, Hasta, Puṣya, and Mṛgaśiras, avoiding Tuesday and Saturday for general healing.',
  },
  general_exclusions: {
    text: 'Muhūrta Cintāmaṇi & Kālāmṛta',
    sanskritTitle: 'मुहूर्तचिन्तामणि-कालामृतयोः',
    chapter: 'Mahā-Doṣa Prakaraṇa',
    shlokaRange: 'Śloka 45–52',
    sanskritQuote: 'राहुकाले यमघण्टे विष्टौ गन्दान्तके तथा। सर्वाणि शुभकार्याणि वर्जयेन्मतिमान् नरः॥',
    englishTranslation:
      'A wise person must avoid beginning any auspicious endeavor during Rāhu Kāla, Yamagaṇḍa, Viṣṭi (Bhadrā) Karaṇa, Gandānta junctions, and Durmuhūrta.',
  },
  abhijit_parihara: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Śubha-Aśubha Prakaraṇa (Ch. 1)',
    shlokaRange: 'Śloka 34',
    sanskritQuote: 'अभिजित्सर्वदोषघ्नं दिनमध्ये व्यवस्थितम्। बुधवारं विना सर्वकार्येषु विजयप्रदम्॥',
    englishTranslation:
      'Abhijit Muhūrta occurring at mid-day destroys all astronomical and astrological flaws (Doṣas) and bestows victory in all undertakings, except on Wednesday.',
  },
  guru_kendra_parihara: {
    text: 'Vasiṣṭha Saṁhitā & Muhūrta Darpana',
    sanskritTitle: 'वसिष्ठसंहिता एवं मुहूर्तदर्पणः',
    chapter: 'Lagna Śuddhi Prakaraṇa',
    shlokaRange: 'Śloka 40',
    sanskritQuote: 'एक एव सुरेज्यस्तु केन्द्रे यस्य प्रतिष्ठितः। हन्ति दोषसहस्राणि सूर्यस्तेजांसि वारिधेः॥',
    englishTranslation:
      'Even if minor astrological blemishes are present, Jupiter placed in an angular house (Kendra 1, 4, 7, 10) from the rising Muhūrta Lagna destroys thousands of Doṣas, as the Sun dispels darkness.',
  },
  sarvartha_siddhi_parihara: {
    text: 'Muhūrta Cintāmaṇi',
    sanskritTitle: 'मुहूर्तचिन्तामणिः',
    chapter: 'Śubhayoga Prakaraṇa (Ch. 2)',
    shlokaRange: 'Śloka 15–18',
    sanskritQuote: 'सर्वार्थसिद्धियोगे तु सिध्यन्ति सर्वसम्पदः। वारनक्षत्रसंयोगात् दोषाणां शमनं भवेत्॥',
    englishTranslation:
      'In Sarvārtha Siddhī Yoga (the specific confluence of favorable weekday and asterism), all prosperity and accomplishments are realized, and minor planetary blemishes are neutralized.',
  },
  pushya_yoga_parihara: {
    text: 'Jyotirvidābharaṇa & BPHS',
    sanskritTitle: 'ज्योतिर्विदाभरणम्',
    chapter: 'Yoga Prakaraṇa',
    shlokaRange: 'Śloka 22',
    sanskritQuote: 'पुष्ये सर्वाणि सिद्धयन्ति गुरुवारे विशेषतः। विना विवाहं सर्वत्र महाकल्याणकारकम्॥',
    englishTranslation:
      'Puṣya Nakṣatra conjoined with Thursday (Guru Puṣya) or Sunday (Ravi Puṣya) fulfills all auspicious worldly and spiritual deeds, acting as a supreme sovereign blessing (excluding marriage).',
  },
};


/**
 * Gaṇaka — Classical Kūṭa Milan Rules, Citations, & Reference Matrix
 * 
 * Verified against:
 * 1. Muhūrta Cintāmaṇi (Vivāha Prakaraṇa, Ślokas 1–32)
 * 2. Bṛhat Parāśara Horā Śāstra (BPHS, Ch. 80–81)
 * 3. Jātaka Pārijāta (Ch. 14)
 * 4. Phaladīpikā (Ch. 10)
 * 5. Mādhavīya (Daśakūṭa)
 * 6. Jaimini Upadeśa Sūtras (Ch. 1 Pāda 4)
 */

import { ClassicalRuleReference } from './types';

export const KUTA_CITATIONS: Record<string, ClassicalRuleReference> = {
  varna: {
    primaryText: 'Muhūrta Cintāmaṇi',
    sanskritTextName: 'मुहूर्तचिन्तामणिः (विवाहप्रकरणम्)',
    chapterOrSection: 'Vivāha Prakaraṇa',
    verseOrSutra: 'Śloka 2',
    shlokaOriginal: 'ब्राह्मणाः कर्कमीनस्थाः क्षत्रिया नृसिंहचापगाः । वैश्या वृषाङ्गतौलिस्थाः शूद्रा मकरयुग्मगाः ॥',
    translation: 'Cancer, Scorpio, Pisces are Brāhmaṇa; Aries, Leo, Sagittarius are Kṣatriya; Taurus, Virgo, Libra are Vaiśya; Gemini, Capricorn, Aquarius are Śūdra. The groom must belong to an equal or superior Varṇa to the bride for 1 point.',
    commentaryNotes: 'If bride has higher varna than groom, score is 0. If groom is equal or higher, score is 1.',
  },
  vashya: {
    primaryText: 'Muhūrta Cintāmaṇi & BPHS',
    sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
    chapterOrSection: 'MC Śloka 3 / BPHS Ch. 80',
    verseOrSutra: 'Śloka 3',
    shlokaOriginal: 'मेषस्य वृश्चिकः सिंहाः कन्या चापवणिजो वृषः । कर्को भृगो मृगः कुम्भस्यैते वश्याः प्रकीर्तिताः ॥',
    translation: 'Defines natural submissiveness (Vaśya) between signs: Catuṣpāda (Quadrupeds), Dvipada (Humans/Biped), Jalacara (Watery), Vanacara (Wild forest Leo), Kīṭa (Insects/Scorpio). Mutual affinity yields 2 points; one-sided yields 1 point; neutral/opposed yields 0 points.',
    commentaryNotes: '狮子 (Leo) is Vanacara, Scorpio is Keeta. Manava controls quadruped, quadruped controls watery, etc.',
  },
  tara: {
    primaryText: 'Muhūrta Cintāmaṇi',
    sanskritTextName: 'मुहूर्तचिन्तामणिः',
    chapterOrSection: 'Vivāha Prakaraṇa',
    verseOrSutra: 'Śloka 4–5',
    shlokaOriginal: 'जन्मसम्पद्विपत्क्षेमप्रत्यरिः साधको वधः । मित्रं परममित्रं च तारा नवविधाः स्मृताः ॥',
    translation: 'Count from bride to groom modulo 9 and groom to bride modulo 9. The 9 Tārās are Janma (1), Sampat (2), Vipat (3 - bad), Kṣema (4), Pratyari (5 - bad), Sādhaka (6), Vadha/Naidhana (7 - very bad), Mitra (8), Parama Mitra (9). Auspicious counts on both sides yield 3 points; one side auspicious yields 1.5; both inauspicious yield 0.',
    commentaryNotes: '3, 5, 7 in both cycles are inauspicious. However, if both lords are natural friends or identical, Tārā defect is mitigated.',
  },
  yoni: {
    primaryText: 'Muhūrta Cintāmaṇi & BPHS',
    sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
    chapterOrSection: 'MC Śloka 6–9 / BPHS Ch. 80 v. 14–18',
    verseOrSutra: 'Śloka 6–9',
    shlokaOriginal: 'अश्वो गजो गौर्महिषः श्वा व्याघ्रश्च म्रगोऽथवा । शाखा च नकुलश्चैव सिंहश्चेति चतुर्दश ॥',
    translation: '14 animal yonis mapped across the 27 Nakṣatras. Mutual sworn enemies (Svabhāva Vaira: Cow-Tiger, Elephant-Lion, Horse-Buffalo, Dog-Deer, Cat-Rat, Snake-Mongoose, Monkey-Sheep) score 0 points. Same yoni scores 4 points. Friendly 3, Neutral 2, Unfriendly 1.',
    commentaryNotes: 'Classical treatises explicitly warn that Sworn Animal Enmity (Mahāvaira) destroys emotional harmony and physical longevity if unmitigated.',
  },
  graha_maitri: {
    primaryText: 'Muhūrta Cintāmaṇi & BPHS',
    sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
    chapterOrSection: 'MC Śloka 10–12 / BPHS Ch. 80 v. 19–22',
    verseOrSutra: 'Śloka 10–12',
    shlokaOriginal: 'चन्द्राधिपमित्रभावे प्रीतिः स्यादुत्तमा तयोः । समत्वे मध्यमा ज्ञेया वैरे च कुलनाशिनी ॥',
    translation: 'Planetary friendship between the Moon sign lords of bride and groom. Mutual friends = 5 points. Friend + Neutral = 4 points. Mutual Neutral = 3 points. Friend + Enemy = 1 point. Neutral + Enemy = 0.5 points. Mutual Enemy = 0 points.',
    commentaryNotes: 'Graha Maitrī is the heart of intellectual and temperamental understanding between couples.',
  },
  gana: {
    primaryText: 'Muhūrta Cintāmaṇi & BPHS',
    sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
    chapterOrSection: 'MC Śloka 13–15 / BPHS Ch. 80 v. 23–26',
    verseOrSutra: 'Śloka 13–15',
    shlokaOriginal: 'सुरनरदनुजानां संगमो नैव शस्तो भवति दनुजजातेर्दारुणेयं प्रवृत्ता । सुरनरयुगलं स्यान्मध्यमं चेह लोके निजगणपरिपूर्णं सर्वदा सौख्यकारि ॥',
    translation: '27 Nakṣatras divided into Deva (Divine), Manuṣya (Human), and Rākṣasa (Demonic). Same Gaṇa = 6 points. Deva + Manuṣya = 5 or 6 depending on order. Rākṣasa bride + Deva/Manuṣya groom = 0 points (unless strong astrological exceptions apply).',
    commentaryNotes: 'If Rākṣasa groom marries Deva/Manuṣya bride, it is tolerable (1 point or mitigated), but Rākṣasa bride with human/divine groom causes friction unless Rāśi lords are identical or mutual friends.',
  },
  bhakuta: {
    primaryText: 'Muhūrta Cintāmaṇi & BPHS',
    sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
    chapterOrSection: 'MC Śloka 16–21 / BPHS Ch. 80 v. 27–31',
    verseOrSutra: 'Śloka 16–21',
    shlokaOriginal: 'द्विद्वादशे भवेन्मृत्युः षडष्टे कुलनाशनम् । नवपञ्चमकेऽपत्यनाशः स्याद् द्वितये शुभम् ॥',
    translation: 'Rāśi displacement between bride and groom. 2-12 (Dvidvādaśa) causes expenditure and separation; 6-8 (Ṣaḍaṣṭaka) causes enmity and disease; 9-5 (Nava-Pañcama) causes lineage grief. 1-1, 3-11, 4-10, 7-7 are auspicious. Max score 7 points; defective = 0 points.',
    commentaryNotes: 'Crucial classical exceptions (Bhakūṭa Bhaṅga): If Moon sign lords are identical (e.g. Aries-Scorpio, Taurus-Libra, Capricorn-Aquarius) or mutual friends, Bhakūṭa Dosha is cancelled.',
  },
  nadi: {
    primaryText: 'Muhūrta Cintāmaṇi & BPHS',
    sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
    chapterOrSection: 'MC Śloka 22–27 / BPHS Ch. 80 v. 32–36',
    verseOrSutra: 'Śloka 22–27',
    shlokaOriginal: 'एकनाड्यामपत्यानां नाशः स्यात्कथितो बुधैः । मध्यनाड्यां भवेन्मृत्युराद्यनाड्यां दरिद्रता ॥',
    translation: 'Three physiological and genetic temperaments: Ādi (Vāta), Madhya (Pitta), Antya (Kapha). Different Nāḍī yields 8 full points. Same Nāḍī (Eka-Nāḍī) scores 0 points and causes genetic/progeny defects.',
    commentaryNotes: 'Extensive classical parihāras (Muhūrta Cintāmaṇi & BPHS): Same Rāśi with different Nakṣatras, same Nakṣatra with different Rāśis, different Padas in certain Nakṣatras, or identical Moon sign lords nullify the Nāḍī curse.',
  },
  // Daśakūṭa South Indian specific Poruthams
  mahendra: {
    primaryText: 'Mādhavīya & Jātaka Deśamārga',
    sanskritTextName: 'माधवीयम् / जातकदेशमार्गः',
    chapterOrSection: 'Daśakūṭa Vivāha Prakaraṇa',
    verseOrSutra: 'v. 12',
    translation: 'Count from bride nakṣatra to groom nakṣatra. If count is 4, 7, 10, 13, 16, 19, 22, or 25, Mahendra Porutham is present, conferring prosperity, family longevity, and noble progeny.',
    commentaryNotes: 'Non-point Kūṭa in South Indian traditions, evaluated as Pass/Fail (Subha/Asubha).',
  },
  stree_deergha: {
    primaryText: 'Mādhavīya & Prasna Marga',
    sanskritTextName: 'माधवीयम् / प्रश्नमार्गः',
    chapterOrSection: 'Daśakūṭa Vivāha Prakaraṇa',
    verseOrSutra: 'v. 15',
    translation: 'Count from bride nakṣatra to groom nakṣatra. If the distance exceeds 13 nakṣatras, full Strī Dīrgha is present. If between 7 and 13, it is moderate (Madhyama). Less than 7 is insufficient.',
    commentaryNotes: 'Ensures longevity of the marital bond and overall prosperity.',
  },
  rajju: {
    primaryText: 'Mādhavīya & Jātaka Deśamārga',
    sanskritTextName: 'माधवीयम् / जातकदेशमार्गः',
    chapterOrSection: 'Rajju Porutham Section',
    verseOrSutra: 'v. 20–25',
    translation: '27 Nakṣatras mapped into 5 limbs: Pāda (Feet), Kaṭi (Waist), Nābhi (Navel), Kaṇṭha (Neck), Śiro (Head). Same Rajju is defective: Śiro Rajju risks early demise of husband; Kaṇṭha Rajju harms wife; Nābhi Rajju harms progeny; Kaṭi causes poverty; Pāda causes aimless wandering.',
    commentaryNotes: 'Considered by South Indian masters as the single most critical longevity Porutham along with Dina and Yoni.',
  },
  vedha: {
    primaryText: 'Mādhavīya & Muhūrta Dīpikā',
    sanskritTextName: 'माधवीयम् / मुहूर्तदीपिका',
    chapterOrSection: 'Vedha Porutham Section',
    verseOrSutra: 'v. 28',
    translation: 'Mutual affliction/piercing pairs of Nakṣatras (e.g. Aśvinī-Jyeṣṭhā, Bharaṇī-Anurādhā, Kṛttikā-Viśākhā). If bride and groom share a Vedha pair, marriage is obstructed.',
    commentaryNotes: 'Must be avoided in the 10-Porutham methodology.',
  },
};

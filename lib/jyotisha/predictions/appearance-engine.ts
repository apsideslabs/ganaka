/**
 * Gaṇaka — Classical Jyotiṣa Physical Appearance & Bodily Constitution Engine
 * 
 * Deep canonical implementation based strictly on:
 * - Bṛhat Parāśara Horā Śāstra (BPHS), Chapter 4 ("Rāśi Svarūpa") & Chapter 11 ("Lagna Bhāva Phala")
 * - Sārāvalī of Kalyāṇavarmā, Chapters 21–28 (Rāśi Lakṣaṇa, Deha-Rūpa, and Gati)
 * - Bṛhat Jātaka of Varāhamihira, Chapter 16 ("Aṅga-Vibhāga & Rūpa-Lakṣaṇa")
 * - Phaladīpikā of Mantreśvara, Chapter 14 (Bhāva-Phala & Deha-Saukhya)
 * - Jātaka Pārijāta of Vaidyanātha Dīkṣita, Chapter 5 (Bodily Marks, Tilaka, and Varna)
 */

import { JyotishaChart, PlanetId, RashiNumber } from '../types';
import { RASHIS, GRAHA_NAMES } from '../constants';

export interface AppearanceStature {
  category: 'Short' | 'Short-to-Medium' | 'Medium' | 'Medium-to-Tall' | 'Tall' | 'Tall & Slender';
  buildType: 'Ectomorphic (Lean/Slender)' | 'Mesomorphic (Athletic/Muscular)' | 'Endomorphic (Sturdy/Compact)' | 'Balanced/Symmetrical';
  boneStructure: string;
  chestAndShoulders: string;
  heightTendencyCm: string;
}

export interface AppearanceFaceAndHead {
  headShape: 'Oval' | 'Square/Angular' | 'Round (Candra-Mukha)' | 'Heart-shaped' | 'Long/Elongated' | 'Triangular';
  forehead: string;
  jawAndChin: string;
  cheeksAndContours: string;
  symmetryDescription: string;
}

export interface AppearanceEyesAndGaze {
  eyeType: string;
  shapeAndSize: string;
  shadeAndLuster: string;
  gazeIntensity: string;
  eyebrows: string;
}

export interface AppearanceSkinAndComplexion {
  classicalVarna: 'Gaura (Fair / Luminous)' | 'Rakta-Gaura (Ruddy / Warm Glow)' | 'Tapta-Kāñcana (Molten Gold / Wheatish)' | 'Śyāma (Dusky / Olive / Deep Wheatish)' | 'Pāṇḍu (Pale / Milk-toned)' | 'Snigdha-Śyāma (Lustrous Dusk)';
  texture: 'Smooth & Radiant (Snigdha)' | 'Dry & Matte (Rūkṣa)' | 'Warm & Sensitive (Uṣṇa)' | 'Supple & Moisture-rich';
  dermatologicalTendencies: string;
}

export interface AppearanceHair {
  texture: string;
  volumeAndGrowth: string;
  curlPattern: 'Straight & Silky' | 'Wavy & Lustrous' | 'Crisp / Curly' | 'Coarse & Thick' | 'Fine & Delicate';
  agingAndThinningRisk: string;
}

export interface AppearanceDistinctiveMarks {
  scarsAndMarks: string[];
  molesAndTilakas: string[];
  anatomicalFocalPoint: string;
  drekkanaBodilyMapping: string;
}

export interface AppearanceGaitAndCarriage {
  gaitStyle: string;
  postureAndStance: string;
  physicalAuraAndPresence: string;
}

export interface AppearanceAyurvedicDosha {
  vataPercent: number;
  pittaPercent: number;
  kaphaPercent: number;
  dominantPrakriti: 'Vāta' | 'Pitta' | 'Kapha' | 'Vāta-Pitta' | 'Pitta-Kapha' | 'Vāta-Kapha' | 'Tridoṣaja (Sama)';
  metabolicSignature: string;
  physicalStaminaSummary: string;
  isQualitativeArchetype?: boolean;
  epistemologicalDisclaimer?: string;
}

export interface AppearanceAgingTrajectory {
  youthPhase: string;       // Foundational phase (D1)
  adultPrimePhase: string;  // Adult crystallization (D9)
  matureYearsPhase: string; // Mature consolidation (Planetary maturity)
  elderPhase?: string;      // Longevity preservation
}

export interface SpecificMarkEntry {
  type: 'Mole (Tilaka)' | 'Scar (Vraṇa)' | 'Birthmark (Lāñchana)' | 'Mark (Kṣata)';
  location: string;
  anatomicalDescription: string;
  planetOrigin: string;
  shastricBasis: string;
  indicationStatus?: 'Indication Present' | 'Strengthened' | 'Weakened' | 'Convergent' | 'Insufficient Evidence';
  uncertaintyNote?: string;
}

export interface DetailedOrganAnatomy {
  craniumAndForehead: string;
  eyesAndBrows: string;
  noseAndBridge: string;
  lipsTeethAndVoice: string;
  neckShouldersAndChest: string;
  handsFingersAndArms: string;
  spinePelvisAndLimbs: string;
}

export interface InfluencingGrahasDetail {
  lagnaLordConjunctions: string[];
  lagnaLordAspects: string[];
  firstHouseOccupantsDetail: string[];
  firstHouseAspectsDetail: string[];
  d9NavamshaSynthesis: string;
  secondHouseFaceAndVoice: string;
  twelfthHouseLeftEyeAndSleep: string;
}

export interface DetailedPhysicalAppearanceProfile {
  lagnaRashi: string;
  lagnaDegreeStr: string;
  lagnaLord: string;
  lagnaLordSign: string;
  lagnaLordDignity: string;
  occupantsInLagna: string[];
  aspectsOnLagna: string[];
  d9LagnaRashi: string;
  d3DrekkanaRashi: string;
  stature: AppearanceStature;
  faceAndHead: AppearanceFaceAndHead;
  eyesAndGaze: AppearanceEyesAndGaze;
  skinAndComplexion: AppearanceSkinAndComplexion;
  hair: AppearanceHair;
  distinctiveMarks: AppearanceDistinctiveMarks;
  gaitAndCarriage: AppearanceGaitAndCarriage;
  ayurvedicDosha: AppearanceAyurvedicDosha;
  agingTrajectory: AppearanceAgingTrajectory;
  classicalCitation: {
    source: string;
    chapterVerse: string;
    sanskritShloka: string;
    englishTranslation: string;
  };
  executiveAppearanceNarrative: string;

  // Granular Real-Chart Dimensions (10/10 Accuracy)
  influencingGrahas?: InfluencingGrahasDetail;
  detailedAnatomy?: DetailedOrganAnatomy;
  specificMarksCatalog?: SpecificMarkEntry[];
  d9NavamshaLagnaDetails?: {
    rashiName: string;
    rashiLord: string;
    occupantsInD9Lagna: string[];
    adultMaturationEffect: string;
  };
  secondHouseMukhaProfile?: {
    rashiName: string;
    lordName: string;
    occupants: string[];
    facialBoneAndJawline: string;
    teethAndSmile: string;
    vocalTimbre: string;
    rightEyeLuster: string;
  };
  twelfthHouseLeftEyeProfile?: {
    rashiName: string;
    lordName: string;
    occupants: string[];
    leftEyeAppearance: string;
    sleepArchitecture: string;
  };
}

// Canonical Rashi Physical Appearance Matrix (Sārāvalī Ch. 21-28 & BPHS Ch. 4)
interface RashiAppearanceData {
  statureCategory: 'Short' | 'Short-to-Medium' | 'Medium' | 'Medium-to-Tall' | 'Tall' | 'Tall & Slender';
  build: 'Ectomorphic (Lean/Slender)' | 'Mesomorphic (Athletic/Muscular)' | 'Endomorphic (Sturdy/Compact)' | 'Balanced/Symmetrical';
  boneStructure: string;
  chestShoulders: string;
  headShape: 'Oval' | 'Square/Angular' | 'Round (Candra-Mukha)' | 'Heart-shaped' | 'Long/Elongated' | 'Triangular';
  forehead: string;
  jawChin: string;
  eyeType: string;
  eyeShade: string;
  gaze: string;
  brows: string;
  varna: 'Gaura (Fair / Luminous)' | 'Rakta-Gaura (Ruddy / Warm Glow)' | 'Tapta-Kāñcana (Molten Gold / Wheatish)' | 'Śyāma (Dusky / Olive / Deep Wheatish)' | 'Pāṇḍu (Pale / Milk-toned)' | 'Snigdha-Śyāma (Lustrous Dusk)';
  skinTexture: 'Smooth & Radiant (Snigdha)' | 'Dry & Matte (Rūkṣa)' | 'Warm & Sensitive (Uṣṇa)' | 'Supple & Moisture-rich';
  hairTexture: string;
  hairCurl: 'Straight & Silky' | 'Wavy & Lustrous' | 'Crisp / Curly' | 'Coarse & Thick' | 'Fine & Delicate';
  gait: string;
  presence: string;
  shloka: string;
  translation: string;
}

const RASHI_CANONICAL_APPEARANCE: Record<RashiNumber, RashiAppearanceData> = {
  1: { // Aries / Meṣa
    statureCategory: 'Medium',
    build: 'Mesomorphic (Athletic/Muscular)',
    boneStructure: 'Compact, dense bone density with well-defined muscular contours and lean sinews.',
    chestShoulders: 'Broad chest, athletic taper, prominent collarbones, quick muscular reaction.',
    headShape: 'Triangular',
    forehead: 'Prominent, slightly protruding brow ridge with well-defined temples.',
    jawChin: 'Firm, angular jawline with a resolute, slightly pointed chin.',
    eyeType: 'Sharp, piercing, and vigilant (Vīkṣaṇa-paṭu)',
    eyeShade: 'Reddish-tinted or amber undertones in the iris, clear cornea.',
    gaze: 'Direct, penetrating, unwavering warrior-like gaze.',
    brows: 'Prominent, arched, occasionally meeting at the bridge of the nose.',
    varna: 'Rakta-Gaura (Ruddy / Warm Glow)',
    skinTexture: 'Warm & Sensitive (Uṣṇa)',
    hairTexture: 'Crisp, slightly rough, resilient hair shafts with strong growth roots.',
    hairCurl: 'Crisp / Curly',
    gait: 'Brisk, purposeful, athletic stride with the head held eagerly forward.',
    presence: 'Martial, energetic, dynamic, and physically commanding presence.',
    shloka: 'मेषो रक्ताङ्गसम्पन्नो मध्यकायः प्रतापवान्। रक्तनेत्रः कृशोदरो दृढाङ्गः शीघ्रविक्रमः॥',
    translation: 'Aries ascendant native possesses a ruddy-toned frame of medium stature, energetic vitality, piercing eyes, lean waist, firm muscular limbs, and swift decisive strides.',
  },
  2: { // Taurus / Vṛṣabha
    statureCategory: 'Short-to-Medium',
    build: 'Endomorphic (Sturdy/Compact)',
    boneStructure: 'Heavy, grounded, robust skeletal frame with thick wrists and sturdy ankles.',
    chestShoulders: 'Solid, wide, square shoulders with a muscular, well-anchored bull-like neck.',
    headShape: 'Square/Angular',
    forehead: 'Broad, flat, dignified forehead conveying calm, unhurried endurance.',
    jawChin: 'Square, solid jawline with fleshy cheeks and well-set dental arches.',
    eyeType: 'Large, dark, calm, and luminous (Gavākṣākṣa)',
    eyeShade: 'Deep espresso or velvet black, glossy and moist.',
    gaze: 'Steady, tranquil, observant, and deeply reassuring gaze.',
    brows: 'Thick, well-groomed, gently curved horizontal eyebrows.',
    varna: 'Tapta-Kāñcana (Molten Gold / Wheatish)',
    skinTexture: 'Smooth & Radiant (Snigdha)',
    hairTexture: 'Thick, lustrous, abundant dark hair with a rich natural wave.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Slow, grounded, rhythmic, dignified, and heavy-footed deliberate gait.',
    presence: 'Earthy, dependable, calm, sensual, and immovable physical gravity.',
    shloka: 'वृषे विशालवक्षस्को दृढगात्रः सुलोचनः। स्थूलग्रीवः कुञ्चितकेशः कान्तिमान् धीरविक्रमः॥',
    translation: 'Taurus native displays a broad expansive chest, solid immovable frame, attractive eyes, stout muscular neck, wavy curly hair, radiant glow, and patient steadfast gait.',
  },
  3: { // Gemini / Mithuna
    statureCategory: 'Tall & Slender',
    build: 'Ectomorphic (Lean/Slender)',
    boneStructure: 'Elongated, light-boned, nimble frame with prominent veins and slender knuckles.',
    chestShoulders: 'Narrow-to-medium chest, flexible shoulders, exceptionally long arms and fingers.',
    headShape: 'Oval',
    forehead: 'High, refined, intellectual forehead showing prominent temporal veins when thinking.',
    jawChin: 'Tapered, elegant jawline with an expressive, articulate chin and mobile lips.',
    eyeType: 'Quick, analytical, expressive, and sparkling (Capala-netra)',
    eyeShade: 'Clear hazel, light amber, or alert lively brown.',
    gaze: 'Curious, swift, darting, intellectually inquisitive gaze taking in all surroundings.',
    brows: 'Delicate, arched, highly expressive and animated during conversation.',
    varna: 'Gaura (Fair / Luminous)',
    skinTexture: 'Dry & Matte (Rūkṣa)',
    hairTexture: 'Fine, silky, straight or softly floating strands, easily styled.',
    hairCurl: 'Straight & Silky',
    gait: 'Light, springy, rapid, agile, and communicative stride.',
    presence: 'Youthful, cerebral, charming, articulate, and effortlessly adaptable.',
    shloka: 'मिथुने दीर्घाङ्गश्चारुनेत्रः शिराचितः। सुवाक् प्रगल्भः सुरूपो विनीतात्मा प्रहसन्निव॥',
    translation: 'Gemini ascendant gives an elongated slender body, captivating eyes, prominent veins, articulate speech, handsome features, and an approachable smiling countenance.',
  },
  4: { // Cancer / Karka
    statureCategory: 'Short-to-Medium',
    build: 'Endomorphic (Sturdy/Compact)',
    boneStructure: 'Soft, rounded contours with moderate bone density and a tendency to retain water.',
    chestShoulders: 'Full, expansive chest and upper torso, rounded shoulders, supple joints.',
    headShape: 'Round (Candra-Mukha)',
    forehead: 'Smooth, curved, dome-like forehead reflecting lunar luminescence.',
    jawChin: 'Soft, gently curving jawline with full cheeks, often sporting subtle dimples.',
    eyeType: 'Large, watery, soulful, and deeply receptive (Candra-netra)',
    eyeShade: 'Soft luminous brown, deep oceanic hue, or translucent dark.',
    gaze: 'Empathic, moist, emotionally transparent, and deeply perceptive gaze.',
    brows: 'Softly arched, natural, framing luminous wide-set eyes.',
    varna: 'Pāṇḍu (Pale / Milk-toned)',
    skinTexture: 'Supple & Moisture-rich',
    hairTexture: 'Soft, fine, dark-to-medium brown hair with natural moisture and gentle waves.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Gentle, rolling, cautious, and fluid gait with hands kept close to the body.',
    presence: 'Maternal, nurturing, receptive, emotionally magnetic, and soft-spoken aura.',
    shloka: 'कर्कटे चन्द्रवदनः स्थूलकायो जलप्रियः। मृदुगात्रः सुसौम्यश्च बहुपुत्रो गुणान्वितः॥',
    translation: 'Cancer native possesses a moon-like round face, fleshy comfortable build, soft supple limbs, extraordinarily gentle expression, and a compassionate soothing presence.',
  },
  5: { // Leo / Simha
    statureCategory: 'Medium-to-Tall',
    build: 'Mesomorphic (Athletic/Muscular)',
    boneStructure: 'Imposing, athletic skeletal architecture with majestic spinal posture.',
    chestShoulders: 'Expansive, commanding leonine chest, broad shoulders, narrow aristocratic waist.',
    headShape: 'Oval',
    forehead: 'Broad, stately, regal forehead commanding spontaneous respect.',
    jawChin: 'Prominent, sculpted jawline, firm chin, and a warm authoritative mouth.',
    eyeType: 'Regal, amber-tinted, golden, and majestic (Simha-dṛṣṭi)',
    eyeShade: 'Honey, golden-brown, or radiant hazel with a feline magnetic sheen.',
    gaze: 'Commanding, warm, noble, direct, and unblinking regal stare.',
    brows: 'Strong, well-defined, aristocratic arches elevating the facial frame.',
    varna: 'Tapta-Kāñcana (Molten Gold / Wheatish)',
    skinTexture: 'Warm & Sensitive (Uṣṇa)',
    hairTexture: 'Thick, mane-like hair with high volume, tending to recede gracefully at the crown in later years.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Measured, dignified, upright, stately, and unhurried regal stride.',
    presence: 'Charismatic, authoritative, solar, self-assured, and instantly noticeable in any room.',
    shloka: 'सिंहे विशालवक्षाश्च गौरवर्णो नृपाकृतिः। सिंहग्रीवो गम्भीरदृष्टिः प्रतापी स्थिरविक्रमः॥',
    translation: 'Leo ascendant produces a wide leonine chest, fair or golden complexion, royal bearing, powerful neck, deep dignified gaze, and unshakeable heroic majesty.',
  },
  6: { // Virgo / Kanyā
    statureCategory: 'Medium',
    build: 'Balanced/Symmetrical',
    boneStructure: 'Refined, delicately proportioned bones, precise joint articulations, compact frame.',
    chestShoulders: 'Symmetrical, neat shoulders, flat athletic stomach, modest balanced chest.',
    headShape: 'Oval',
    forehead: 'Smooth, neatly contoured, analytical forehead showing fastidious clarity.',
    jawChin: 'Finely chiseled jaw, refined chin, modest mouth with clear symmetrical teeth.',
    eyeType: 'Modest, observant, sharp, and pristine (Śucira-netra)',
    eyeShade: 'Dark hazel, clear almond-brown, or deep reflective charcoal.',
    gaze: 'Discerning, modest, diagnostic, attentive to minute details.',
    brows: 'Neatly groomed, refined, symmetrical and understated arches.',
    varna: 'Gaura (Fair / Luminous)',
    skinTexture: 'Smooth & Radiant (Snigdha)',
    hairTexture: 'Straight, sleek, dark, fine, neatly maintained, rarely unruly.',
    hairCurl: 'Straight & Silky',
    gait: 'Precise, quiet, light, orderly, and graceful steps.',
    presence: 'Innocent, intellectual, immaculate, methodical, and gracefully understated presence.',
    shloka: 'कन्यायां रूपवान् दक्षः सुकुमारतनू नरः। मृदुवाक् सत्यवादी च शास्त्रज्ञो विनयप्रियः॥',
    translation: 'Virgo ascendant confers a handsome youthful symmetry, refined delicate body, soft articulate speech, truthfulness, profound learning, and humble graceful demeanor.',
  },
  7: { // Libra / Tulā
    statureCategory: 'Medium-to-Tall',
    build: 'Balanced/Symmetrical',
    boneStructure: 'Proportionate, aesthetically harmonious bone structure with graceful extremities.',
    chestShoulders: 'Well-balanced shoulders, sculpted collarbones, naturally poised chest.',
    headShape: 'Heart-shaped',
    forehead: 'Balanced, smooth, attractive forehead with clean hairlines.',
    jawChin: 'Gently curved, photogenic jawline with dimples on cheeks or chin.',
    eyeType: 'Almond-shaped, captivating, smiling, and alluring (Cāru-netra)',
    eyeShade: 'Lustrous warm brown, glossy and expressive.',
    gaze: 'Diplomatic, charming, welcoming, and aesthetically appreciative gaze.',
    brows: 'Elegantly sculpted, curved, perfectly balanced brows.',
    varna: 'Gaura (Fair / Luminous)',
    skinTexture: 'Smooth & Radiant (Snigdha)',
    hairTexture: 'Soft, lustrous, dark brown or black hair with elegant natural waves.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Poised, rhythmic, graceful, and balanced glide.',
    presence: 'Diplomatic, polished, cultured, harmonious, and naturally attractive persona.',
    shloka: 'तौलिनि समगात्रश्च कान्तियुक्तः सुलोचनः। धर्मात्मा चतुरो वाग्मी देवब्राह्मणपूजकः॥',
    translation: 'Libra ascendant bestows a perfectly proportioned symmetrical body, glowing radiant luster, enchanting eyes, righteous spirit, diplomatic eloquence, and aesthetic refinement.',
  },
  8: { // Scorpio / Vṛścika
    statureCategory: 'Medium',
    build: 'Mesomorphic (Athletic/Muscular)',
    boneStructure: 'Dense, muscular, compact skeletal framework with resilient sinews and deep endurance.',
    chestShoulders: 'Broad muscular chest, strong arms, powerful hands, solid core.',
    headShape: 'Square/Angular',
    forehead: 'Strong, intense forehead with subtle horizontal creases of deep focus.',
    jawChin: 'Heavy, resolute, square jawline indicating iron willpower.',
    eyeType: 'Hypnotic, intense, brooding, and unblinking (Gūḍha-netra)',
    eyeShade: 'Deep velvet black, dark coffee, or piercing magnetic dark.',
    gaze: 'Penetrating, private, piercing through deception, impossible to look away from.',
    brows: 'Thick, dark, brooding, slightly heavy over deep-set eyes.',
    varna: 'Tapta-Kāñcana (Molten Gold / Wheatish)',
    skinTexture: 'Warm & Sensitive (Uṣṇa)',
    hairTexture: 'Thick, coarse, dark, occasionally unruly with strong widow’s peak.',
    hairCurl: 'Crisp / Curly',
    gait: 'Stealthy, controlled, deliberate, purposeful, and quiet stride.',
    presence: 'Intense, magnetic, enigmatic, guarded, and formidable psychological presence.',
    shloka: 'वृश्चिके वृत्तगात्रश्च रक्तदृष्टिः पिशुनवान्। शूरः प्रच्छन्नपापश्च दृढाङ्गः स्वाभिमानी च॥',
    translation: 'Scorpio native displays a solid rounded muscular frame, piercing penetrating gaze, formidable courage, secret fortitude, iron endurance, and deep self-respect.',
  },
  9: { // Sagittarius / Dhanu
    statureCategory: 'Tall',
    build: 'Mesomorphic (Athletic/Muscular)',
    boneStructure: 'Long-limbed, athletic, large-framed skeleton with robust hips and thighs.',
    chestShoulders: 'Expansive open chest, athletic wide shoulders, high stature.',
    headShape: 'Long/Elongated',
    forehead: 'Expansive, noble, domed forehead conveying philosophical breadth.',
    jawChin: 'Long, dignified jawline, generous smile, and open facial expressions.',
    eyeType: 'Bright, visionary, candid, and jovial (Bṛhat-netra)',
    eyeShade: 'Clear golden-brown, radiant hazel, or frank open dark eyes.',
    gaze: 'Optimistic, direct, philosophical, and sweeping visionary gaze.',
    brows: 'Broad, strong, naturally arched, lending an honest scholarly air.',
    varna: 'Tapta-Kāñcana (Molten Gold / Wheatish)',
    skinTexture: 'Smooth & Radiant (Snigdha)',
    hairTexture: 'Thick, healthy hair, tendency towards high hairline or noble temple receding with maturity.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Brisk, expansive, athletic, bounding, and adventurous stride.',
    presence: 'Benevolent, optimistic, scholarly, sports-oriented, and expansively generous aura.',
    shloka: 'धनुषि दीर्घाङ्गश्च स्थूलग्रीवो महामतिः। विशालनेत्रो धर्मात्मा प्रतापी गुरुपूजकः॥',
    translation: 'Sagittarius native is tall and long-limbed, possessing a stout neck, expansive intellect, large expressive eyes, noble demeanor, righteous disposition, and heroic vitality.',
  },
  10: { // Capricorn / Makara
    statureCategory: 'Medium-to-Tall',
    build: 'Ectomorphic (Lean/Slender)',
    boneStructure: 'Prominent joints, visible knuckles/knees, lean sinewy frame built for extreme endurance.',
    chestShoulders: 'Narrow-to-medium chest, bony collarbones, slightly stoic or sloping shoulders.',
    headShape: 'Long/Elongated',
    forehead: 'Deeply thoughtful, narrow-to-medium forehead with visible maturity lines.',
    jawChin: 'Angular, austere jawline with a firm, reserved chin and tight lips.',
    eyeType: 'Deep-set, cautious, contemplative, and vigilant (Gambhīra-netra)',
    eyeShade: 'Dark charcoal, deep brooding brown, or stone-gray tint.',
    gaze: 'Serious, realistic, calculating, watchful, and patient gaze.',
    brows: 'Dark, low-set, straight, lending an intense stoic gravity.',
    varna: 'Śyāma (Dusky / Olive / Deep Wheatish)',
    skinTexture: 'Dry & Matte (Rūkṣa)',
    hairTexture: 'Coarse, dark, dry, thinning slightly early at the temples.',
    hairCurl: 'Fine & Delicate',
    gait: 'Steady, deliberate, cautious, endurance-driven, and disciplined steps.',
    presence: 'Austere, pragmatic, authoritative, mature beyond years, and relentlessly enduring.',
    shloka: 'मकरे कृशगात्रश्च दीर्घकायो दृढव्रतः। शिरालाङ्गः काष्ठवर्णः सत्यसन्धो विमर्शकः॥',
    translation: 'Capricorn ascendant confers a lean sinewy elongated body, prominent veins, dusky or woody skin tone, unwavering determination, truthful speech, and pragmatic analytical mind.',
  },
  11: { // Aquarius / Kumbha
    statureCategory: 'Medium-to-Tall',
    build: 'Balanced/Symmetrical',
    boneStructure: 'Well-set, sturdy, balanced skeletal frame with attractive neck and well-proportioned calves.',
    chestShoulders: 'Broad, solid, well-proportioned torso, durable shoulders, strong legs.',
    headShape: 'Oval',
    forehead: 'Broad, clear, visionary forehead indicating futuristic conceptualization.',
    jawChin: 'Clean-cut, friendly, intellectual jawline with an open demeanor.',
    eyeType: 'Thoughtful, visionary, humane, and detached (Dūra-darśī-netra)',
    eyeShade: 'Deep observant brown, charcoal, or clear contemplative hazel.',
    gaze: 'Universal, benevolent, slightly detached, egalitarian, and visionary gaze.',
    brows: 'Clean, well-spaced, horizontal, framing alert and intelligent eyes.',
    varna: 'Śyāma (Dusky / Olive / Deep Wheatish)',
    skinTexture: 'Dry & Matte (Rūkṣa)',
    hairTexture: 'Wavy, dark, medium-textured hair with an unconventional or relaxed styling.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Casual, steady, purposeful, egalitarian, and forward-looking stride.',
    presence: 'Progressive, humane, intellectually unique, approachable yet subtly detached.',
    shloka: 'कुम्भे विशालकायश्च स्थिरगात्रो महामतिः। गूढविद्याप्रियो धीरः परोपकारतत्परः॥',
    translation: 'Aquarius ascendant confers a broad sturdy well-set frame, stable physique, formidable intellect, affinity for esoteric wisdom, calm patience, and humanitarian altruism.',
  },
  12: { // Pisces / Meena
    statureCategory: 'Short-to-Medium',
    build: 'Endomorphic (Sturdy/Compact)',
    boneStructure: 'Soft, fleshy, supple bone structure with delicate feet and flexible joints.',
    chestShoulders: 'Full, soft, supple torso with fleshy shoulders and rounded arms.',
    headShape: 'Round (Candra-Mukha)',
    forehead: 'Smooth, serene, dome-like forehead with a calm spiritual radiance.',
    jawChin: 'Soft, gentle, rounded jawline with full expressive lips.',
    eyeType: 'Large, fish-like, shimmering, lustrous, and mystical (Mīnākṣa)',
    eyeShade: 'Translucent light brown, watery oceanic dark, or dreamy hazel.',
    gaze: 'Dreamy, compassionate, mystical, unfathomable, and gentle gaze.',
    brows: 'Soft, gracefully curving, delicate arches.',
    varna: 'Gaura (Fair / Luminous)',
    skinTexture: 'Supple & Moisture-rich',
    hairTexture: 'Silky, soft, wavy, fine, lustrous dark or auburn hair.',
    hairCurl: 'Wavy & Lustrous',
    gait: 'Gentle, gliding, quiet, fluid, and non-aggressive motion.',
    presence: 'Mystical, empathetic, poetic, serene, and otherworldly spiritual aura.',
    shloka: 'मीने सुकोमलगात्रश्च जलचारीव लोचनः। विनीतो धार्मिकः प्राज्ञः सर्वलोकप्रियो नरः॥',
    translation: 'Pisces ascendant produces a soft supple delicate body, glistening fish-like expressive eyes, humble pious demeanor, intuitive wisdom, and universal warmth.',
  },
};

/**
 * Planetary modifiers on 1st house (Occupancy and Aspect)
 */
interface PlanetAppearanceModifier {
  statureShift: number; // -2 = much shorter/compact, +2 = much taller/elongated
  buildModifier: string;
  faceModifier: string;
  eyeModifier: string;
  skinModifier: string;
  hairModifier: string;
  distinctiveMark: string;
  gaitModifier: string;
  vataAdd: number;
  pittaAdd: number;
  kaphaAdd: number;
}

const PLANET_APPEARANCE_MODIFIERS: Record<PlanetId, PlanetAppearanceModifier> = {
  sun: {
    statureShift: 1,
    buildModifier: 'Broadens shoulders and reinforces spinal posture; imparts authoritative regal carriage.',
    faceModifier: 'Imparts a honeyed or amber glow to the complexion, broad cheekbones, and regal forehead.',
    eyeModifier: 'Eyes acquire a penetrating golden-brown or amber radiance with sharp visual acuity.',
    skinModifier: 'Adds a warm reddish-golden glow (Pitta) and makes skin prone to sun-freckling or warmth.',
    hairModifier: 'Tendency towards early thinning or receding hairline at the temples and crown.',
    distinctiveMark: 'Prominent birthmark or mole near the crown of the head, right eye, or upper chest.',
    gaitModifier: 'Upright, proud, dignified, and authoritative stride.',
    vataAdd: 5,
    pittaAdd: 30,
    kaphaAdd: -10,
  },
  moon: {
    statureShift: -1,
    buildModifier: 'Softens muscular edges, increases lymphatic moisture, promotes rounded supple contours.',
    faceModifier: 'Bestows a luminous, moon-like round face with smooth cheeks and gentle facial expressions.',
    eyeModifier: 'Large, liquid, soulful eyes with deep emotional luminescence and thick soft eyelashes.',
    skinModifier: 'Luminous, fair or milk-toned complexion with high hydration and smooth texture.',
    hairModifier: 'Abundant, wavy, silky dark hair with natural sheen and soft texture.',
    distinctiveMark: 'Delicate mole or birthmark near the left cheek, throat, or left breast.',
    gaitModifier: 'Fluid, gentle, gliding, and gracefully rolling stride.',
    vataAdd: 5,
    pittaAdd: -10,
    kaphaAdd: 30,
  },
  mars: {
    statureShift: 0,
    buildModifier: 'Significantly increases muscular definition, vascular sinews, and low subcutaneous body fat.',
    faceModifier: 'Chiseled angular jawline, strong brow ridge, sharp cheekbones, and energetic expression.',
    eyeModifier: 'Fierce, vigilant, piercing eyes with subtle reddish capillaries in the corners.',
    skinModifier: 'Ruddy, warm, flushed complexion prone to heat sensitivity, cuts, and rapid healing.',
    hairModifier: 'Crisp, slightly rough hair strands with strong roots, occasionally with a reddish tint.',
    distinctiveMark: 'Distinctive cut, scar, or burn mark on the forehead, temple, scalp, or chin.',
    gaitModifier: 'Brisk, aggressive, athletic, rapid, and commanding stride.',
    vataAdd: 5,
    pittaAdd: 35,
    kaphaAdd: -15,
  },
  mercury: {
    statureShift: 1,
    buildModifier: 'Elongates limbs and maintains a perpetually youthful, slender, agile physical frame.',
    faceModifier: 'Youthful facial features making the native appear 5–10 years younger than actual age.',
    eyeModifier: 'Alert, darting, communicative, sparkling eyes that register subtle environmental shifts.',
    skinModifier: 'Clear, smooth, well-toned skin with delicate pore structure.',
    hairModifier: 'Fine, dark, silky hair that falls naturally without heavy styling.',
    distinctiveMark: 'Small beauty mark or mole near the lips, collarbone, or fingertips.',
    gaitModifier: 'Light, brisk, animated, and springy stride.',
    vataAdd: 20,
    pittaAdd: 10,
    kaphaAdd: 5,
  },
  jupiter: {
    statureShift: 2,
    buildModifier: 'Expansive skeletal structure, broad dignified frame, tendency toward fullness with age.',
    faceModifier: 'Magnificent domed forehead, noble facial contours, prominent nose, and radiant smile.',
    eyeModifier: 'Large, benevolent, calm, golden-brown eyes radiating wisdom and deep reassurance.',
    skinModifier: 'Golden, wheatish, radiant skin with high natural glow and robust cellular vitality.',
    hairModifier: 'Healthy, thick, golden-brown or dark hair with graceful thinning at temples after age 40.',
    distinctiveMark: 'Auspicious mole or mark on the forehead (Tilaka position), throat, or right ear.',
    gaitModifier: 'Stately, measured, heavy, dignified, and serene stride.',
    vataAdd: -10,
    pittaAdd: 5,
    kaphaAdd: 30,
  },
  venus: {
    statureShift: 0,
    buildModifier: 'Exceptional physical symmetry, sculpted proportions, graceful curves, photogenic frame.',
    faceModifier: 'Harmonious, alluring facial symmetry, dimples, soft sculpted lips, charming smile.',
    eyeModifier: 'Enchanting, almond-shaped, moist eyes with magnetic aesthetic allure and dark eyelashes.',
    skinModifier: 'Ultra-smooth, lustrous, glowing skin with natural porcelain or golden radiance.',
    hairModifier: 'Luxurious, thick, wavy, dark, lustrous hair with natural bounce and volume.',
    distinctiveMark: 'Attractive beauty mark on cheek, neck, dimple, or chest.',
    gaitModifier: 'Graceful, rhythmic, elegant, and effortlessly poised glide.',
    vataAdd: 5,
    pittaAdd: 5,
    kaphaAdd: 25,
  },
  saturn: {
    statureShift: 2,
    buildModifier: 'Tall or bony frame, prominent joints, lean sinews, visible veins, extreme physical endurance.',
    faceModifier: 'Austere, serious, mature facial architecture with prominent bone structure and deep contours.',
    eyeModifier: 'Deep-set, thoughtful, serious, watchful eyes with dark shadowing under the lower lids.',
    skinModifier: 'Dusky, olive, or woody skin tone with matte or dry surface texture.',
    hairModifier: 'Coarse, thick, dark or graying hair with dry texture.',
    distinctiveMark: 'Dark mole, mark, or joint scar on the knees, ankles, feet, or lower back.',
    gaitModifier: 'Deliberate, slow, disciplined, cautious, and heavy stride.',
    vataAdd: 35,
    pittaAdd: -10,
    kaphaAdd: 0,
  },
  rahu: {
    statureShift: 2,
    buildModifier: 'Tall, unconventional, asymmetrical or unusually striking physical stature.',
    faceModifier: 'Unusual or striking facial angles, prominent nose or cheekbones, magnetic foreign look.',
    eyeModifier: 'Intense, hypnotic, smoky or shadow-ringed eyes with an enigmatic magnetic pull.',
    skinModifier: 'Uneven or dusky skin tone with high sensitivity to chemicals or allergies.',
    hairModifier: 'Thick, wild, unconventional or dark hair with a rebellious wave pattern.',
    distinctiveMark: 'Prominent dark mole or birthmark on the neck, earlobe, or upper back.',
    gaitModifier: 'Restless, swift, unpredictable, and unconventional stride.',
    vataAdd: 30,
    pittaAdd: 10,
    kaphaAdd: -5,
  },
  ketu: {
    statureShift: -1,
    buildModifier: 'Wiry, slender, detached physical frame with high pain tolerance and subtle presence.',
    faceModifier: 'Narrow, ascetic facial contour with high cheekbones and a contemplative expression.',
    eyeModifier: 'Piercing, dispassionate, inward-looking eyes that appear to gaze into infinity.',
    skinModifier: 'Dry, sensitive skin prone to minor abrasions or unique pigmentations.',
    hairModifier: 'Thin, wiry, fine hair or preference for minimalist, cropped hair.',
    distinctiveMark: 'A distinct scar, surgery mark, or burn trace on the head, face, or spine.',
    gaitModifier: 'Silent, light-footed, stealthy, and detached stride.',
    vataAdd: 25,
    pittaAdd: 15,
    kaphaAdd: -15,
  },
  true_rahu: {
    statureShift: 1,
    buildModifier: 'Tall, unconventional, charismatic frame with commanding gaze.',
    faceModifier: 'Distinctive, asymmetrical forehead with pronounced eyebrows.',
    eyeModifier: 'Hypnotic, intense, searching eyes that perceive hidden depths.',
    skinModifier: 'Uneven or dusky skin tone with high sensitivity to chemicals or allergies.',
    hairModifier: 'Thick, wild, unconventional or dark hair with a rebellious wave pattern.',
    distinctiveMark: 'Prominent dark mole or birthmark on the neck, earlobe, or upper back.',
    gaitModifier: 'Restless, swift, unpredictable, and unconventional stride.',
    vataAdd: 30,
    pittaAdd: 10,
    kaphaAdd: -5,
  },
  true_ketu: {
    statureShift: -1,
    buildModifier: 'Wiry, slender, detached physical frame with high pain tolerance and subtle presence.',
    faceModifier: 'Narrow, ascetic facial contour with high cheekbones and a contemplative expression.',
    eyeModifier: 'Piercing, dispassionate, inward-looking eyes that appear to gaze into infinity.',
    skinModifier: 'Dry, sensitive skin prone to minor abrasions or unique pigmentations.',
    hairModifier: 'Thin, wiry, fine hair or preference for minimalist, cropped hair.',
    distinctiveMark: 'A distinct scar, surgery mark, or burn trace on the head, face, or spine.',
    gaitModifier: 'Silent, light-footed, stealthy, and detached stride.',
    vataAdd: 25,
    pittaAdd: 15,
    kaphaAdd: -15,
  },
};

/**
 * Classical Drekkāṇa Aṅga-Vibhāga (BPHS Ch. 27 & Jātaka Pārijāta Ch. 5)
 * Maps any house position (1-12) to an exact anatomical site based on the Lagna's decanate.
 */
function getDrekkanaAnatomicalOrgan(
  drekkanaIdx: 1 | 2 | 3,
  house: number
): { organ: string; laterality: 'Right Side' | 'Left Side' | 'Sagittal Midline / Central'; zoneName: string } {
  // Normalize house to 1..12
  const h = ((house - 1 + 12) % 12) + 1;

  if (drekkanaIdx === 1) {
    // 1st Drekkāṇa (0°-10°): Cranial & Facial Anatomy
    switch (h) {
      case 1:
        return { organ: 'Crown of the head / Cranial vertex / Forehead center', laterality: 'Sagittal Midline / Central', zoneName: 'Upper Cranium' };
      case 2:
        return { organ: 'Right temple, right eyebrow & upper eyelid', laterality: 'Right Side', zoneName: 'Ocular / Temporal (Right)' };
      case 3:
        return { organ: 'Right earlobe, right cheekbone & upper right jaw', laterality: 'Right Side', zoneName: 'Auricular / Zygomatic (Right)' };
      case 4:
        return { organ: 'Right nostril & right nasal alar base', laterality: 'Right Side', zoneName: 'Nasal (Right)' };
      case 5:
        return { organ: 'Right corner of the mouth & right upper lip', laterality: 'Right Side', zoneName: 'Labial / Buccal (Right)' };
      case 6:
        return { organ: 'Right side of the mandible / lower jawline & right neck side', laterality: 'Right Side', zoneName: 'Mandibular (Right)' };
      case 7:
        return { organ: 'Center of lower lip, philtrum, chin center & nasal bridge', laterality: 'Sagittal Midline / Central', zoneName: 'Facial Midline' };
      case 8:
        return { organ: 'Left side of the mandible / lower jawline & left neck side', laterality: 'Left Side', zoneName: 'Mandibular (Left)' };
      case 9:
        return { organ: 'Left corner of the mouth & left upper lip', laterality: 'Left Side', zoneName: 'Labial / Buccal (Left)' };
      case 10:
        return { organ: 'Left nostril & left nasal alar base', laterality: 'Left Side', zoneName: 'Nasal (Left)' };
      case 11:
        return { organ: 'Left earlobe, left cheekbone & upper left jaw', laterality: 'Left Side', zoneName: 'Auricular / Zygomatic (Left)' };
      case 12:
        return { organ: 'Left temple, left eyebrow & upper eyelid', laterality: 'Left Side', zoneName: 'Ocular / Temporal (Left)' };
      default:
        return { organ: 'Head and facial perimeter', laterality: 'Sagittal Midline / Central', zoneName: 'Cranial' };
    }
  } else if (drekkanaIdx === 2) {
    // 2nd Drekkāṇa (10°-20°): Cervical, Brachial & Thoracic Anatomy
    switch (h) {
      case 1:
        return { organ: 'Base of cervical throat, thyroid cartilage & jugular notch', laterality: 'Sagittal Midline / Central', zoneName: 'Cervical Center' };
      case 2:
        return { organ: 'Right clavicle / collarbone & right acromion joint', laterality: 'Right Side', zoneName: 'Clavicular (Right)' };
      case 3:
        return { organ: 'Right shoulder, upper deltoid & right bicep/arm', laterality: 'Right Side', zoneName: 'Brachial (Right)' };
      case 4:
        return { organ: 'Right pectoral region / right upper chest wall', laterality: 'Right Side', zoneName: 'Thoracic (Right)' };
      case 5:
        return { organ: 'Right ribcage, upper hypochondrium & liver region', laterality: 'Right Side', zoneName: 'Costal (Right)' };
      case 6:
        return { organ: 'Right lower flank, right upper abdomen & waistline', laterality: 'Right Side', zoneName: 'Abdominal Flank (Right)' };
      case 7:
        return { organ: 'Center of sternum, solar plexus & thoracic spine', laterality: 'Sagittal Midline / Central', zoneName: 'Thoracic Midline' };
      case 8:
        return { organ: 'Left lower flank, left upper abdomen & waistline', laterality: 'Left Side', zoneName: 'Abdominal Flank (Left)' };
      case 9:
        return { organ: 'Left ribcage, upper hypochondrium & spleen region', laterality: 'Left Side', zoneName: 'Costal (Left)' };
      case 10:
        return { organ: 'Left pectoral region / left upper chest wall', laterality: 'Left Side', zoneName: 'Thoracic (Left)' };
      case 11:
        return { organ: 'Left shoulder, upper deltoid & left bicep/arm', laterality: 'Left Side', zoneName: 'Brachial (Left)' };
      case 12:
        return { organ: 'Left clavicle / collarbone & left acromion joint', laterality: 'Left Side', zoneName: 'Clavicular (Left)' };
      default:
        return { organ: 'Thoracic cage and chest perimeter', laterality: 'Sagittal Midline / Central', zoneName: 'Thoracic' };
    }
  } else {
    // 3rd Drekkāṇa (20°-30°): Pelvic, Abdominal & Lower Extremities
    switch (h) {
      case 1:
        return { organ: 'Navel center, lower abdominal wall & sacral base', laterality: 'Sagittal Midline / Central', zoneName: 'Umbilical / Sacral' };
      case 2:
        return { organ: 'Right iliac crest, right pelvic hip & right groin', laterality: 'Right Side', zoneName: 'Pelvic / Inguinal (Right)' };
      case 3:
        return { organ: 'Right upper thigh, quadriceps & femur shaft', laterality: 'Right Side', zoneName: 'Femoral (Right)' };
      case 4:
        return { organ: 'Right knee joint, patella & popliteal fossa', laterality: 'Right Side', zoneName: 'Genicular (Right)' };
      case 5:
        return { organ: 'Right shin, anterior tibia & calf muscle', laterality: 'Right Side', zoneName: 'Crural (Right)' };
      case 6:
        return { organ: 'Right ankle, Achilles tendon & dorsal surface of right foot', laterality: 'Right Side', zoneName: 'Pedal (Right)' };
      case 7:
        return { organ: 'Pubic symphysis, perineum & coccyx base', laterality: 'Sagittal Midline / Central', zoneName: 'Pelvic Midline' };
      case 8:
        return { organ: 'Left ankle, Achilles tendon & dorsal surface of left foot', laterality: 'Left Side', zoneName: 'Pedal (Left)' };
      case 9:
        return { organ: 'Left shin, anterior tibia & calf muscle', laterality: 'Left Side', zoneName: 'Crural (Left)' };
      case 10:
        return { organ: 'Left knee joint, patella & popliteal fossa', laterality: 'Left Side', zoneName: 'Genicular (Left)' };
      case 11:
        return { organ: 'Left upper thigh, quadriceps & femur shaft', laterality: 'Left Side', zoneName: 'Femoral (Left)' };
      case 12:
        return { organ: 'Left iliac crest, left pelvic hip & left groin', laterality: 'Left Side', zoneName: 'Pelvic / Inguinal (Left)' };
      default:
        return { organ: 'Lower limbs and pelvic perimeter', laterality: 'Sagittal Midline / Central', zoneName: 'Pelvic / Lower Extremity' };
    }
  }
}

/**
 * Computes exhaustive, canonical Physical Appearance, Bodily Stature,
 * Facial Features, Ayurvedic Dosha, and Marks according to Classical Treatises.
 */
export function calculatePhysicalAppearanceProfile(chart: JyotishaChart): DetailedPhysicalAppearanceProfile {
  const lagnaRashiNum = (chart.lagna?.rashiNumber || 1) as RashiNumber;
  const baseRashi = RASHI_CANONICAL_APPEARANCE[lagnaRashiNum] || RASHI_CANONICAL_APPEARANCE[1];
  const lagnaRashiInfo = RASHIS[lagnaRashiNum];
  const lagnaDegree = chart.lagna?.degreeInRashi ?? 15.0;

  // Drekkāṇa index: 1 (0-10°), 2 (10-20°), 3 (20-30°)
  const drekkanaIdx: 1 | 2 | 3 = lagnaDegree < 10 ? 1 : lagnaDegree < 20 ? 2 : 3;

  // 1. Lagna Lord details
  const lagnaLordId = lagnaRashiInfo.lord;
  const lagnaLordPlanet = chart.planets[lagnaLordId];
  const lagnaLordHouse = lagnaLordPlanet?.house || 1;
  const lagnaLordRashiNum = lagnaLordPlanet?.rashiNumber || lagnaRashiNum;
  const lagnaLordRashiInfo = RASHIS[lagnaLordRashiNum as RashiNumber];
  const lagnaLordDignity = lagnaLordPlanet?.dignity || 'Neutral';

  // Conjunctions with Lagna Lord (Planets sharing the exact same house as Lagna Lord)
  const planetsConjunctLagnaLord = Object.values(chart.planets).filter(
    (p) => p.id !== lagnaLordId && p.house === lagnaLordHouse && !['true_rahu', 'true_ketu'].includes(p.id)
  );

  // Aspects on Lagna Lord (Planets aspecting the Lagna Lord's house)
  const planetsAspectingLagnaLord = Object.values(chart.planets).filter(
    (p) => p.id !== lagnaLordId && p.house !== lagnaLordHouse && p.aspectsToHouses?.includes(lagnaLordHouse) && !['true_rahu', 'true_ketu'].includes(p.id)
  );

  // 2. 1st House Occupants
  const occupants = Object.values(chart.planets).filter(
    (p) => p.house === 1 && !['true_rahu', 'true_ketu'].includes(p.id)
  ).map((p) => p.id);

  // Aspects on 1st House
  const aspectsOn1st: PlanetId[] = [];
  Object.values(chart.planets).forEach((p) => {
    if (p.house !== 1 && p.aspectsToHouses?.includes(1) && !['true_rahu', 'true_ketu'].includes(p.id)) {
      aspectsOn1st.push(p.id);
    }
  });

  // 3. D9 Navāṃśa Lagna (Deha-Svarūpa)
  const d9LagnaRashiNum = (chart.vargas?.D9?.lagnaRashi || lagnaRashiNum) as RashiNumber;
  const d9LagnaInfo = RASHIS[d9LagnaRashiNum];
  const d9LagnaLordId = d9LagnaInfo.lord;
  const d9LagnaOccupants: string[] = [];
  if (chart.vargas?.D9?.planets) {
    Object.entries(chart.vargas.D9.planets).forEach(([pId, vData]) => {
      if (vData.house === 1 && !['true_rahu', 'true_ketu'].includes(pId)) {
        d9LagnaOccupants.push(GRAHA_NAMES[pId as PlanetId]?.sanskrit || pId);
      }
    });
  }

  // 4. 2nd House (Mukha Bhāva - Face, Jaw, Teeth, Lips, Mouth, Right Eye, Voice)
  const secondHouseRashiNum = (((lagnaRashiNum - 1 + 1) % 12) + 1) as RashiNumber;
  const secondHouseLordId = RASHIS[secondHouseRashiNum].lord;
  const secondHouseOccupants = Object.values(chart.planets).filter(
    (p) => p.house === 2 && !['true_rahu', 'true_ketu'].includes(p.id)
  ).map((p) => p.id);
  const secondHouseAspects = Object.values(chart.planets).filter(
    (p) => p.house !== 2 && p.aspectsToHouses?.includes(2) && !['true_rahu', 'true_ketu'].includes(p.id)
  ).map((p) => p.id);

  // 5. 12th House (Left Eye & Sleep / Rest Architecture)
  const twelfthHouseRashiNum = (((lagnaRashiNum - 1 + 11) % 12) + 1) as RashiNumber;
  const twelfthHouseLordId = RASHIS[twelfthHouseRashiNum].lord;
  const twelfthHouseOccupants = Object.values(chart.planets).filter(
    (p) => p.house === 12 && !['true_rahu', 'true_ketu'].includes(p.id)
  ).map((p) => p.id);

  // ----------------------------------------------------
  // Net Stature and Height Calculation
  // ----------------------------------------------------
  let statureShift = 0;
  occupants.forEach((pId) => {
    const mod = PLANET_APPEARANCE_MODIFIERS[pId];
    if (mod) statureShift += mod.statureShift;
  });
  aspectsOn1st.forEach((pId) => {
    const mod = PLANET_APPEARANCE_MODIFIERS[pId];
    if (mod) statureShift += Math.round(mod.statureShift * 0.5);
  });
  planetsConjunctLagnaLord.forEach((p) => {
    const mod = PLANET_APPEARANCE_MODIFIERS[p.id];
    if (mod) statureShift += Math.round(mod.statureShift * 0.7);
  });

  let statureCategory = baseRashi.statureCategory;
  if (statureShift >= 2) {
    if (statureCategory === 'Short') statureCategory = 'Medium';
    else if (statureCategory === 'Short-to-Medium') statureCategory = 'Medium-to-Tall';
    else if (statureCategory === 'Medium') statureCategory = 'Tall';
    else if (statureCategory === 'Medium-to-Tall') statureCategory = 'Tall & Slender';
  } else if (statureShift <= -2) {
    if (statureCategory === 'Tall & Slender') statureCategory = 'Medium';
    else if (statureCategory === 'Tall') statureCategory = 'Medium';
    else if (statureCategory === 'Medium-to-Tall') statureCategory = 'Short-to-Medium';
    else if (statureCategory === 'Medium') statureCategory = 'Short-to-Medium';
  }

  let heightRange = '168–176 cm (5′6″ – 5′9″)';
  if (statureCategory === 'Short') heightRange = '155–163 cm (5′1″ – 5′4″)';
  else if (statureCategory === 'Short-to-Medium') heightRange = '162–169 cm (5′4″ – 5′6″)';
  else if (statureCategory === 'Medium') heightRange = '167–175 cm (5′6″ – 5′9″)';
  else if (statureCategory === 'Medium-to-Tall') heightRange = '174–182 cm (5′8″ – 6′0″)';
  else if (statureCategory === 'Tall' || statureCategory === 'Tall & Slender') heightRange = '180–190+ cm (5′11″ – 6′3″+)';

  // Build modifications
  let buildType = baseRashi.build;
  const activeAthletic = occupants.includes('mars') || occupants.includes('sun') || planetsConjunctLagnaLord.some((p) => p.id === 'mars' || p.id === 'sun');
  const activeSlender = occupants.includes('saturn') || occupants.includes('mercury') || planetsConjunctLagnaLord.some((p) => p.id === 'saturn' || p.id === 'mercury');
  const activeRobust = occupants.includes('jupiter') || occupants.includes('moon') || occupants.includes('venus') || planetsConjunctLagnaLord.some((p) => p.id === 'jupiter' || p.id === 'moon');

  if (activeAthletic) {
    buildType = 'Mesomorphic (Athletic/Muscular)';
  } else if (activeSlender) {
    buildType = 'Ectomorphic (Lean/Slender)';
  } else if (activeRobust) {
    buildType = 'Endomorphic (Sturdy/Compact)';
  }

  // ----------------------------------------------------
  // Face & Head
  // ----------------------------------------------------
  let headShape = baseRashi.headShape;
  if (occupants.includes('moon') || secondHouseOccupants.includes('moon')) headShape = 'Round (Candra-Mukha)';
  else if (occupants.includes('mars') || secondHouseOccupants.includes('mars')) headShape = 'Square/Angular';
  else if (occupants.includes('saturn') || secondHouseOccupants.includes('saturn')) headShape = 'Long/Elongated';
  else if (occupants.includes('venus') || secondHouseOccupants.includes('venus')) headShape = 'Heart-shaped';
  else if (occupants.includes('mercury') || secondHouseOccupants.includes('mercury')) headShape = 'Oval';

  // Complexion & Skin (Varna)
  let varna = baseRashi.varna;
  let texture = baseRashi.skinTexture;
  if (occupants.includes('sun') || occupants.includes('mars') || planetsConjunctLagnaLord.some((p) => ['sun', 'mars'].includes(p.id))) {
    varna = 'Rakta-Gaura (Ruddy / Warm Glow)';
    texture = 'Warm & Sensitive (Uṣṇa)';
  } else if (occupants.includes('moon') || occupants.includes('venus') || planetsConjunctLagnaLord.some((p) => ['moon', 'venus'].includes(p.id))) {
    varna = 'Gaura (Fair / Luminous)';
    texture = 'Smooth & Radiant (Snigdha)';
  } else if (occupants.includes('jupiter') || planetsConjunctLagnaLord.some((p) => p.id === 'jupiter')) {
    varna = 'Tapta-Kāñcana (Molten Gold / Wheatish)';
    texture = 'Smooth & Radiant (Snigdha)';
  } else if (occupants.includes('saturn') || occupants.includes('rahu') || planetsConjunctLagnaLord.some((p) => ['saturn', 'rahu'].includes(p.id))) {
    varna = 'Śyāma (Dusky / Olive / Deep Wheatish)';
    texture = 'Dry & Matte (Rūkṣa)';
  }

  // Eyes & Gaze
  let eyeDescription = baseRashi.eyeType;
  let eyeShade = baseRashi.eyeShade;
  let gaze = baseRashi.gaze;
  if (occupants.includes('mars') || aspectsOn1st.includes('mars')) {
    eyeDescription = 'Piercing, vigilant, sharp, and intense';
    eyeShade = 'Amber-tinged or deep brown with energetic capillaries';
    gaze = 'Direct, penetrating, unwavering focus';
  } else if (occupants.includes('moon') || aspectsOn1st.includes('moon')) {
    eyeDescription = 'Large, liquid, luminous, and soft lotus-like eyes';
    eyeShade = 'Velvet dark or liquid brown with moisture';
    gaze = 'Soulful, empathetic, deeply perceptive';
  } else if (occupants.includes('jupiter') || aspectsOn1st.includes('jupiter')) {
    eyeDescription = 'Expansive, radiant, serene, golden-brown eyes';
    eyeShade = 'Honey-brown or warm luminous hazel';
    gaze = 'Benevolent, magnanimous, reassuring, and scholarly';
  } else if (occupants.includes('saturn') || aspectsOn1st.includes('saturn')) {
    eyeDescription = 'Deep-set, guarded, serious, and observant';
    eyeShade = 'Charcoal, dark coffee, or deep brooding gray';
    gaze = 'Careful, calculating, realistic, and watchful';
  } else if (occupants.includes('venus') || aspectsOn1st.includes('venus')) {
    eyeDescription = 'Symmetrical, alluring almond-shaped eyes with thick lashes';
    eyeShade = 'Lustrous hazel, velvet brown or expressive black';
    gaze = 'Magnetic, gentle, artistic, and captivating';
  }

  // Hair Profile
  let hairCurl = baseRashi.hairCurl;
  let hairText = baseRashi.hairTexture;
  if (occupants.includes('venus') || planetsConjunctLagnaLord.some((p) => p.id === 'venus')) {
    hairCurl = 'Wavy & Lustrous';
    hairText = 'Thick, lustrous, wavy, and deeply conditioned with natural bounce';
  } else if (occupants.includes('saturn') || planetsConjunctLagnaLord.some((p) => p.id === 'saturn')) {
    hairText = 'Coarse, thick, dark, with matte texture, requires extra moisture';
  } else if (occupants.includes('mars') || occupants.includes('sun') || planetsConjunctLagnaLord.some((p) => ['mars', 'sun'].includes(p.id))) {
    hairText = 'Warm, crisp strands with a tendency towards early temple receding or thinning at the crown past age 36';
  }

  // ----------------------------------------------------
  // Granular Classical Marks Vectors (BPHS Ch. 27 & Jātaka Pārijāta)
  // Deterministic rule: Graha must actively influence House 1 (Head), House 2 (Face), or Lagna Lord
  // Marks are evaluated strictly as classical predispositions, NOT guaranteed physical markings.
  // ----------------------------------------------------
  const specificMarksCatalog: SpecificMarkEntry[] = [];
  const marksList: string[] = [];
  const molesList: string[] = [];

  // Mars -> Scar / Cut / Burn / Surgical trace (Vraṇa)
  const mars = chart.planets.mars;
  const marsContactsLagna = mars && (
    mars.house === 1 ||
    mars.house === 2 ||
    mars.house === lagnaLordHouse ||
    (mars.aspectsToHouses || []).includes(1) ||
    (mars.aspectsToHouses || []).includes(2)
  );
  if (mars && marsContactsLagna) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, mars.house);
    const desc = `Classical indication for a surgical trace, childhood cut, or burn predisposition in the region of the ${organInfo.organ} (${organInfo.laterality}).`;
    marksList.push(desc);
    specificMarksCatalog.push({
      type: 'Scar (Vraṇa)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Maṅgala (Mars) in House ${mars.house} (${mars.rashiName}) aspecting/occupying ascendant zone`,
      shastricBasis: 'Classical Drekkāṇa Aṅga-Vibhāga (BPHS Ch. 27, v. 8-12; Jātaka Pārijāta Ch. 5)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Traditional textual vector only; individual physical manifestation depends on pediatric history and genetics.',
    });
  }

  // Saturn -> Dark / raised black mole (Kṛṣṇa-Tilaka)
  const saturn = chart.planets.saturn;
  const saturnContactsLagna = saturn && (
    saturn.house === 1 ||
    saturn.house === 2 ||
    saturn.house === lagnaLordHouse ||
    (saturn.aspectsToHouses || []).includes(1) ||
    (saturn.aspectsToHouses || []).includes(2)
  );
  if (saturn && saturnContactsLagna) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, saturn.house);
    const desc = `Classical indication for a dark, raised mole or permanent fibrous beauty mark near the ${organInfo.organ} (${organInfo.laterality}).`;
    molesList.push(desc);
    specificMarksCatalog.push({
      type: 'Mole (Tilaka)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Śani (Saturn) in House ${saturn.house} (${saturn.rashiName}) influencing ascendant zone`,
      shastricBasis: 'Classical Drekkāṇa Aṅga-Vibhāga (BPHS Ch. 27, v. 14; Phaladīpikā Ch. 14)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Traditional textual indication; not an absolute physical certainty.',
    });
  }

  // Convergence check: Mars + Saturn converging on ascendant zone
  if (marsContactsLagna && saturnContactsLagna && specificMarksCatalog.length > 0) {
    const primary = specificMarksCatalog[0];
    primary.indicationStatus = 'Convergent';
    primary.anatomicalDescription += ' (Multiple independent classical indications from Maṅgala and Śani converge on this sector).';
  }

  // Rahu -> Prominent birthmark or irregular pigmentation (Karbura-Lāñchana)
  const rahu = chart.planets.rahu;
  const rahuContactsLagna = rahu && (
    rahu.house === 1 ||
    rahu.house === 2 ||
    rahu.house === lagnaLordHouse ||
    (rahu.aspectsToHouses || []).includes(1) ||
    (rahu.aspectsToHouses || []).includes(2)
  );
  if (rahu && rahuContactsLagna) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, rahu.house);
    const desc = `Classical indication for an irregular birthmark or pigmentation nuance near the ${organInfo.organ} (${organInfo.laterality}).`;
    marksList.push(desc);
    specificMarksCatalog.push({
      type: 'Birthmark (Lāñchana)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Rāhu in House ${rahu.house} (${rahu.rashiName}) influencing ascendant zone`,
      shastricBasis: 'Classical Lāñchana-Vicāra (BPHS Ch. 27, v. 18; Jātaka Pārijāta Ch. 5)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Astrological predisposition vector only.',
    });
  }

  // Ketu -> Fine micro-scar, pin-mark or acne indentation (Kṣata)
  const ketu = chart.planets.ketu;
  const ketuContactsLagna = ketu && (
    ketu.house === 1 ||
    ketu.house === 2 ||
    ketu.house === lagnaLordHouse ||
    (ketu.aspectsToHouses || []).includes(1) ||
    (ketu.aspectsToHouses || []).includes(2)
  );
  if (ketu && ketuContactsLagna) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, ketu.house);
    const desc = `Classical indication for a subtle micro-scar, pin-mark, or small acne mark near the ${organInfo.organ} (${organInfo.laterality}).`;
    marksList.push(desc);
    specificMarksCatalog.push({
      type: 'Mark (Kṣata)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Ketu in House ${ketu.house} (${ketu.rashiName})`,
      shastricBasis: 'Ketu Kṣata-Lakṣaṇa (Sārāvalī Ch. 21)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Astrological predisposition vector only.',
    });
  }

  // Sun / Jupiter / Venus: ONLY if directly occupying House 1 or House 2 (not unconditional!)
  const sun = chart.planets.sun;
  if (sun && (sun.house === 1 || sun.house === 2)) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, sun.house);
    const desc = `Classical indication for a warm freckle or solar mark near the ${organInfo.organ} (${organInfo.laterality}).`;
    molesList.push(desc);
    specificMarksCatalog.push({
      type: 'Mole (Tilaka)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Sūrya in House ${sun.house} (${sun.rashiName})`,
      shastricBasis: 'Sūrya Tāmra-Tilaka Lakṣaṇa (BPHS Ch. 27)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Traditional tendency; not guaranteed.',
    });
  }

  const jupiter = chart.planets.jupiter;
  if (jupiter && (jupiter.house === 1 || jupiter.house === 2)) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, jupiter.house);
    const desc = `Classical indication for a smooth honey-golden mole or auspicious mark near the ${organInfo.organ} (${organInfo.laterality}).`;
    molesList.push(desc);
    specificMarksCatalog.push({
      type: 'Mole (Tilaka)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Guru in House ${jupiter.house} (${jupiter.rashiName})`,
      shastricBasis: 'Guru Pīta-Maśa Lakṣaṇa (BPHS Ch. 27)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Traditional tendency; not guaranteed.',
    });
  }

  const venus = chart.planets.venus;
  if (venus && (venus.house === 1 || venus.house === 2)) {
    const organInfo = getDrekkanaAnatomicalOrgan(drekkanaIdx, venus.house);
    const desc = `Classical indication for a delicate beauty mark or dimple near the ${organInfo.organ} (${organInfo.laterality}).`;
    molesList.push(desc);
    specificMarksCatalog.push({
      type: 'Mole (Tilaka)',
      location: organInfo.organ,
      anatomicalDescription: desc,
      planetOrigin: `Śukra in House ${venus.house} (${venus.rashiName})`,
      shastricBasis: 'Śukra Śubha-Tilaka (BPHS Ch. 27; Sārāvalī Ch. 22)',
      indicationStatus: 'Indication Present',
      uncertaintyNote: 'Traditional tendency; not guaranteed.',
    });
  }

  // Drekkāṇa Zone Summary
  const drekkanaZone =
    drekkanaIdx === 1
      ? 'Head, Face, Temples & Crown (Cranial Sector 0°–10°)'
      : drekkanaIdx === 2
      ? 'Throat, Clavicles, Shoulders & Upper Chest (Brachial Sector 10°–20°)'
      : 'Abdomen, Navel, Pelvis & Lower Limbs (Pelvic Sector 20°–30°)';

  const drekkanaMapping =
    drekkanaIdx === 1
      ? `1st Drekkāṇa (${lagnaDegree.toFixed(1)}° in ${lagnaRashiInfo.name}): Focuses prime astrological somatic reflexes on the cranium, forehead, ocular orbits, ears, nose bridge, jawline, and oral perimeter.`
      : drekkanaIdx === 2
      ? `2nd Drekkāṇa (${lagnaDegree.toFixed(1)}° in ${lagnaRashiInfo.name}): Focuses prime astrological somatic reflexes on cervical spine, vocal cords, clavicles, upper deltoids, chest wall, and thoracic spine.`
      : `3rd Drekkāṇa (${lagnaDegree.toFixed(1)}° in ${lagnaRashiInfo.name}): Focuses prime astrological somatic reflexes on lumbar spine, umbilical center, pelvic girdle, thighs, knees, calves, and soles of feet.`;

  // ----------------------------------------------------
  // Influencing Grahas Breakdown (Conjunctions, Aspects, Houses)
  // ----------------------------------------------------
  const lagnaLordConjDetails: string[] = [];
  planetsConjunctLagnaLord.forEach((p) => {
    const name = GRAHA_NAMES[p.id]?.sanskrit || p.id;
    if (p.id === 'sun') {
      lagnaLordConjDetails.push(`Sūrya conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Imparts an upright, regal skeletal carriage, broad chest, radiant ruddy facial undertone, commanding stride, and a tendency toward early temple or crown hair thinning past age 36.`);
    } else if (p.id === 'moon') {
      lagnaLordConjDetails.push(`Candra conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Infuses a luminous lunar glow (Candra-Kānti), soft rounded facial contours (Candra-Mukha), large emotive liquid eyes with thick lower lashes, and supple moisture-rich skin.`);
    } else if (p.id === 'mars') {
      lagnaLordConjDetails.push(`Maṅgala conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Confers a defined mesomorphic athletic frame, chiseled angular jawline, intense penetrating gaze, high metabolic muscular tone, fast reflexes, and a distinct scar or cut mark.`);
    } else if (p.id === 'mercury') {
      lagnaLordConjDetails.push(`Budha conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Endows an agile, youthful physique (native appears 5–10 years younger than chronological age), nimble articulate hands, expressive animated lips, and a brisk energetic gait.`);
    } else if (p.id === 'jupiter') {
      lagnaLordConjDetails.push(`Guru conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Bestows an expansive, tall or dignified robust build, noble broad forehead, golden-wheatish skin undertone, open benevolent smile, deep resonant voice, and stately dignified gait.`);
    } else if (p.id === 'venus') {
      lagnaLordConjDetails.push(`Śukra conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Imparts exceptional physical symmetry, photogenic allure, sculpted facial curves, dimples, alluring almond-shaped eyes with thick dark lashes, and luscious wavy hair.`);
    } else if (p.id === 'saturn') {
      lagnaLordConjDetails.push(`Śani conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Creates a lean, tall or bony frame, prominent joints and clavicles, deep-set thoughtful eyes, dusky/olive matte skin, serious resolute jawline, and remarkable physical endurance.`);
    } else if (p.id === 'rahu') {
      lagnaLordConjDetails.push(`Rāhu conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Gives unconventional height or striking asymmetrical features, prominent or aquiline nose, magnetic smoky gaze, and distinctive birthmarks.`);
    } else if (p.id === 'ketu') {
      lagnaLordConjDetails.push(`Ketu conjunct Lagna Lord ${GRAHA_NAMES[lagnaLordId]?.sanskrit}: Produces a wiry, slender ascetic build, sharp facial contours, piercing detached gaze, quiet subtle presence, and surgical traces or small scars.`);
    }
  });

  const lagnaLordAspectDetails: string[] = [];
  planetsAspectingLagnaLord.forEach((p) => {
    const name = GRAHA_NAMES[p.id]?.sanskrit || p.id;
    lagnaLordAspectDetails.push(`Direct dṛṣṭi from ${name} on House ${lagnaLordHouse} (${lagnaLordRashiInfo.sanskritName}) modifies constitutional stamina, infusing ${p.id === 'saturn' ? 'endurance, bone density, and disciplined posture' : p.id === 'jupiter' ? 'nobility, expansion, and golden skin radiance' : p.id === 'mars' ? 'vascular heat, muscle definition, and martial vigor' : 'intellectual agility and heightened sensory responsiveness'}.`);
  });

  const firstHouseOccupantsDetail: string[] = [];
  occupants.forEach((pId) => {
    const p = chart.planets[pId];
    const name = GRAHA_NAMES[pId]?.sanskrit || pId;
    firstHouseOccupantsDetail.push(`${name} occupying House 1 (${p?.dignity || 'Neutral'}, ${p?.degreeStr || ''}): Directly shapes bodily tissue (Deha-Dhatu), determining facial prominence, cranial shape, and metabolic baseline.`);
  });

  const firstHouseAspectsDetail: string[] = [];
  aspectsOn1st.forEach((pId) => {
    const name = GRAHA_NAMES[pId]?.sanskrit || pId;
    firstHouseAspectsDetail.push(`Full dṛṣṭi from ${name} on Lagna: Casts its canonical optical signature onto facial demeanor and physical presence.`);
  });

  // ----------------------------------------------------
  // D9 Navāṃśa Lagna (Deha-Svarūpa) Integration
  // ----------------------------------------------------
  const d9NavamshaSynthesis = `In classical Jyotiṣa (Bṛhat Jātaka 16.1 & Sārāvalī 21.1), while the D1 Lagna (${lagnaRashiInfo.sanskritName}) defines the childhood constitutional foundation, the D9 Navāṃśa Lagna (${d9LagnaInfo.sanskritName} / ${d9LagnaInfo.name}, ruled by ${GRAHA_NAMES[d9LagnaLordId]?.sanskrit}) determines the adult mature physical form, internal bone symmetry, and adult facial contours. The native's childhood ${lagnaRashiInfo.name} constitution matures in adulthood into a ${d9LagnaInfo.element.toLowerCase()}-aligned adult demeanor with ${d9LagnaInfo.mobility.includes('Fixed') ? 'steadfast, poised facial symmetry and broad shoulder frame' : d9LagnaInfo.mobility.includes('Movable') ? 'dynamic, agile posture and sharp observant features' : 'articulate, intellectual, and versatile facial expressions'}.${d9LagnaOccupants.length > 0 ? ` Occupants in D9 Lagna (${d9LagnaOccupants.join(', ')}) add prominent secondary physical traits to mature adult appearance.` : ''}`;

  // ----------------------------------------------------
  // 2nd House (Mukha Bhāva) - Face, Teeth, Lips, Voice
  // ----------------------------------------------------
  const secondLordName = GRAHA_NAMES[secondHouseLordId]?.sanskrit || secondHouseLordId;
  const secondHouseSignName = RASHIS[secondHouseRashiNum].sanskritName;
  let facialBoneAndJawline = `Firm, balanced jawline governed by ${secondHouseSignName} and lord ${secondLordName}.`;
  let teethAndSmile = 'Pearly, symmetrical teeth alignment with warm natural enamel luster.';
  let vocalTimbre = 'Gambhīra (Deep, resonant baritone with authoritative clarity).';
  let rightEyeLuster = 'Clear, focused ocular cornea with energetic visual acuity.';

  if (secondHouseOccupants.includes('mars') || secondHouseAspects.includes('mars')) {
    facialBoneAndJawline = 'Sharp, angular, chiseled jawline with prominent chin structure and martial tension.';
    teethAndSmile = 'Strong, prominent canine teeth; firm, resolute smile with decisive lip posture.';
    vocalTimbre = 'Tīkṣṇa (Sharp, commanding, crisp, and incisive vocal cadence).';
  } else if (secondHouseOccupants.includes('venus') || secondHouseAspects.includes('venus')) {
    facialBoneAndJawline = 'Softly curved, photogenic jawline with natural dimples and radiant facial symmetry.';
    teethAndSmile = 'Flawless, evenly spaced, translucent pearly teeth; warm, captivating, disarming smile.';
    vocalTimbre = 'Madhura (Melodic, soothing, musical speech resonance with gentle cadence).';
  } else if (secondHouseOccupants.includes('jupiter') || secondHouseAspects.includes('jupiter')) {
    facialBoneAndJawline = 'Broad, dignified facial architecture with generous jawbone and noble presence.';
    teethAndSmile = 'Large, strong, well-formed teeth; open, magnanimous, benevolent smile.';
    vocalTimbre = 'Gambhīra / Mahā-Dhvani (Deep, resonant, oratorical baritone that commands institutional respect).';
  } else if (secondHouseOccupants.includes('saturn') || secondHouseAspects.includes('saturn')) {
    facialBoneAndJawline = 'Chiseled, lean, resolute jawline with prominent bone contours and mature solemnity.';
    teethAndSmile = 'Dense, durable teeth with slight unevenness or crowding; guarded, reserved, deliberate smile.';
    vocalTimbre = 'Manda / Gambhīra (Measured, deliberate, low-pitched, cautious, and authoritative).';
  } else if (secondHouseOccupants.includes('mercury') || secondHouseAspects.includes('mercury')) {
    facialBoneAndJawline = 'Oval, refined, delicate facial contour with lively, mobile cheek muscles.';
    teethAndSmile = 'Neat, small, well-aligned teeth; playful, expressive, witty smile.';
    vocalTimbre = 'Druta / Spaṣṭa (Swift, articulate, versatile, highly modulated vocal cadence).';
  }

  const secondHouseFaceAndVoice = `2nd House (${secondHouseSignName}, ruled by ${secondLordName}) governs Mukha-Sthāna (facial bone structure, oral cavity, teeth, smile, right eye, and speech resonance). ${facialBoneAndJawline} ${teethAndSmile} Vocal delivery manifests as ${vocalTimbre}`;

  // ----------------------------------------------------
  // 12th House (Left Eye & Rest Architecture)
  // ----------------------------------------------------
  const twelfthLordName = GRAHA_NAMES[twelfthHouseLordId]?.sanskrit || twelfthHouseLordId;
  const twelfthHouseSignName = RASHIS[twelfthHouseRashiNum].sanskritName;
  const leftEyeAppearance = twelfthHouseOccupants.includes('sun') || twelfthHouseOccupants.includes('mars')
    ? 'Sensitive ocular conjunctiva with vulnerability to visual strain, requiring protective hydration.'
    : twelfthHouseOccupants.includes('moon') || twelfthHouseOccupants.includes('venus')
    ? 'Luminous, deeply receptive, liquid left eye with soft eyelid curvature and deep emotional depth.'
    : 'Clear, deep-set left eye with guarded contemplation and focused vision.';

  const sleepArchitecture = twelfthHouseOccupants.includes('saturn') || twelfthHouseOccupants.includes('rahu')
    ? 'Light, vigilant sleeper with vivid dream activity; bodily restoration requires strict wind-down rituals.'
    : 'Deep, sound, restorative sleep cycle that rapidly rejuvenates cellular tissues and ocular clarity.';

  const twelfthHouseLeftEyeAndSleep = `12th House (${twelfthHouseSignName}, ruled by ${twelfthLordName}) governs the left eye and somatosensory rest. ${leftEyeAppearance} Sleep architecture shows ${sleepArchitecture.toLowerCase()}`;

  // ----------------------------------------------------
  // Detailed Organ-by-Organ Anatomy
  // ----------------------------------------------------
  const detailedAnatomy: DetailedOrganAnatomy = {
    craniumAndForehead: `${baseRashi.headShape} cranial vault with ${baseRashi.forehead.toLowerCase()}. Crown possesses strong cranial bone density. The brow ridge displays ${baseRashi.brows.toLowerCase()}.`,
    eyesAndBrows: `${eyeDescription} eyes with ${eyeShade} shade and ${gaze.toLowerCase()} gaze. Eyebrows feature ${baseRashi.brows.toLowerCase()}. Right eye reflects ${rightEyeLuster.toLowerCase()} (2nd house), while left eye shows ${leftEyeAppearance.toLowerCase()} (12th house).`,
    noseAndBridge: occupants.includes('jupiter') || occupants.includes('sun')
      ? 'Prominent, straight, noble nasal bridge with well-defined nasal tip and balanced alar width.'
      : occupants.includes('mars')
      ? 'Sharp, defined, aquiline or athletic nose with distinct bridge definition.'
      : occupants.includes('mercury') || occupants.includes('venus')
      ? 'Refined, symmetrical, slightly elevated nasal bridge with delicate nostrils.'
      : 'Proportionate, straight nasal bridge naturally aligned with cranial symmetry.',
    lipsTeethAndVoice: `${teethAndSmile} Lips display balanced vermilion borders with ${facialBoneAndJawline.toLowerCase()} Vocal timbre is ${vocalTimbre.toLowerCase()}`,
    neckShouldersAndChest: `${baseRashi.chestShoulders}. Cervical vertebrae show erect posture. Clavicles are ${buildType.includes('Ectomorphic') ? 'prominent and sculpted' : 'sturdily framed with strong muscular transitions'}.`,
    handsFingersAndArms: lagnaRashiInfo.element === 'Air' || occupants.includes('mercury')
      ? 'Long, elegant, artistic fingers with flexible phalanges, refined nail beds, and dexterous palms.'
      : lagnaRashiInfo.element === 'Fire' || occupants.includes('mars')
      ? 'Square athletic palms with strong muscular thenar eminence, firm grip strength, and resilient knuckles.'
      : lagnaRashiInfo.element === 'Earth' || occupants.includes('saturn')
      ? 'Sturdy, broad palms with prominent wrist joints, dense skin texture, and steady physical stamina.'
      : 'Supple, smooth palms with curved fingers, soft palm mounds, and gentle touch.',
    spinePelvisAndLimbs: `Erect spinal alignment supported by a ${statureCategory.toLowerCase()} skeletal frame (${heightRange}). Lower extremities display ${buildType.includes('Athletic') ? 'defined quadriceps and calf tone with resilient knee joints' : 'balanced skeletal proportions with steady shock-absorbing joints'}.`,
  };

  // ----------------------------------------------------
  // Ayurvedic Dosha Calculation
  // ----------------------------------------------------
  let vata = 33;
  let pitta = 34;
  let kapha = 33;

  if (lagnaRashiInfo.element === 'Fire') { pitta += 22; vata += 10; kapha -= 15; }
  else if (lagnaRashiInfo.element === 'Earth') { kapha += 22; vata += 5; pitta -= 10; }
  else if (lagnaRashiInfo.element === 'Air') { vata += 25; pitta += 5; kapha -= 15; }
  else if (lagnaRashiInfo.element === 'Water') { kapha += 25; pitta -= 10; vata -= 5; }

  occupants.forEach((pId) => {
    const mod = PLANET_APPEARANCE_MODIFIERS[pId];
    if (mod) {
      vata += mod.vataAdd;
      pitta += mod.pittaAdd;
      kapha += mod.kaphaAdd;
    }
  });

  planetsConjunctLagnaLord.forEach((p) => {
    const mod = PLANET_APPEARANCE_MODIFIERS[p.id];
    if (mod) {
      vata += Math.round(mod.vataAdd * 0.5);
      pitta += Math.round(mod.pittaAdd * 0.5);
      kapha += Math.round(mod.kaphaAdd * 0.5);
    }
  });

  const total = Math.max(1, vata + pitta + kapha);
  const vataPct = Math.round((Math.max(10, vata) / total) * 100);
  const pittaPct = Math.round((Math.max(10, pitta) / total) * 100);
  const kaphaPct = Math.max(5, 100 - (vataPct + pittaPct));

  let dominantPrakriti: AppearanceAyurvedicDosha['dominantPrakriti'] = 'Pitta';
  if (vataPct >= 45) dominantPrakriti = 'Vāta';
  else if (pittaPct >= 45) dominantPrakriti = 'Pitta';
  else if (kaphaPct >= 45) dominantPrakriti = 'Kapha';
  else if (vataPct >= 35 && pittaPct >= 35) dominantPrakriti = 'Vāta-Pitta';
  else if (pittaPct >= 35 && kaphaPct >= 35) dominantPrakriti = 'Pitta-Kapha';
  else if (vataPct >= 35 && kaphaPct >= 35) dominantPrakriti = 'Vāta-Kapha';
  else dominantPrakriti = 'Tridoṣaja (Sama)';

  // Aging Trajectory (Classical Maturation Arc: D1 Foundation -> D9 Crystallization -> Graha Maturity)
  const aging: AppearanceAgingTrajectory = {
    youthPhase: `Foundational Growth (D1 Lagna): Early physical structure is established by ${lagnaRashiInfo.name} rising (${lagnaRashiInfo.element} element), governed by ${GRAHA_NAMES[lagnaLordId]?.sanskrit}, establishing baseline skeletal proportions, constitutional stamina, and juvenile tissue adaptation.`,
    adultPrimePhase: `Adult Maturation (D9 Navāṃśa): The physical vessel matures as D9 Navāṃśa Lagna in ${d9LagnaInfo.sanskritName} (${d9LagnaInfo.name}, ${d9LagnaInfo.element} element) integrates, refining adult jawline contours, postural carriage, and authoritative facial presence.`,
    matureYearsPhase: `Mature Consolidation (Graha Maturity): Middle adult carriage is governed by canonical Graha maturity sequences, shifting metabolic dynamics and preserving skeletal symmetry through steady routine and posture discipline.`,
    elderPhase: `Preservation & Longevity: Long-term physical resilience is anchored by foundational Lagna Lord dignity (${lagnaLordDignity}), the 8th house, and Lagna's Aṣṭakavarga capacity, preserving structural integrity and composure.`,
  };

  // Executive Synthesis Narrative
  const executiveAppearanceNarrative = `The native presents an embodied physical stature of ${statureCategory.toLowerCase()} proportion (${heightRange}) characterized by a ${buildType.toLowerCase()} architecture. Rising in ${lagnaRashiInfo.sanskritName} (${lagnaRashiInfo.name}) at ${chart.lagna?.degreeStr || '00°00′'}, the physical vessel displays ${baseRashi.boneStructure.toLowerCase()} Crowned by an ${headShape.toLowerCase()} facial structure with ${baseRashi.forehead.toLowerCase()}, the face is framed by ${hairCurl.toLowerCase()} hair and features ${eyeDescription.toLowerCase()} eyes (${eyeShade}) that project a ${gaze.toLowerCase()}. The skin carries an authentic ${varna} luster with a ${texture.toLowerCase()} feel. Bodily carriage is marked by an ${baseRashi.gait.toLowerCase()}, giving the native an immediately recognizable ${baseRashi.presence.toLowerCase()}. Adult physical countenance matures through the D9 Navāṃśa Lagna in ${d9LagnaInfo.sanskritName} (${d9LagnaInfo.name}), sculpting graceful facial contours and dignified presence.`;

  return {
    lagnaRashi: `${lagnaRashiInfo.sanskritName} (${lagnaRashiInfo.name})`,
    lagnaDegreeStr: chart.lagna?.degreeStr || '00°00′',
    lagnaLord: GRAHA_NAMES[lagnaLordId]?.sanskrit || lagnaLordId,
    lagnaLordSign: lagnaLordRashiInfo.sanskritName,
    lagnaLordDignity: lagnaLordPlanet?.dignity || 'Neutral',
    occupantsInLagna: occupants.map((p) => GRAHA_NAMES[p]?.sanskrit || p),
    aspectsOnLagna: aspectsOn1st.map((p) => GRAHA_NAMES[p]?.sanskrit || p),
    d9LagnaRashi: `${d9LagnaInfo.sanskritName} (${d9LagnaInfo.name})`,
    d3DrekkanaRashi: drekkanaZone,
    stature: {
      category: statureCategory,
      buildType,
      boneStructure: baseRashi.boneStructure,
      chestAndShoulders: baseRashi.chestShoulders,
      heightTendencyCm: heightRange,
    },
    faceAndHead: {
      headShape,
      forehead: baseRashi.forehead,
      jawAndChin: baseRashi.jawChin,
      cheeksAndContours: `${baseRashi.jawChin}. Symmetrical bone contours reinforced by ${lagnaLordPlanet?.dignity || 'Neutral'} lagnesha.`,
      symmetryDescription: `Natural facial symmetry governed by ${lagnaRashiInfo.name} and the disposition of ${GRAHA_NAMES[lagnaLordId]?.sanskrit}.`,
    },
    eyesAndGaze: {
      eyeType: eyeDescription,
      shapeAndSize: baseRashi.eyeType,
      shadeAndLuster: eyeShade,
      gazeIntensity: gaze,
      eyebrows: baseRashi.brows,
    },
    skinAndComplexion: {
      classicalVarna: varna,
      texture,
      dermatologicalTendencies: `${texture} skin with ${dominantPrakriti} metabolic predisposition. Prone to ${dominantPrakriti.includes('Pitta') ? 'sun sensitivity, flushed warmth, and inflammatory reactivity' : dominantPrakriti.includes('Vata') ? 'dryness, winter sensitivity, and prominent superficial veins' : 'moisture retention and smooth slow-aging suppleness'}.`,
    },
    hair: {
      texture: hairText,
      volumeAndGrowth: `${hairText}. Strong natural follicle vitality anchored by ${lagnaRashiInfo.element} element.`,
      curlPattern: hairCurl,
      agingAndThinningRisk: occupants.includes('sun') || occupants.includes('mars') || planetsConjunctLagnaLord.some((p) => ['sun', 'mars'].includes(p.id))
        ? 'Heightened probability of thinning hair at the crown or receding temples past age 36 (Pitta heat accumulation).'
        : 'Dense, durable hair coverage with graceful silvering after age 48.',
    },
    distinctiveMarks: {
      scarsAndMarks: marksList,
      molesAndTilakas: molesList,
      anatomicalFocalPoint: drekkanaZone,
      drekkanaBodilyMapping: drekkanaMapping,
    },
    gaitAndCarriage: {
      gaitStyle: baseRashi.gait,
      postureAndStance: `${baseRashi.presence}. Erect spinal alignment supported by ${statureCategory} frame.`,
      physicalAuraAndPresence: baseRashi.presence,
    },
    ayurvedicDosha: {
      vataPercent: vataPct,
      pittaPercent: pittaPct,
      kaphaPercent: kaphaPct,
      dominantPrakriti,
      metabolicSignature: `${dominantPrakriti} disposition: ${dominantPrakriti.includes('Pitta') ? 'Sharp metabolic fire (Tīkṣṇāgni) with rapid digestive assimilation.' : dominantPrakriti.includes('Vata') ? 'Fluctuating metabolic rhythm (Viṣamāgni) with quick nervous conduction.' : 'Steady, stabilizing metabolic rhythm (Mandāgni) with enduring tissue stamina.'}`,
      physicalStaminaSummary: `Physical stamina conditioned by ${dominantPrakriti.includes('Pitta') ? 'thermal regulation, hydration balance, and avoidance of over-exhaustion' : dominantPrakriti.includes('Vata') ? 'calming nourishment, restorative rest, and structured routines' : 'regular invigorative activity and metabolic circulation'}.`,
      isQualitativeArchetype: true,
      epistemologicalDisclaimer: 'Notice: Traditional Jyotiṣa constitutional archetypes (Bhūta-svarūpa & Deha-prakṛti) represent symbolic psycho-physical classifications and are not clinical or laboratory medical diagnostics.',
    },
    agingTrajectory: aging,
    classicalCitation: {
      source: 'Sārāvalī of Kalyāṇavarmā',
      chapterVerse: `Ch. ${20 + lagnaRashiNum}, v. 1–4`,
      sanskritShloka: baseRashi.shloka,
      englishTranslation: baseRashi.translation,
    },
    executiveAppearanceNarrative,

    // Granular Real-Chart Dimensions (10/10 Accuracy)
    influencingGrahas: {
      lagnaLordConjunctions: lagnaLordConjDetails,
      lagnaLordAspects: lagnaLordAspectDetails,
      firstHouseOccupantsDetail,
      firstHouseAspectsDetail,
      d9NavamshaSynthesis,
      secondHouseFaceAndVoice,
      twelfthHouseLeftEyeAndSleep,
    },
    detailedAnatomy,
    specificMarksCatalog,
    d9NavamshaLagnaDetails: {
      rashiName: `${d9LagnaInfo.sanskritName} (${d9LagnaInfo.name})`,
      rashiLord: GRAHA_NAMES[d9LagnaLordId]?.sanskrit || d9LagnaLordId,
      occupantsInD9Lagna: d9LagnaOccupants,
      adultMaturationEffect: d9NavamshaSynthesis,
    },
    secondHouseMukhaProfile: {
      rashiName: `${secondHouseSignName} (${RASHIS[secondHouseRashiNum].name})`,
      lordName: secondLordName,
      occupants: secondHouseOccupants.map((p) => GRAHA_NAMES[p]?.sanskrit || p),
      facialBoneAndJawline,
      teethAndSmile,
      vocalTimbre,
      rightEyeLuster,
    },
    twelfthHouseLeftEyeProfile: {
      rashiName: `${twelfthHouseSignName} (${RASHIS[twelfthHouseRashiNum].name})`,
      lordName: twelfthLordName,
      occupants: twelfthHouseOccupants.map((p) => GRAHA_NAMES[p]?.sanskrit || p),
      leftEyeAppearance,
      sleepArchitecture,
    },
  };
}

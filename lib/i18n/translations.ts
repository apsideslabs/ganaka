import { PlatformLanguage } from '@/lib/settings/types';

export interface TranslationDictionary {
  nav: {
    home: string;
    panchanga: string;
    about: string;
    research: string;
    documentation: string;
    workspace: string;
    settings: string;
    enterWorkspace: string;
    closeMenu: string;
  };
  header: {
    descriptor: string;
    settingsTitle: string;
  };
  hero: {
    statusBarTitle: string;
    epigraph: string; // Stays same Sanskrit shloka across all languages
    title: string;
    subtitle: string;
    ctaEnterDetails: string;
    ctaViewPanchanga: string;
    ctaResearch: string;
    verifiedCities: string;
  };
  birthPanel: {
    title: string;
    subtitle: string;
    chartNameLabel: string;
    chartNamePlaceholder: string;
    birthplaceLabel: string;
    birthplacePlaceholder: string;
    useDefaultLocation: string;
    dobLabel: string;
    tobLabel: string;
    quickFillGochar: string;
    requiredNotice: string;
    birthplaceField: string;
    dobField: string;
    tobField: string;
    calculateBtn: string;
    calculatingBtn: string;
    fillRequiredBtn: string;
    settingsTitle: string;
    settingsSubtitle: string;
    ayanamshaSystem: string;
    houseSystemLabel: string;
    customCoordsToggle: string;
    latLabel: string;
    lngLabel: string;
    tzLabel: string;
  };
  features: {
    sectionTitle: string;
    sectionSubtitle: string;
    astronomicalRigorTitle: string;
    astronomicalRigorDesc: string;
    classicalMechanicsTitle: string;
    classicalMechanicsDesc: string;
    sixteenVargasTitle: string;
    sixteenVargasDesc: string;
    muhurtaEngineTitle: string;
    muhurtaEngineDesc: string;
    sourceTransparencyTitle: string;
    sourceTransparencyDesc: string;
    regionalTraditionsTitle: string;
    regionalTraditionsDesc: string;
  };
  about: {
    title: string;
    subtitle: string;
    introParagraph: string;
    principlesTitle: string;
    roadmapTitle: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
    p5Title: string;
    p5Desc: string;
    p6Title: string;
    p6Desc: string;
    p7Title: string;
    p7Desc: string;
  };
  research: {
    title: string;
    subtitle: string;
    introParagraph: string;
    area1Title: string;
    area1Desc: string;
    area2Title: string;
    area2Desc: string;
    area3Title: string;
    area3Desc: string;
    area4Title: string;
    area4Desc: string;
    area5Title: string;
    area5Desc: string;
  };
  documentation: {
    title: string;
    subtitle: string;
    introParagraph: string;
    secOverviewTitle: string;
    secOverviewSubtitle: string;
    secOverviewContent: string;
    secArchitectureTitle: string;
    secArchitectureSubtitle: string;
    secArchitectureContent: string;
    secPhilosophyTitle: string;
    secPhilosophySubtitle: string;
    secPhilosophyContent: string;
    secSourcesTitle: string;
    secSourcesSubtitle: string;
    secSourcesContent: string;
    secMethodsTitle: string;
    secMethodsSubtitle: string;
    secMethodsContent: string;
  };
  footer: {
    tagline: string;
    productHeading: string;
    researchHeading: string;
    documentationHeading: string;
    aboutHeading: string;
    copyrightText: string;
    sanskritEpigraph: string; // Sanskrit stays authentic
  };
  settingsModal: {
    title: string;
    subtitle: string;
    tabAyanamsha: string;
    tabLocation: string;
    tabLanguage: string;
    tabDisplay: string;
    savedNotice: string;
    resetBtn: string;
    doneBtn: string;
    languageSelectorTitle: string;
    languageSelectorDesc: string;
    locationSearchTitle: string;
    locationSearchDesc: string;
    customCoordsToggle: string;
    presetLocationsTitle: string;
    activeDefaultLocation: string;
  };
}

export const TRANSLATIONS: Record<PlatformLanguage, TranslationDictionary> = {
  english: {
    nav: {
      home: 'Home',
      panchanga: 'Pañcāṅga',
      about: 'About',
      research: 'Research',
      documentation: 'Documentation',
      workspace: 'Workspace',
      settings: 'Settings',
      enterWorkspace: 'Enter Workspace',
      closeMenu: 'Close Menu',
    },
    header: {
      descriptor: 'Jyotiṣa Calculation & Research',
      settingsTitle: 'Platform Settings & Preferences',
    },
    hero: {
      statusBarTitle: 'Gaṇaka Sidereal Workstation',
      epigraph: 'सिद्धांते गणितं प्रधानम् • Classical Mathematical Astronomy',
      title: 'Precision Sidereal Ephemeris & Classical Jyotiṣa Engine',
      subtitle:
        'Deterministic astronomical kinematics, 16 harmonic Ṣoḍaśavargas (D1–D60), Viṃśottarī timelines, and canonical Muhūrta election algorithms directly grounded in Sanskrit Siddhānta treatises.',
      ctaEnterDetails: 'Enter Chart Details Below',
      ctaViewPanchanga: 'View Daily Pañcāṅga',
      ctaResearch: 'Explore Classical Research',
      verifiedCities: '400+ Geodetic Anchors',
    },
    birthPanel: {
      title: 'Enter Birth Horoscope Details',
      subtitle: 'High-precision geodetic ephemeris, topocentric ascendant & vargas',
      chartNameLabel: 'Chart Title / Native Name',
      chartNamePlaceholder: 'e.g. Śrī Rāma, Research Horoscope 01',
      birthplaceLabel: 'Birthplace (City / Geodetic Anchor)',
      birthplacePlaceholder: 'Search city (e.g. Ujjain, Varanasi, Guwahati, Delhi...)',
      useDefaultLocation: 'Use Default Location',
      dobLabel: 'Date of Birth',
      tobLabel: 'Time of Birth',
      quickFillGochar: 'Quick Fill: Current Transits (Gochar)',
      requiredNotice: 'Parameters required:',
      birthplaceField: 'Birthplace',
      dobField: 'Date of Birth',
      tobField: 'Time of Birth',
      calculateBtn: 'Calculate Ephemeris & Open Workspace',
      calculatingBtn: 'Calculating Ephemeris & Opening Workstation...',
      fillRequiredBtn: 'Specify Geographic Location, Date & Time to Calculate',
      settingsTitle: 'Calculation Settings',
      settingsSubtitle: 'Ephemeris standard & coordinate system',
      ayanamshaSystem: 'Ayanāṃśa System',
      houseSystemLabel: 'Bhava Chalit House System',
      customCoordsToggle: 'Custom Geodetic Coordinates',
      latLabel: 'Latitude (°N / °S)',
      lngLabel: 'Longitude (°E / °W)',
      tzLabel: 'Timezone Offset (Hours)',
    },
    features: {
      sectionTitle: 'Foundational Calculation Architecture',
      sectionSubtitle:
        'Engineered to meet the exact mathematical rigor of classical Siddhāntas without numerical shortcuts.',
      astronomicalRigorTitle: 'Astronomical Precision',
      astronomicalRigorDesc:
        'Sub-arcsecond accuracy utilizing IAU-1980 nutation series and VSOP87 planetary kinematic solutions.',
      classicalMechanicsTitle: 'Classical Parāśari Mechanics',
      classicalMechanicsDesc:
        'Faithful implementation of Bṛhat Parāśara Horā Śāstra principles, Śadbala calculation, and Bhāva Chalit cusps.',
      sixteenVargasTitle: 'Harmonic Ṣoḍaśavargas (D1–D60)',
      sixteenVargasDesc:
        'Complete 16 harmonic divisions computed strictly in accordance with classical Parāśari algorithms.',
      muhurtaEngineTitle: 'Canonical Muhūrta Matrix',
      muhurtaEngineDesc:
        'Comprehensive auspiciousness evaluation incorporating Tithi, Vāra, Nakṣatra, Yoga, and Karaṇa.',
      sourceTransparencyTitle: 'Textual Source Traceability',
      sourceTransparencyDesc:
        'Every calculation rule, threshold, and formula cites its chapter and verse in classical Sanskrit literature.',
      regionalTraditionsTitle: 'Regional Astronomical Traditions',
      regionalTraditionsDesc:
        'Support for regional variations including Assamese, Bengali, Kerala, and Mithila calendrical traditions.',
    },
    about: {
      title: 'About Gaṇaka',
      subtitle:
        'A computational environment for studying, calculating, and inspecting traditional Jyotiṣa systems with mathematical rigor and source transparency.',
      introParagraph:
        'Gaṇaka is built for scholars, astrologers, and researchers who demand uncompromising mathematical accuracy, traceable shastric sources, and an intuitive modern workspace.',
      principlesTitle: 'Core Engineering Principles',
      roadmapTitle: 'Platform Architecture & Phases',
      p1Title: 'Accuracy of Calculation',
      p1Desc:
        'Sub-arcsecond astronomical precision, robust ephemeris models, and exact spherical trigonometric implementations without crude approximations.',
      p2Title: 'Source Transparency',
      p2Desc:
        'Every calculation rule, division method, and interpretation parameter is directly traceable to specific classical treatises, chapters, and shlokas.',
      p3Title: 'Modularity',
      p3Desc:
        'Decoupled architecture separating astronomical ephemeris computation, coordinate conversions, Jyotiṣa division algorithms, and research tooling.',
      p4Title: 'Reproducibility & Verification',
      p4Desc:
        'Every output can be mathematically audited and reproduced with clear step-by-step intermediate variables and parameter inspection.',
      p5Title: 'Respect for Regional Traditions',
      p5Desc:
        'Honoring regional variations—such as Assamese, Bengali, Kerala, and Tamil calendrical and chart traditions—without forcing homogenized assumptions.',
      p6Title: 'No Fabricated Sources',
      p6Desc:
        'Strict scholarly integrity: unverified claims, internet folklore, or modern commercial additions are never passed off as classical source material.',
      p7Title: 'No Hidden Rule Changes',
      p7Desc:
        'Zero algorithmic opacity. Users and researchers will always know precisely which Ayanāṃśa, node model, sunrise definition, or house system is active.',
    },
    research: {
      title: 'Classical Research & Source Lineage',
      subtitle:
        'Connecting computational algorithms directly with primary Sanskrit manuscripts and shastric provenance.',
      introParagraph:
        'The research layer serves as an auditable bridge between modern computational mathematics and primary Sanskrit treatises.',
      area1Title: 'Classical Texts & Manuscripts',
      area1Desc:
        'Cataloging primary Sanskrit astronomical and astrological treatises with canonical shloka indexing and critical editions.',
      area2Title: 'Rule Provenance & Lineage',
      area2Desc:
        'Mapping computational formulas and algorithmic decision trees back to specific classical verses.',
      area3Title: 'Astronomical Models & Historical Theories',
      area3Desc:
        'Comparative study between historical siddhāntic astronomy, medieval computational tables, and modern planetary ephemerides.',
      area4Title: 'Calculation Methods & Standardizations',
      area4Desc:
        'Auditing differences among Ayanāṃśa formulations, true vs. mean lunar nodes, sunrise definitions, and spherical horizon projections.',
      area5Title: 'Regional Traditions & Specialized Systems',
      area5Desc:
        'Dedicated inquiry into distinct regional practices, with special focus on Assamese, Bengali, Kerala, and Tamil Jyotiṣa literature.',
    },
    documentation: {
      title: 'Documentation & Technical Specifications',
      subtitle:
        'Technical foundations, calculation philosophy, and coordinate conventions of the Gaṇaka platform.',
      introParagraph:
        'Gaṇaka is architected as an open, inspectable computational environment for traditional Jyotiṣa and astronomy.',
      secOverviewTitle: 'System Overview',
      secOverviewSubtitle: 'Architecture and design philosophy',
      secOverviewContent:
        'Gaṇaka separates astronomical ephemeris computation, spherical coordinate reduction, classical Jyotiṣa division algorithms, and research visualizers into distinct, audited layers.',
      secArchitectureTitle: 'Layered Pipeline',
      secArchitectureSubtitle: 'Four discrete tiers of execution',
      secArchitectureContent:
        '1. Geodetic & Ephemeris Core: High-precision celestial coordinates and planetary longitudes.\n2. Mathematical Transform Layer: Obliquity, sidereal Ayanāṃśa reduction, Lagna and house cusps.\n3. Jyotiṣa Engine: Vargas (D1–D60), Daśā timelines, Aṣṭakavarga matrices, and planetary dignities.\n4. Source Attribution & UI: Visual charts, tabular outputs, and direct citations linking back to Sanskrit shlokas.',
      secPhilosophyTitle: 'Calculation Philosophy',
      secPhilosophySubtitle: 'Deterministic mathematical logic',
      secPhilosophyContent:
        'In Gaṇaka, no mathematical calculation is hidden behind arbitrary heuristics. Every output is reproducible with documented formulas, explicit time standards, and selectable Ayanāṃśa models.',
      secSourcesTitle: 'Classical Sources & Standards',
      secSourcesSubtitle: 'Primary Sanskrit treatises',
      secSourcesContent:
        'All classical formulas are cross-referenced with primary treatises:\n• Bṛhat Parāśara Horā Śāstra (ed. Santhanam / Sharma / Devachandra)\n• Sūryasiddhānta (with commentaries by Raṅganātha and modern editions)\n• Bṛhat Jātaka of Varāhamihira (with Bhaṭṭotpala commentary)\n• Jātaka Pārijāta of Vaidyanātha Dīkṣita\n• Regional treatises of Assam and Eastern India',
      secMethodsTitle: 'Coordinate Systems & Celestial Methods',
      secMethodsSubtitle: 'Astronomical coordinate reduction',
      secMethodsContent:
        'Gaṇaka standardizes on the International Celestial Reference System (ICRS) and converts to ecliptic geocentric/topocentric sidereal coordinates. Algorithms support multiple sunrise definitions to allow researchers to test traditional versus modern astronomical variants.',
    },
    footer: {
      tagline:
        'A modern platform for astronomical calculation, classical Jyotiṣa methods, and traceable sources.',
      productHeading: 'Product',
      researchHeading: 'Research',
      documentationHeading: 'Documentation',
      aboutHeading: 'About',
      copyrightText: 'Gaṇaka Classical Jyotiṣa Engine. All rights reserved.',
      sanskritEpigraph: 'ज्योतिषामयनं चक्षुः • सिद्धांते गणितं प्रधानम्',
    },
    settingsModal: {
      title: 'Platform Settings & Preferences',
      subtitle: 'Universal calculation standards, astronomical models, language & notation preferences',
      tabAyanamsha: 'Ayanāṃśa Default',
      tabLocation: 'Location & Time',
      tabLanguage: 'Language & Script',
      tabDisplay: 'Display Style',
      savedNotice: 'Saved',
      resetBtn: 'Reset to Defaults',
      doneBtn: 'Done',
      languageSelectorTitle: 'Platform Interface Language',
      languageSelectorDesc:
        'Changes the language of all platform pages (Homepage, About, Research, Docs). Technical workspace calculations and Sanskrit mantras/nakshatras remain in authentic classical Sanskrit.',
      locationSearchTitle: 'Default Geographic Location',
      locationSearchDesc:
        'Select or search any city from the 400+ database, or specify custom geographical coordinates.',
      customCoordsToggle: 'Enter Custom Geodetic Coordinates',
      presetLocationsTitle: 'Vedic Astronomical Pilgrimage & Regional Anchors',
      activeDefaultLocation: 'Currently Active Default Location',
    },
  },

  hindi: {
    nav: {
      home: 'गृहपृष्ठ',
      panchanga: 'पंचांग',
      about: 'परिचय',
      research: 'शोध',
      documentation: 'दस्तावेज़',
      workspace: 'कार्यक्षेत्र',
      settings: 'सेटिंग्स',
      enterWorkspace: 'कार्यक्षेत्र में प्रवेश करें',
      closeMenu: 'मेनू बंद करें',
    },
    header: {
      descriptor: 'ज्योतिष गणना एवं शास्त्रीय शोध',
      settingsTitle: 'प्लेटफ़ॉर्म सेटिंग्स एवं प्राथमिकताएं',
    },
    hero: {
      statusBarTitle: 'गणक नाक्षत्र कार्यक्षेत्र',
      epigraph: 'सिद्धांते गणितं प्रधानम् • Classical Mathematical Astronomy',
      title: 'सटीक नाक्षत्र पंचांग गणना एवं शास्त्रीय ज्योतिष इंजन',
      subtitle:
        'निर्धारित खगोलीय गतिकी, १६ षोडशवर्ग (D1-D60), विंशोत्तरी दशा कालक्रम, तथा संस्कृत सिद्धांत ग्रंथों पर आधारित प्रामाणिक मुहूर्त निर्णय।',
      ctaEnterDetails: 'नीचे कुंडली विवरण दर्ज करें',
      ctaViewPanchanga: 'दैनिक पंचांग देखें',
      ctaResearch: 'शास्त्रीय शोध देखें',
      verifiedCities: '४००+ प्रामाणिक भौगोलिक केंद्र',
    },
    birthPanel: {
      title: 'जन्मपत्रिका विवरण दर्ज करें',
      subtitle: 'उच्च-सटीकता भू-केन्द्रीय ग्रहस्थिति, लग्न एवं षोडशवर्ग कुंडलियां',
      chartNameLabel: 'जातक का नाम / शीर्षक',
      chartNamePlaceholder: 'उदा. श्रीराम, शोध पत्रिका ०१',
      birthplaceLabel: 'जन्मस्थान (नगर / अक्षांश-रेखांश)',
      birthplacePlaceholder: 'नगर खोजें (उदा. उज्जैन, वाराणसी, गुवाहाटी, दिल्ली...)',
      useDefaultLocation: 'डिफ़ॉल्ट स्थान का उपयोग करें',
      dobLabel: 'जन्म तिथि',
      tobLabel: 'जन्म समय',
      quickFillGochar: 'वर्तमान गोचर स्थिति भरें',
      requiredNotice: 'आवश्यक विवरण:',
      birthplaceField: 'जन्मस्थान',
      dobField: 'जन्म तिथि',
      tobField: 'जन्म समय',
      calculateBtn: 'ग्रह स्थिति गणना करें एवं कार्यक्षेत्र खोलें',
      calculatingBtn: 'ग्रह स्थिति की गणना हो रही है, कार्यक्षेत्र खुल रहा है...',
      fillRequiredBtn: 'गणना हेतु जन्मस्थान, तिथि एवं समय निर्दिष्ट करें',
      settingsTitle: 'गणना सेटिंग्स',
      settingsSubtitle: 'पंचांग मानक एवं निर्देशांक प्रणाली',
      ayanamshaSystem: 'अयनांश प्रणाली',
      houseSystemLabel: 'भाव चलित भाव प्रणाली',
      customCoordsToggle: 'कस्टम भौगोलिक निर्देशांक',
      latLabel: 'अक्षांश (°N / °S)',
      lngLabel: 'रेखांश (°E / °W)',
      tzLabel: 'समय क्षेत्र अंतर (घंटे)',
    },
    features: {
      sectionTitle: 'मौलिक गणना वास्तुकला',
      sectionSubtitle:
        'शास्त्रीय सिद्धांतों की अचूक गणितीय शुद्धता के अनुरूप निर्मित, बिना किसी कृत्रिम सन्निकटन के।',
      astronomicalRigorTitle: 'खगोलीय सटीकता',
      astronomicalRigorDesc:
        'IAU-1980 न्युटेशन एवं VSOP87 ग्रहीय गतिकी के माध्यम से उप-चाप-सेकंड की उच्चतम शुद्धता।',
      classicalMechanicsTitle: 'शास्त्रीय पाराशरी सिद्धांत',
      classicalMechanicsDesc:
        'बृहत्पाराशरहोराशास्त्र के नियमों, षड्बल गणना तथा भाव चलित संधियों का पूर्ण निष्ठा से पालन।',
      sixteenVargasTitle: 'षोडशवर्ग कुंडलियां (D1–D60)',
      sixteenVargasDesc:
        'पाराशरी गणितीय सूत्रों के अनुसार सभी १६ सूक्ष्म वर्ग कुंडलियों की सटीक गणना।',
      muhurtaEngineTitle: 'प्रामाणिक मुहूर्त निर्णय',
      muhurtaEngineDesc:
        'तिथि, वार, नक्षत्र, योग और करण के आधार पर शुभ एवं अशुभ मुहूर्तों का विशद विश्लेषण।',
      sourceTransparencyTitle: 'मूल ग्रन्थों की प्रामाणिकता',
      sourceTransparencyDesc:
        'प्रत्येक गणना नियम, सीमा एवं सूत्र का संस्कृत ग्रन्थों के अध्याय एवं श्लोक संख्या सहित स्पष्ट संदर्भ।',
      regionalTraditionsTitle: 'क्षेत्रीय पंचांग परंपराएं',
      regionalTraditionsDesc:
        'असमिया, बंगाली, केरल एवं मिथिला की विशिष्ट पंचांग पद्धतियों एवं कालगणना का आदर एवं समर्थन।',
    },
    about: {
      title: 'गणक का परिचय',
      subtitle:
        'पारंपरिक ज्योतिष और खगोल शास्त्र का अध्ययन, गणना और निरीक्षण करने हेतु गणितीय शुद्धता एवं स्रोत पारदर्शिता से युक्त आधुनिक वातावरण।',
      introParagraph:
        'गणक उन विद्वानों, ज्योतिर्विदों एवं शोधकर्ताओं के लिए समर्पित है जो बिना किसी समझौते के गणितीय शुद्धता एवं प्रामाणिक शास्त्रीय सूत्रों की मांग करते हैं।',
      principlesTitle: 'मूल इंजीनियरिंग सिद्धांत',
      roadmapTitle: 'प्लेटफ़ॉर्म संरचना एवं चरण',
      p1Title: 'गणना की शुद्धता',
      p1Desc:
        'उच्चतम खगोलीय सटीकता, सुदृढ़ पंचांग मॉडल एवं गोलीय त्रिकोणमिति का प्रत्यक्ष अनुप्रयोग।',
      p2Title: 'स्रोतों की पारदर्शिता',
      p2Desc:
        'प्रत्येक गणना नियम, वर्ग विभाजन एवं व्याख्या पैरामीटर का शास्त्रीय श्लोकों से सीधा संबंध।',
      p3Title: 'मॉड्यूलर वास्तुकला',
      p3Desc:
        'खगोलीय पंचांग गणना, निर्देशांक रूपांतरण, ज्योतिषीय विभाजन एवं शोध उपकरणों का पृथक संगठन।',
      p4Title: 'पुनरावृत्ति एवं सत्यापन',
      p4Desc:
        'प्रत्येक परिणाम का मध्यवर्ती चरों एवं सूत्रों की सहायता से स्वतंत्र रूप से सत्यापन संभव।',
      p5Title: 'क्षेत्रीय परंपराओं का सम्मान',
      p5Desc:
        'असम, बंगाल, केरल और तमिलनाडु की विशिष्ट कालगणना एवं कुंडली शैलियों का सम्मान।',
      p6Title: 'काल्पनिक स्रोतों का निषेध',
      p6Desc:
        'कदापि किसी अपुष्ट आधुनिक दावे या इंटरनेट की लोकवार्ता को शास्त्रीय स्रोत के रूप में प्रस्तुत नहीं किया जाता।',
      p7Title: 'पारदर्शी अल्गोरिदम',
      p7Desc:
        'उपयोगकर्ता को सदा ज्ञात रहता है कि कौन सा अयनांश, नोड मॉडल, सूर्योदय परिभाषा या भाव प्रणाली सक्रिय है।',
    },
    research: {
      title: 'शास्त्रीय शोध एवं मूल स्रोत',
      subtitle:
        'आधुनिक गणनात्मक अल्गोरिदम को सीधे प्राथमिक संस्कृत पाण्डुलिपियों एवं शास्त्रीय श्लोकों से जोड़ना।',
      introParagraph:
        'शोध परत आधुनिक गणितीय खगोल विज्ञान और प्राचीन संस्कृत ग्रंथों के मध्य एक विश्वसनीय सेतु के रूप में कार्य करती है।',
      area1Title: 'शास्त्रीय ग्रन्थ एवं पाण्डुलिपियां',
      area1Desc:
        'संस्कृत खगोलीय एवं फलित ग्रन्थों का श्लोक सूचीकरण एवं प्रामाणिक पाठ संपादन।',
      area2Title: 'नियमों की वंशावली एवं स्रोत',
      area2Desc:
        'प्रत्येक गणना सूत्र को मूल शास्त्रीय श्लोकों से सीधे संबद्ध करना।',
      area3Title: 'खगोलीय मॉडल एवं ऐतिहासिक सिद्धांत',
      area3Desc:
        'ऐतिहासिक सैद्धांतिक खगोलशास्त्र, मध्यकालीन कोष्ठकों एवं आधुनिक पंचांगों का तुलनात्मक अध्ययन।',
      area4Title: 'गणना पद्धतियों का मानकीकरण',
      area4Desc:
        'विभिन्न अयनांश प्रणालियों, वास्तविक व मध्य राहु-केतु, और क्षितिज प्रक्षेपणों का वैज्ञानिक विश्लेषण।',
      area5Title: 'क्षेत्रीय परंपराएं एवं विशिष्ट पद्धतियां',
      area5Desc:
        'असम, बंगाल, केरल एवं दक्षिण भारत के विशिष्ट ज्योतिषीय ग्रन्थों एवं परंपराओं का गंभीर अध्ययन।',
    },
    documentation: {
      title: 'दस्तावेज़ एवं तकनीकी विनिर्देश',
      subtitle:
        'गणक प्लेटफ़ॉर्म की तकनीकी नींव, गणना दर्शन एवं निर्देशांक प्रणालियों का विवरण।',
      introParagraph:
        'गणक पारंपरिक ज्योतिष एवं खगोल शास्त्र के अध्ययन हेतु एक खुला और पारदर्शी मंच है।',
      secOverviewTitle: 'प्रणाली का अवलोकन',
      secOverviewSubtitle: 'संरचना एवं अभिकल्पना दर्शन',
      secOverviewContent:
        'गणक खगोलीय गणना, गोलीय निर्देशांक, ज्योतिषीय विभाजन एवं शोध दृश्यीकरण को पृथक एवं प्रामाणिक स्तरों में विभाजित करता है।',
      secArchitectureTitle: 'बहुस्तरीय पाइपलाइन',
      secArchitectureSubtitle: 'चार प्रमुख निष्पादन स्तर',
      secArchitectureContent:
        '१. खगोलीय कोर: उच्च-सटीकता ग्रह स्थितियां एवं रेखांश।\n२. गणितीय रूपांतरण: अयनांश शोधन, लग्न एवं भाव संधियां।\n३. ज्योतिष इंजन: षोडशवर्ग (D1-D60), विंशोत्तरी दशा, अष्टकवर्ग एवं ग्रहीय बल।\n४. स्रोत एवं यूआई: दृश्य कुंडलियां, सारणियां एवं संस्कृत श्लोक संदर्भ।',
      secPhilosophyTitle: 'गणना दर्शन',
      secPhilosophySubtitle: 'निश्चित गणितीय तर्क',
      secPhilosophyContent:
        'गणक में कोई भी गणितीय गणना मनमाने अनुमानों पर आधारित नहीं है। प्रत्येक परिणाम प्रलेखित सूत्रों एवं स्पष्ट समय मानकों द्वारा पुनः उत्पन्न किया जा सकता है।',
      secSourcesTitle: 'शास्त्रीय स्रोत एवं मानक',
      secSourcesSubtitle: 'प्राथमिक संस्कृत ग्रन्थ',
      secSourcesContent:
        'सभी शास्त्रीय सूत्रों का मूल ग्रन्थों से सत्यापन किया गया है:\n• बृहत्पाराशरहोराशास्त्र\n• सूर्यसिद्धांत (रंगनाथ टीका सहित)\n• वराहमिहिर कृत बृहज्जातक\n• जातकपारिजात\n• असम एवं पूर्वी भारत के क्षेत्रीय ज्योतिष ग्रन्थ',
      secMethodsTitle: 'निर्देशांक प्रणालियां एवं विधियां',
      secMethodsSubtitle: 'खगोलीय समन्वय',
      secMethodsContent:
        'गणक अंतर्राष्ट्रीय खगोलीय संदर्भ प्रणाली (ICRS) पर आधारित है और क्रांतिवृत्तीय भू-केन्द्रीय नाक्षत्र निर्देशांकों में रूपांतरण करता है।',
    },
    footer: {
      tagline:
        'खगोलीय गणना, शास्त्रीय ज्योतिष पद्धतियों एवं प्रामाणिक स्रोतों के लिए आधुनिक प्लेटफ़ॉर्म।',
      productHeading: 'उत्पाद',
      researchHeading: 'शोध',
      documentationHeading: 'दस्तावेज़',
      aboutHeading: 'परिचय',
      copyrightText: 'गणक शास्त्रीय ज्योतिष इंजन। सर्वाधिकार सुरक्षित।',
      sanskritEpigraph: 'ज्योतिषामयनं चक्षुः • सिद्धांते गणितं प्रधानम्',
    },
    settingsModal: {
      title: 'प्लेटफ़ॉर्म सेटिंग्स एवं प्राथमिकताएं',
      subtitle: 'सार्वभौमिक गणना मानक, खगोलीय मॉडल, भाषा एवं प्रारूप प्राथमिकताएं',
      tabAyanamsha: 'डिफ़ॉल्ट अयनांश',
      tabLocation: 'स्थान एवं समय',
      tabLanguage: 'भाषा एवं लिपि',
      tabDisplay: 'प्रदर्शन शैली',
      savedNotice: 'सहेजा गया',
      resetBtn: 'डिफ़ॉल्ट पर रीसेट करें',
      doneBtn: 'पूर्ण',
      languageSelectorTitle: 'प्लेटफ़ॉर्म की भाषा',
      languageSelectorDesc:
        'सभी पृष्ठों (मुखपृष्ठ, परिचय, शोध आदि) की भाषा बदलता है। कार्यक्षेत्र की गणना एवं संस्कृत श्लोक/नक्षत्र प्रामाणिक संस्कृत में ही रहते हैं।',
      locationSearchTitle: 'डिफ़ॉल्ट भौगोलिक स्थान',
      locationSearchDesc:
        '४००+ नगरों की सूची में से अपना नगर चुनें अथवा स्वेच्छा से अक्षांश-रेखांश दर्ज करें।',
      customCoordsToggle: 'कस्टम भौगोलिक निर्देशांक दर्ज करें',
      presetLocationsTitle: 'वैदिक खगोलीय तीर्थ एवं प्रमुख नगर',
      activeDefaultLocation: 'वर्तमान सक्रिय डिफ़ॉल्ट स्थान',
    },
  },

  sanskrit: {
    nav: {
      home: 'मुख्यपृष्ठम्',
      panchanga: 'पञ्चाङ्गम्',
      about: 'परिचयः',
      research: 'अनुसन्धानम्',
      documentation: 'प्रलेखनम्',
      workspace: 'कार्यस्थलम्',
      settings: 'संयोजनानि',
      enterWorkspace: 'कार्यस्थलं प्रविशतु',
      closeMenu: 'सूचीं पिदधातु',
    },
    header: {
      descriptor: 'ज्योतिष-गणितं शास्त्रीयानुसन्धानं च',
      settingsTitle: 'मञ्च-संयोजनानि अभिरुचयश्च',
    },
    hero: {
      statusBarTitle: 'गणक नाक्षत्र-कार्यस्थलम्',
      epigraph: 'सिद्धांते गणितं प्रधानम् • Classical Mathematical Astronomy',
      title: 'सूक्ष्म-नाक्षत्र-ग्रहगणितं शास्त्रीय-ज्योतिष-यन्त्रं च',
      subtitle:
        'प्रत्यक्ष-खगोलीय-गतिविज्ञानम्, षोडशवर्गाः (D1-D60), विंशोत्तरी-दशा-क्रमः, संस्कृत-सिद्धान्त-ग्रन्थाधारित-मुहूर्त-निर्णयश्च।',
      ctaEnterDetails: 'अधः कुण्डली-विवरणं प्रविशतु',
      ctaViewPanchanga: 'दैनिक-पञ्चाङ्गं पश्यतु',
      ctaResearch: 'शास्त्रीयानुसन्धानम्',
      verifiedCities: '४००+ प्रामाणिक-भूकेन्द्राणि',
    },
    birthPanel: {
      title: 'जन्मपत्रिका-विवरणं प्रविशतु',
      subtitle: 'सूक्ष्म-भूगोलीय-ग्रहस्थितिः, लग्नं षोडशवर्गाश्च',
      chartNameLabel: 'जातकस्य नाम / शीर्षकम्',
      chartNamePlaceholder: 'उदा. श्रीरामः, शोधपत्रिका ०१',
      birthplaceLabel: 'जन्मस्थानम् (नगरम् / रेखांश-अक्षांशौ)',
      birthplacePlaceholder: 'नगरम् अन्विष्यतु (उदा. उज्जयिनी, वाराणासी, प्राग्ज्योतिषपुरम्...)',
      useDefaultLocation: 'पूर्वनिर्धारितस्थानं योजयतु',
      dobLabel: 'जन्मतिथिः',
      tobLabel: 'जन्मसमयः',
      quickFillGochar: 'सद्यः गोचर-स्थितिः',
      requiredNotice: 'आवश्यक-मापदण्डाः:',
      birthplaceField: 'जन्मस्थानम्',
      dobField: 'जन्मतिथिः',
      tobField: 'जन्मसमयः',
      calculateBtn: 'ग्रहगणितं कृत्वा कार्यस्थलं प्रविशतु',
      calculatingBtn: 'ग्रहगणना क्रियते, कार्यस्थलं उद्घाट्यते...',
      fillRequiredBtn: 'गणनाय जन्मस्थानं, तिथिं समयं च निर्दिशतु',
      settingsTitle: 'गणना-संयोजनानि',
      settingsSubtitle: 'पञ्चाङ्ग-मानं निर्देशांक-पद्धतिश्च',
      ayanamshaSystem: 'अयनांश-पद्धतिः',
      houseSystemLabel: 'भाव-चलित-पद्धतिः',
      customCoordsToggle: 'स्वेच्छया अक्षांश-रेखांशौ',
      latLabel: 'अक्षांशः (°N / °S)',
      lngLabel: 'रेखांशः (°E / °W)',
      tzLabel: 'कालान्तरम् (होराः)',
    },
    features: {
      sectionTitle: 'मौलिक-गणित-वास्तुशिल्पम्',
      sectionSubtitle:
        'सिद्धान्तग्रन्थानाम् अविकल-गणितीय-शुद्धतायै निर्मितम्।',
      astronomicalRigorTitle: 'खगोलीय-परमशुद्धता',
      astronomicalRigorDesc:
        'IAU-1980 तथा VSOP87 सिद्धान्तैः सूक्ष्मातिसूक्ष्म-ग्रहस्फुट-साधनम्।',
      classicalMechanicsTitle: 'शास्त्रीय-पाराशरी-प्रक्रिया',
      classicalMechanicsDesc:
        'बृहत्पाराशरहोराशास्त्रोक्त-षड्बल-गणना तथा भावचलित-सन्धयः।',
      sixteenVargasTitle: 'षोडशवर्गाः (D1–D60)',
      sixteenVargasDesc:
        'पाराशरी-सूत्राणाम् आधारेण षोडशवर्गाणां सूक्ष्मा गणना।',
      muhurtaEngineTitle: 'प्रामाणिक-मुहूर्त-निर्णयः',
      muhurtaEngineDesc:
        'तिथि-वार-नक्षत्र-योग-करणानां सम्यक् विमर्शनम्।',
      sourceTransparencyTitle: 'मूलग्रन्थ-पारदर्शिता',
      sourceTransparencyDesc:
        'प्रत्येक-नियमस्य संस्कृत-श्लोकैः सह प्रत्यक्षः सम्बन्धः।',
      regionalTraditionsTitle: 'प्रान्तीय-पञ्चाङ्ग-परम्पराः',
      regionalTraditionsDesc:
        'कामरूप-गौड-केरलीय-मैथिल-पद्धतीनाम् आदरः रक्षणं च।',
    },
    about: {
      title: 'गणक-परिचयः',
      subtitle:
        'पारम्परिक-ज्योतिषस्य खगोलविज्ञानस्य च अनुशीलनार्थं गणितीय-शुद्धतायुक्तं मञ्चम्।',
      introParagraph:
        'गणक-मञ्चः पण्डितानां ज्योतिर्विदां गवेषकाणां च कृते शास्त्रीय-शुद्धतायै समर्पितः।',
      principlesTitle: 'मूल-अभियान्त्रिकी-सिद्धान्ताः',
      roadmapTitle: 'मञ्च-रचना क्रमिकाः चरणाश्च',
      p1Title: 'गणनायाः यथार्थता',
      p1Desc:
        'खगोलीय-परिशुद्धता तथा गोलत्रिकोणमित्याः निर्दोषः प्रयोगः।',
      p2Title: 'मूलग्रन्थ-पारदर्शिता',
      p2Desc:
        'प्रत्येक-गणित-नियमस्य शास्त्रीय-श्लोकैः सह साक्षात् निर्देशः।',
      p3Title: 'विभक्त-रचना (Modularity)',
      p3Desc:
        'खगोल-पञ्चाङ्ग-ज्योतिष-साधनानां सुव्यवस्थितं पृथक्करणम्।',
      p4Title: 'पुनरावृत्तिः परीक्षणं च',
      p4Desc:
        'प्रत्येक-परिणामस्य चरणबद्धं गणितीयं परीक्षणं शक्यते।',
      p5Title: 'क्षेत्रीय-सम्प्रदायानां समादरः',
      p5Desc:
        'असम-वङ्ग-केरलादि-प्रदेशानां पारम्परिक-कालगणनायाः समादरः।',
      p6Title: 'कल्पित-स्रोतानां वर्जनम्',
      p6Desc:
        'अशास्त्रीयाणां कल्पितानां च वचनानां सर्वथा त्यागः।',
      p7Title: 'स्पष्टानि सूत्राणि',
      p7Desc:
        'अयनांश-सूर्योदय-भावादीनां मानदण्डाः सर्वदा प्रयोक्त्रे विदिताः भवन्ति।',
    },
    research: {
      title: 'शास्त्रीयानुसन्धानं मूलग्रन्थाश्च',
      subtitle:
        'आधुनिक-गणनानां संस्कृत-पाण्डुलिपिभिः सह साक्षात् संयोजनम्।',
      introParagraph:
        'अनुसन्धान-विभागः आधुनिक-खगोलगणितस्य तथा प्राचीन-संस्कृत-ग्रन्थानां मध्ये सेतुवत् वर्तते।',
      area1Title: 'मूलसंस्कृतग्रन्थाः पाण्डुलिपयश्च',
      area1Desc:
        'सिद्धान्तग्रन्थानां फलितग्रन्थानां च श्लोकानुक्रमणिका संस्करणानि च।',
      area2Title: 'नियमानां मूलपरम्परा',
      area2Desc:
        'गणनासूत्राणां शास्त्रीय-श्लोकेभ्यः आगमनस्य स्पष्टीकरणम्।',
      area3Title: 'खगोलीय-सिद्धान्ताः ऐतिहासिक-वादाश्च',
      area3Desc:
        'सिद्धान्त-खगोलस्य आधुनिक-ग्रहगणितस्य च तुलनात्मकमध्ययनम्।',
      area4Title: 'गणनापद्धतीनां मानकीकरणम्',
      area4Desc:
        'अयनांश-भेदस्य राहुकेतु-स्पष्टत्वस्य सूर्योदय-लक्षणानां च समीक्षा।',
      area5Title: 'प्रान्तीय-परम्पराः विशिष्टाश्च पद्धतयः',
      area5Desc:
        'कामरूप-कामरूपी-पञ्चाङ्गस्य तथा केरलीय-ज्योतिष-ग्रन्थानाम् अनुशीलनम्।',
    },
    documentation: {
      title: 'प्रलेखनं तान्त्रिक-विनिर्देशाश्च',
      subtitle:
        'गणक-मञ्चस्य तान्त्रिक-भित्तिः, गणना-दर्शनं निर्देशांक-विधयश्च।',
      introParagraph:
        'गणकः पारम्परिक-ज्योतिषस्य खगोलस्य च अध्ययनार्थं मुक्तं पारदर्शि च कार्यस्थलम्।',
      secOverviewTitle: 'तन्त्र-विहङ्गावलोकनम्',
      secOverviewSubtitle: 'रचना-दर्शनम्',
      secOverviewContent:
        'खगोलीय-स्फुट-साधनम्, अयनांश-संस्कारः, पाराशरी-विभागाः, दृश्य-चित्राणि च परस्परं संयुक्तानि सन्ति।',
      secArchitectureTitle: 'सोपान-क्रमः',
      secArchitectureSubtitle: 'चत्वारि निष्पादन-स्तराणि',
      secArchitectureContent:
        '१. खगोलीय-केन्द्रम्: उच्च-परिशुद्ध-ग्रहस्फुटाः।\n२. गणितीय-संस्काराः: अयनांश-शोधनं लग्न-भाव-साधनं च।\n३. ज्योतिष-यन्त्रम्: षोडशवर्गाः, दशा-कालक्रमः, अष्टकवर्गः, ग्रहाणां बलानि च।\n४. फल-प्रदर्शनम्: चित्राणि, कोष्ठकानि, संस्कृत-श्लोक-उद्धरणानि च।',
      secPhilosophyTitle: 'गणना-दर्शनम्',
      secPhilosophySubtitle: 'निश्चितं गणितीय-तर्कशास्त्रम्',
      secPhilosophyContent:
        'गणके कापि गणना अनुमानेन न क्रियते। प्रत्येकं फलं शास्त्रीय-सूत्रैः सम्यक् समर्थितम्।',
      secSourcesTitle: 'शास्त्रीय-प्रमाण-ग्रन्थाः',
      secSourcesSubtitle: 'प्राचीन-संस्कृत-संहिताः',
      secSourcesContent:
        'सर्वाणि सूत्राणि प्रामाणिक-ग्रन्थेभ्यः गृहीतानि:\n• बृहत्पाराशरहोराशास्त्रम्\n• सूर्यसिद्धान्तः (रङ्गनाथटीका-सहितः)\n• वराहमिहिरस्य बृहज्जातकम्\n• जातकपारिजातः\n• प्राच्य-भारतीयाः कालगणना-ग्रन्थाः',
      secMethodsTitle: 'निर्देशाङ्काः खगोलीय-विधयश्च',
      secMethodsSubtitle: 'खगोलीय-संस्काराः',
      secMethodsContent:
        'ICRS मानकस्य आधारेण नाक्षत्र-क्रान्तिवृत्तीय-स्फुटानां साधनं क्रियते।',
    },
    footer: {
      tagline:
        'खगोलीय-गणनायै पारम्परिक-ज्योतिष-पद्धतिभ्यः प्रामाणिक-स्रोतोभ्यश्च आधुनिकं मञ्चम्।',
      productHeading: 'उत्पादम्',
      researchHeading: 'अनुसन्धानम्',
      documentationHeading: 'प्रलेखनम्',
      aboutHeading: 'परिचयः',
      copyrightText: 'गणक-शास्त्रीय-ज्योतिष-यन्त्रम्। सर्वाधिकारः सुरक्षितः।',
      sanskritEpigraph: 'ज्योतिषामयनं चक्षुः • सिद्धांते गणितं प्रधानम्',
    },
    settingsModal: {
      title: 'मञ्च-संयोजनानि अभिरुचयश्च',
      subtitle: 'सार्वभौमिक-गणना-मानानि, खगोलीय-प्रतिरूपाणि, भाषा-प्राथमिकताश्च',
      tabAyanamsha: 'अयनांश-मानम्',
      tabLocation: 'स्थानं समयश्च',
      tabLanguage: 'भाषा लिपिश् च',
      tabDisplay: 'दृश्य-शैली',
      savedNotice: 'संरक्षितम्',
      resetBtn: 'पूर्वस्थितौ प्रत्यानयतु',
      doneBtn: 'सम्पन्नम्',
      languageSelectorTitle: 'मञ्चस्य भाषा-चयनम्',
      languageSelectorDesc:
        'सर्वेषां पृष्ठानां भाषां परिवर्तयति। कार्यस्थले शास्त्रीय-संस्कृत-श्लोकाः नक्षत्राणि च संवृतानि एव तिष्ठन्ति।',
      locationSearchTitle: 'पूर्वनिर्धारितं भौगोलिक-स्थानम्',
      locationSearchDesc:
        '४००+ नगरेभ्यः स्थानं चिनोतु अथवा स्वेच्छया अक्षांश-रेखांशौ निर्दिशतु।',
      customCoordsToggle: 'स्वेच्छया अक्षांश-रेखांशौ योजयतु',
      presetLocationsTitle: 'वैदिक-खगोलीय-तीर्थानि प्रमुखाणि नगराणि च',
      activeDefaultLocation: 'वर्तमान-सक्रिय-पूर्वनिर्धारित-स्थानम्',
    },
  },

  assamese: {
    nav: {
      home: 'মুখ্য পৃষ্ঠা',
      panchanga: 'পঞ্চাঙ্গ',
      about: 'পৰিচয়',
      research: 'গৱেষণা',
      documentation: 'নথিপত্ৰ',
      workspace: 'কাৰ্যক্ষেত্ৰ',
      settings: 'সংহতিসমূহ',
      enterWorkspace: 'কাৰ্যক্ষেত্ৰত প্ৰৱেশ কৰক',
      closeMenu: 'সূচী বন্ধ কৰক',
    },
    header: {
      descriptor: 'জ্যোতিষ গণনা আৰু শাস্ত্ৰীয় গৱেষণা',
      settingsTitle: 'প্লেটফৰ্ম সংহতি আৰু পছন্দসমূহ',
    },
    hero: {
      statusBarTitle: 'গণক নাক্ষত্ৰিক কাৰ্যক্ষেত্ৰ',
      epigraph: 'सिद्धांते गणितं प्रधानम् • Classical Mathematical Astronomy',
      title: 'সূক্ষ্ম নাক্ষত্ৰিক পঞ্জিকা গণনা আৰু শাস্ত্ৰীয় জ্যোতিষ ইঞ্জিন',
      subtitle:
        'নিৰ্ধাৰিত মহাকাশীয় গতিবিজ্ঞান, ১৬ ষোড়শৱৰ্গ (D1-D60), বিংশোত্তৰী দশা সময়ৰেখা, আৰু সংস্কৃত সিদ্ধান্ত গ্ৰন্থৰ ওপৰত প্ৰতিষ্ঠিত প্ৰামাণিক মুহূৰ্ত নিৰ্ণয়।',
      ctaEnterDetails: 'তলত কুণ্ডলীৰ তথ্য প্ৰৱিষ্ট কৰক',
      ctaViewPanchanga: 'দৈনিক পঞ্চাঙ্গ চাওক',
      ctaResearch: 'শাস্ত্ৰীয় গৱেষণা চাওক',
      verifiedCities: '৪০০+ প্ৰামাণিক ভৌগোলিক স্থান',
    },
    birthPanel: {
      title: 'জন্মকুণ্ডলীৰ তথ্য প্ৰৱিষ্ট কৰক',
      subtitle: 'উচ্চ-প্ৰসিদ্ধ ভৌগোলিক গ্ৰহস্থিতি, লগ্ন আৰু ষোড়শৱৰ্গ কুণ্ডলী',
      chartNameLabel: 'জাতকৰ নাম / শীৰ্ষক',
      chartNamePlaceholder: 'উদাহৰণ: শ্ৰীৰাম, গৱেষণা কুণ্ডলী ০১',
      birthplaceLabel: 'জন্মস্থান (নগৰ / ৰেখাংশ-অক্ষাংশ)',
      birthplacePlaceholder: 'নগৰ সন্ধান কৰক (উদাহৰণ: গুৱাহাটী, তেজপুৰ, উজ্জয়িনী, বাৰাণসী...)',
      useDefaultLocation: 'পূৰ্বনিৰ্ধাৰিত স্থান ব্যৱহাৰ কৰক',
      dobLabel: 'জন্ম তাৰিখ',
      tobLabel: 'জন্ম সময়',
      quickFillGochar: 'বৰ্তমান গোচৰ স্থিতি',
      requiredNotice: 'প্ৰয়োজনীয় তথ্য:',
      birthplaceField: 'জন্মস্থান',
      dobField: 'জন্ম তাৰিখ',
      tobField: 'জন্ম সময়',
      calculateBtn: 'গ্ৰহগণনা কৰি কাৰ্যক্ষেত্ৰ খোলক',
      calculatingBtn: 'গ্ৰহগণনা চলি আছে, কাৰ্যক্ষেত্ৰ খুলি থকা হৈছে...',
      fillRequiredBtn: 'গণনাৰ বাবে জন্মস্থান, তাৰিখ আৰু সময় নিৰ্ধাৰণ কৰক',
      settingsTitle: 'গণনা সংহতি',
      settingsSubtitle: 'পঞ্জিকা মান আৰু স্থানাংক প্ৰণালী',
      ayanamshaSystem: 'অয়নাংশ প্ৰণালী',
      houseSystemLabel: 'ভাৱ চলিত ভাৱ প্ৰণালী',
      customCoordsToggle: 'কাস্টম ভৌগোলিক স্থানাংক',
      latLabel: 'অক্ষাংশ (°N / °S)',
      lngLabel: 'দ্ৰাঘিমাংশ (°E / °W)',
      tzLabel: 'সময় মণ্ডলৰ ব্যৱধান (ঘণ্টা)',
    },
    features: {
      sectionTitle: 'মৌলিক গণনা স্থাপত্য',
      sectionSubtitle:
        'শাস্ত্ৰীয় সিদ্ধান্তসমূহৰ নিখুঁত গাণিতিক মান্যতাৰে নিৰ্মিত, কোনো ধৰণৰ আনুমানিকতা নোহোৱাকৈ।',
      astronomicalRigorTitle: 'মহাকাশীয় নিখুঁততা',
      astronomicalRigorDesc:
        'IAU-1980 আৰু VSOP87 গ্ৰহীয় গতিবিজ্ঞানৰ সহায়ত সৰ্বোচ্চ সূক্ষ্ম মান নিৰ্ধাৰণ।',
      classicalMechanicsTitle: 'শাস্ত্ৰীয় পাৰাশৰী পদ্ধতি',
      classicalMechanicsDesc:
        'বৃহৎ পাৰাশৰ হোৰাশাস্ত্ৰৰ বিধি, ষড়বল গণনা আৰু ভাৱ চলিত সন্ধিসমূহৰ নিখুঁত প্ৰয়োগ।',
      sixteenVargasTitle: 'ষোড়শৱৰ্গ কুণ্ডলী (D1–D60)',
      sixteenVargasDesc:
        'পাৰাশৰী গাণিতিক সূত্ৰ অনুসৰি সম্পূৰ্ণ ১৬টা সূক্ষ্ম ৱৰ্গৰ সঠিক গণনা।',
      muhurtaEngineTitle: 'প্ৰামাণিক মুহূৰ্ত নিৰ্ণয়',
      muhurtaEngineDesc:
        'তিথি, বাৰ, নক্ষত্ৰ, যোগ আৰু কৰণৰ বিশ্লেষণৰ দ্বাৰা শুভ আৰু অশুভ সময় নিৰূপণ।',
      sourceTransparencyTitle: 'মূল উৎসৰ স্বচ্ছতা',
      sourceTransparencyDesc:
        'প্ৰতিটো গণনা নিয়ম, সীমা আৰু সূত্ৰ সংস্কৃত গ্ৰন্থৰ অধ্যায় আৰু শ্লোকৰ সৈতে সংলগ্ন।',
      regionalTraditionsTitle: 'আঞ্চলিক জ্যোতিষ পৰম্পৰা',
      regionalTraditionsDesc:
        'অসমীয়া, কামৰূপী, বঙালী আৰু কেৰলৰ পৰম্পৰাগত জ্যোতিষ আৰু পঞ্জিকা ৰীতিৰ প্ৰতি গভীৰ সন্মান।',
    },
    about: {
      title: 'গণকৰ পৰিচয়',
      subtitle:
        'পৰম্পৰাগত জ্যোতিষ আৰু খগোল বিজ্ঞানৰ গৱেষণা, গণনা আৰু নিৰীক্ষণৰ বাবে গাণিতিক সততা আৰু উৎসৰ স্বচ্ছতাৰে সমৃদ্ধ এক আধুনিক পৰিৱেশ।',
      introParagraph:
        'গণক সেইসকল পণ্ডিত, জ্যোতিৰ্বিদ আৰু গৱেষকৰ বাবে সমৰ্পিত যিসকলে আপোচহীন গাণিতিক শুদ্ধতা আৰু প্ৰামাণিক শাস্ত্ৰীয় উৎস বিচাৰে।',
      principlesTitle: 'মূল অভিযান্ত্ৰিক নীতিসমূহ',
      roadmapTitle: 'প্লেটফৰ্মৰ স্তৰ আৰু পৰিকল্পনা',
      p1Title: 'গণনাৰ নিখুঁততা',
      p1Desc:
        'উচ্চতম খগোলীয় সঠিকতা আৰু গোলকীয় ত্ৰিকোণমিতিৰ প্ৰত্যক্ষ ব্যৱহাৰ।',
      p2Title: 'উৎসৰ স্বচ্ছতা',
      p2Desc:
        'প্ৰতিটো গণনা বিধি আৰু ব্যাখ্যাৰ মূল শাস্ত্ৰীয় শ্লোকৰ সৈতে প্ৰত্যক্ষ সংযোগ।',
      p3Title: 'মডুলাৰ গঠন',
      p3Desc:
        'মহাকাশীয় গণনা, স্থানাংক ৰূপান্তৰ আৰু জ্যোতিষীয় বিশ্লেষণৰ সুকীয়া স্তৰ।',
      p4Title: 'পুনৰাবৃত্তি আৰু পৰীক্ষণযোগ্যতা',
      p4Desc:
        'প্ৰতিটো ফলাফল গণিত আৰু সূত্ৰৰ সহায়ত নিৰপেক্ষভাৱে পৰীক্ষা কৰিব পাৰি।',
      p5Title: 'আঞ্চলিক পৰম্পৰাৰ সন্মান',
      p5Desc:
        'অসম, কামৰূপ, বংগ আৰু কেৰলৰ বিশিষ্ট জ্যোতিষীয় আৰু পঞ্জিকা পদ্ধতিৰ সমাদৰ।',
      p6Title: 'কাল্পনিক উৎসৰ বৰ্জন',
      p6Desc:
        'কোনো অপ্ৰমাণিত দাবী বা ইণ্টাৰনেটৰ উৰাবাতৰিক শাস্ত্ৰীয় বুলি কেতিয়াও প্ৰচাৰ কৰা নহয়।',
      p7Title: 'স্বচ্ছ নিয়ম',
      p7Desc:
        'ব্যৱহাৰকাৰীয়ে সদায় স্পষ্টকৈ জানিব পাৰে কোনটো অয়নাংশ, চন্দ্ৰপাত আৰ্হি বা ভাৱ পদ্ধতি সক্ৰিয় হৈ আছে।',
    },
    research: {
      title: 'শাস্ত্ৰীয় গৱেষণা আৰু মূল উৎসসমূহ',
      subtitle:
        'আধুনিক গাণিতিক এলগৰিথমসমূহক প্ৰত্যক্ষভাৱে প্ৰাথমিক সংস্কৃত পাণ্ডুলিপিৰ সৈতে সংযোগ কৰা।',
      introParagraph:
        'গৱেষণা বিভাগে আধুনিক খগোল গণিত আৰু প্ৰাচীন সংস্কৃত শাস্ত্ৰৰ মাজত এক বিশ্বাসযোগ্য সেঁতু হিচাপে কাম কৰে।',
      area1Title: 'শাস্ত্ৰীয় গ্ৰন্থ আৰু পাণ্ডুলিপি',
      area1Desc:
        'সংস্কৃত খগোল আৰু ফলিত জ্যোতিষৰ মূল গ্ৰন্থসমূহৰ শ্লোক সূচীকৰণ আৰু পাঠ নিৰ্ণয়।',
      area2Title: 'নিয়মসমূহৰ উৎস আৰু পৰম্পৰা',
      area2Desc:
        'প্ৰতিটো গণনা সূত্ৰক মূল শাস্ত্ৰীয় শ্লোকৰ সৈতে সংযোজিত কৰা।',
      area3Title: 'মহাকাশীয় আৰ্হি আৰু ঐতিহাসিক মতবাদ',
      area3Desc:
        'ঐতিহাসিক সিদ্ধান্ত জ্যোতিষ আৰু আধুনিক গ্ৰহ পঞ্জিকাৰ তুলনামূলক অধ্যয়ন।',
      area4Title: 'গণনা পদ্ধতিৰ মানকীকৰণ',
      area4Desc:
        'বিভিন্ন অয়নাংশ পদ্ধতি, ৰাহু-কেতুৰ স্পষ্ট স্থিতি আৰু সূৰ্যোদয়ৰ সংজ্ঞাসমূহৰ সমীক্ষা।',
      area5Title: 'আঞ্চলিক পৰম্পৰা আৰু বিশিষ্ট ব্যৱস্থা',
      area5Desc:
        'অসম আৰু উত্তৰ-পূব ভাৰতৰ জ্যোতিষীয় সাহিত্য, কামৰূপী পঞ্জিকা ৰীতি আৰু ঐতিহ্যৰ বিশেষ অধ্যয়ন।',
    },
    documentation: {
      title: 'নথিপত্ৰ আৰু কাৰিকৰী নিৰ্দেশনাৱলী',
      subtitle:
        'গণক প্লেটফৰ্মৰ কাৰিকৰী ভেটি, গণনা দৰ্শন আৰু স্থানাংক ব্যৱস্থাৰ বিৱৰণ।',
      introParagraph:
        'গণক পৰম্পৰাগত জ্যোতিষ আৰু খগোল বিজ্ঞানৰ গৱেষণাৰ বাবে এক মুক্ত আৰু স্বচ্ছ কম্পিউটেশ্যনেল পৰিৱেশ।',
      secOverviewTitle: 'ব্যৱস্থাৰ অৱলোকন',
      secOverviewSubtitle: 'গাঁথনি আৰু আৰ্হি দৰ্শন',
      secOverviewContent:
        'গণকে খগোলীয় গণনা, অয়নাংশ সংস্কাৰ, জ্যোতিষীয় ভাগসমূহ আৰু গৱেষণা চিত্ৰায়নক পৃথক স্তৰত বিভক্ত কৰে।',
      secArchitectureTitle: 'স্তৰভিত্তিক পাইপলাইন',
      secArchitectureSubtitle: 'চাৰিটা প্ৰধান স্তৰ',
      secArchitectureContent:
        '১. খগোলীয় কোৰ: উচ্চ নিখুঁততাৰে গ্ৰহৰ স্থিতি আৰু দ্ৰাঘিমাংশ।\n২. গাণিতিক সংস্কাৰ: অয়নাংশ শোধন, লগ্ন আৰু ভাৱ সন্ধিসমূহ।\n৩. জ্যোতিষ ইঞ্জিন: ষোড়শৱৰ্গ (D1-D60), বিংশোত্তৰী দশা, অষ্টকৱৰ্গ আৰু গ্ৰহবল।\n৪. ফলাফল আৰু ইউআই: কুণ্ডলী চিত্ৰ, তালিকা আৰু সংস্কৃত শ্লোকৰ প্ৰত্যক্ষ উদ্ধৃতি।',
      secPhilosophyTitle: 'গণনা দৰ্শন',
      secPhilosophySubtitle: 'সুনিৰ্দিষ্ট গাণিতিক যুক্তি',
      secPhilosophyContent:
        'গণকত কোনো গাণিতিক গণনা আনুমানিক বা ব্যক্তিগত ধাৰণাৰ ওপৰত নিৰ্ভৰশীল নহয়। প্ৰতিটো ফলাফল পৰীক্ষাযোগ্য।',
      secSourcesTitle: 'শাস্ত্ৰীয় উৎস আৰু মানক',
      secSourcesSubtitle: 'প্ৰাথমিক সংস্কৃত শাস্ত্ৰসমূহ',
      secSourcesContent:
        'সকলো শাস্ত্ৰীয় সূত্ৰ প্ৰামাণিক গ্ৰন্থৰ পৰা লোৱা হৈছে:\n• বৃহৎ পাৰাশৰ হোৰাশাস্ত্ৰ\n• সূৰ্যসিদ্ধান্ত (ৰঙ্গনাথ টীকাসহ)\n• বৰাহমিহিৰৰ বৃহজ্জাতক\n• জাতকপাৰিজাত\n• কামৰূপ আৰু পূব ভাৰতৰ পৰম্পৰাগত জ্যোতিষ গ্ৰন্থ',
      secMethodsTitle: 'স্থানাংক ব্যৱস্থা আৰু পদ্ধতি',
      secMethodsSubtitle: 'মহাকাশীয় স্থানাংক সংস্কাৰ',
      secMethodsContent:
        'গণকে আন্তঃৰাষ্ট্ৰীয় জ্যোতিৰ্বিজ্ঞান তথ্য (ICRS) ব্যৱহাৰ কৰে আৰু নাক্ষত্ৰিক ক্ৰান্তিবৃত্তীয় স্থানাংকলৈ ৰূপান্তৰ কৰে।',
    },
    footer: {
      tagline:
        'মহাকাশীয় গণনা, শাস্ত্ৰীয় জ্যোতিষ পদ্ধতি আৰু নিৰ্ভৰযোগ্য উৎসৰ আধুনিক প্লেটফৰ্ম।',
      productHeading: 'পণ্য',
      researchHeading: 'গৱেষণা',
      documentationHeading: 'নথিপত্ৰ',
      aboutHeading: 'পৰিচয়',
      copyrightText: 'গণক শাস্ত্ৰীয় জ্যোতিষ ইঞ্জিন। সৰ্বস্বত্ব সংৰক্ষিত।',
      sanskritEpigraph: 'ज्योतिषामयनं चक्षुः • सिद्धांते गणितं प्रधानम्',
    },
    settingsModal: {
      title: 'প্লেটফৰ্ম সংহতি আৰু পছন্দসমূহ',
      subtitle: 'সাৰ্বভৌমিক গণনা মানক, জ্যোতিৰ্বিজ্ঞান আৰ্হি, ভাষা আৰু সংহতি',
      tabAyanamsha: 'ডিফল্ট অয়নাংশ',
      tabLocation: 'স্থান আৰু সময়',
      tabLanguage: 'ভাষা আৰু লিপি',
      tabDisplay: 'প্ৰদৰ্শন শৈলী',
      savedNotice: 'সংৰক্ষিত হ’ল',
      resetBtn: 'ডিফল্টলৈ ঘূৰাই আনক',
      doneBtn: 'সম্পূৰ্ণ',
      languageSelectorTitle: 'প্লেটফৰ্মৰ ভাষা',
      languageSelectorDesc:
        'সকলো পৃষ্ঠাৰ (মুখ্য পৃষ্ঠা, পৰিচয়, গৱেষণা আদি) ভাষা পৰিৱৰ্তন কৰে। কাৰ্যক্ষেত্ৰৰ গণনা আৰু সংস্কৃত শ্লোক/নক্ষত্ৰসমূহ প্ৰামাণিক সংস্কৃততেই থাকিব।',
      locationSearchTitle: 'ডিফল্ট ভৌগোলিক স্থান',
      locationSearchDesc:
        '৪০০+ নগৰৰ তালিকাৰ পৰা আপোনাৰ নগৰ বাছক অথবা নিজাকৈ অক্ষাংশ-দ্ৰাঘিমাংশ প্ৰৱিষ্ট কৰক।',
      customCoordsToggle: 'কাস্টম ভৌগোলিক স্থানাংক দিয়ক',
      presetLocationsTitle: 'বৈদিক জ্যোতিৰ্বিজ্ঞান তীৰ্থ আৰু প্ৰধান নগৰসমূহ',
      activeDefaultLocation: 'বৰ্তমান সক্ৰিয় ডিফল্ট স্থান',
    },
  },
};

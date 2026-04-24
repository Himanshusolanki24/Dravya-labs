// Centralized herb data for the Dravya Encyclopedia
// This file contains complete information for all herbs including detail page data

export interface HerbProperties {
    rasa: string;      // Taste
    guna: string;      // Quality
    virya: string;     // Potency
    vipaka: string;    // Post-digestive effect
}

export interface TherapeuticBenefit {
    title: string;
    description: string;
}

export interface UsageMethod {
    method: string;
    dosage: string;
    instructions: string;
}

export interface Herb {
    id: string;
    title: string;
    sanskritName: string;
    botanicalName: string;
    description: string;
    longDescription: string;
    imagePath: string;
    category: string;
    doshas: string[];
    benefits: string[];
    gradientColors: { from: string; to: string };
    properties: HerbProperties;
    therapeuticBenefits: TherapeuticBenefit[];
    usageMethods: UsageMethod[];
    cautions: string[];
    rating: number;
    reviewCount: number;
}

export const herbs: Herb[] = [
    {
        id: "tulsi",
        title: "TULSI",
        sanskritName: "Surasa",
        botanicalName: "Ocimum tenuiflorum",
        description: "Sacred plant known for its powerful adaptogenic and immune-boosting properties. Revered in Ayurveda for balancing body and mind.",
        longDescription: "Revered as the \"Queen of Herbs,\" Tulsi is a potent adaptogen in Ayurveda. It promotes purity and lightness in the body, cleanses the respiratory tract of toxins, and relieves digestive gas and bloating. Tulsi is considered sacred in Hindu tradition and is grown in most Indian households for its medicinal and spiritual significance.",
        imagePath: "/ayurvedic_plants/Tulsi.png",
        category: "Immunity",
        doshas: ["Vata", "Kapha"],
        benefits: ["Immunity Boost", "Stress Relief", "Respiratory"],
        gradientColors: { from: "rgb(34, 197, 94)", to: "rgb(134, 239, 172)" },
        properties: {
            rasa: "Pungent, Bitter",
            guna: "Light, Dry",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Stress Reduction & Mental Clarity", description: "Regulates cortisol levels and acts as a nervine tonic to calm the mind." },
            { title: "Respiratory Support", description: "Helps in liquefying phlegm (Kapha) and is effective for coughs, colds, and asthma." },
            { title: "Immune System Booster", description: "Rich in antioxidants and essential oils that enhance the body's natural defense mechanisms." },
            { title: "Digestive Health", description: "Relieves digestive gas and bloating, supports healthy gut function." }
        ],
        usageMethods: [
            { method: "Fresh Leaves", dosage: "5-10 leaves", instructions: "Chew fresh leaves in the morning on empty stomach" },
            { method: "Tulsi Tea", dosage: "1-2 cups", instructions: "Steep dried or fresh leaves in hot water for 5-10 minutes" },
            { method: "Powder", dosage: "1/4 tsp", instructions: "Mix with honey or warm water twice daily" }
        ],
        cautions: ["May lower blood sugar - diabetics should monitor levels", "Not recommended during pregnancy in medicinal doses", "May interact with blood-thinning medications"],
        rating: 4.8,
        reviewCount: 124
    },
    {
        id: "ashwagandha",
        title: "ASHWAGANDHA",
        sanskritName: "Ashwagandha",
        botanicalName: "Withania somnifera",
        description: "Premier adaptogen that helps the body resist stress, promotes vitality, and supports cognitive function.",
        longDescription: "Ashwagandha, meaning 'smell of the horse,' refers to its unique smell and ability to impart the strength of a stallion. It is one of the most powerful herbs in Ayurvedic healing, used for millennia as a Rasayana (rejuvenative) for its wide-ranging health benefits including stress relief, improved energy, and enhanced cognitive function.",
        imagePath: "/ayurvedic_plants/Ashwagandha.jpg",
        category: "Adaptogen",
        doshas: ["Vata", "Kapha"],
        benefits: ["Stress Relief", "Energy", "Sleep"],
        gradientColors: { from: "rgb(168, 85, 247)", to: "rgb(216, 180, 254)" },
        properties: {
            rasa: "Bitter, Astringent",
            guna: "Light, Unctuous",
            virya: "Heating",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Stress & Anxiety Relief", description: "Reduces cortisol levels and helps the body adapt to stress naturally." },
            { title: "Enhanced Energy & Vitality", description: "Increases stamina and physical performance without stimulant effects." },
            { title: "Cognitive Support", description: "Improves memory, focus, and mental clarity." },
            { title: "Sleep Quality", description: "Promotes restful sleep and helps with insomnia." }
        ],
        usageMethods: [
            { method: "Powder with Milk", dosage: "1/2 tsp", instructions: "Mix with warm milk and honey before bed" },
            { method: "Capsules", dosage: "300-600mg", instructions: "Take with meals twice daily" },
            { method: "Churna", dosage: "3-6g", instructions: "Mix with ghee or honey" }
        ],
        cautions: ["Avoid during pregnancy", "May increase thyroid hormone levels", "Not recommended for autoimmune conditions without supervision"],
        rating: 4.9,
        reviewCount: 256
    },
    {
        id: "turmeric",
        title: "TURMERIC",
        sanskritName: "Haridra",
        botanicalName: "Curcuma longa",
        description: "Golden spice with powerful anti-inflammatory and antioxidant properties. Essential in traditional healing.",
        longDescription: "Turmeric, the golden spice of India, has been used for thousands of years in Ayurveda and traditional medicine. Its active compound curcumin gives it powerful anti-inflammatory and antioxidant properties. It is considered one of the most important herbs in Ayurveda for maintaining overall health.",
        imagePath: "/ayurvedic_plants/Turmeric.jpg",
        category: "Spice",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Anti-inflammatory", "Antioxidant", "Digestion"],
        gradientColors: { from: "rgb(245, 158, 11)", to: "rgb(251, 191, 36)" },
        properties: {
            rasa: "Bitter, Pungent",
            guna: "Light, Dry",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Anti-inflammatory Action", description: "Reduces inflammation throughout the body and joints." },
            { title: "Powerful Antioxidant", description: "Neutralizes free radicals and boosts the body's antioxidant enzymes." },
            { title: "Digestive Support", description: "Stimulates bile production and supports healthy digestion." },
            { title: "Skin Health", description: "Promotes clear, radiant skin and helps with various skin conditions." }
        ],
        usageMethods: [
            { method: "Golden Milk", dosage: "1/2 tsp", instructions: "Mix with warm milk, black pepper, and honey" },
            { method: "Fresh Juice", dosage: "10-30ml", instructions: "Extract juice from fresh rhizome" },
            { method: "Powder in Food", dosage: "1-3g", instructions: "Add to curries, soups, and dishes" }
        ],
        cautions: ["May increase bleeding risk with anticoagulants", "High doses may cause digestive upset", "Avoid before surgery"],
        rating: 4.7,
        reviewCount: 312
    },
    {
        id: "ginger",
        title: "GINGER",
        sanskritName: "Shunti (dry) / Ardrak (fresh)",
        botanicalName: "Zingiber officinale",
        description: "Warming spice that stimulates digestion, alleviates nausea, and supports respiratory health.",
        longDescription: "Ginger is called the 'universal medicine' in Ayurveda for its wide range of therapeutic applications. Fresh ginger (Ardrak) and dried ginger (Shunti) have slightly different properties but both are invaluable for digestive and respiratory health.",
        imagePath: "/ayurvedic_plants/Ginger.jpg",
        category: "Digestive",
        doshas: ["Vata", "Kapha"],
        benefits: ["Digestion", "Nausea Relief", "Circulation"],
        gradientColors: { from: "rgb(239, 68, 68)", to: "rgb(252, 165, 165)" },
        properties: {
            rasa: "Pungent",
            guna: "Light, Unctuous",
            virya: "Heating",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Digestive Fire Enhancement", description: "Kindles Agni (digestive fire) and improves appetite and digestion." },
            { title: "Nausea Relief", description: "Effective for motion sickness, morning sickness, and general nausea." },
            { title: "Respiratory Support", description: "Helps clear congestion and supports healthy respiratory function." },
            { title: "Pain Relief", description: "Reduces muscle pain, joint pain, and menstrual discomfort." }
        ],
        usageMethods: [
            { method: "Fresh Ginger Tea", dosage: "1 inch piece", instructions: "Grate and steep in hot water for 10 minutes" },
            { method: "Ginger Honey", dosage: "1/2 tsp", instructions: "Mix ginger juice with honey before meals" },
            { method: "Dry Powder", dosage: "1-2g", instructions: "Add to food or take with warm water" }
        ],
        cautions: ["May increase bile secretion - caution with gallstones", "Can interact with blood thinners", "Limit during pregnancy to culinary amounts"],
        rating: 4.8,
        reviewCount: 198
    },
    {
        id: "amla",
        title: "AMLA",
        sanskritName: "Amalaki",
        botanicalName: "Emblica officinalis",
        description: "Richest natural source of Vitamin C. Promotes longevity, strengthens immunity, and nourishes tissues.",
        longDescription: "Amla, or Indian Gooseberry, is considered one of the most powerful rejuvenating herbs in Ayurveda. It is the richest natural source of Vitamin C and balances all three doshas, making it suitable for everyone. It is a key ingredient in Chyawanprash and Triphala.",
        imagePath: "/ayurvedic_plants/Amla.jpg",
        category: "Rejuvenation",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Vitamin C", "Hair Health", "Immunity"],
        gradientColors: { from: "rgb(16, 185, 129)", to: "rgb(52, 211, 153)" },
        properties: {
            rasa: "All except Salty (primarily Sour)",
            guna: "Light, Dry, Cold",
            virya: "Cooling",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Powerful Rejuvenative", description: "Nourishes all body tissues and promotes longevity." },
            { title: "Immune Enhancement", description: "One of the best herbs for building immunity naturally." },
            { title: "Hair & Skin Health", description: "Promotes healthy hair growth and radiant skin." },
            { title: "Digestive Support", description: "Enhances digestion and helps with hyperacidity." }
        ],
        usageMethods: [
            { method: "Fresh Fruit", dosage: "1-2 fruits", instructions: "Eat fresh or as juice" },
            { method: "Amla Powder", dosage: "3-6g", instructions: "Mix with water or honey" },
            { method: "Amla Oil", dosage: "As needed", instructions: "Apply to scalp for hair health" }
        ],
        cautions: ["May lower blood sugar - monitor if diabetic", "Sour taste may aggravate some conditions", "Best taken separately from minerals"],
        rating: 4.9,
        reviewCount: 287
    },
    {
        id: "triphala",
        title: "TRIPHALA",
        sanskritName: "Triphala",
        botanicalName: "Three Fruits Blend",
        description: "Legendary formula of three fruits for digestive health, detoxification, and rejuvenation.",
        longDescription: "Triphala, meaning 'three fruits,' is one of the most famous Ayurvedic formulas. It combines Amalaki, Bibhitaki, and Haritaki in equal parts to create a balanced, gentle yet effective formula that supports digestion, detoxification, and overall health.",
        imagePath: "/ayurvedic_plants/Triphala.jpg",
        category: "Detox",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Detox", "Digestion", "Eye Health"],
        gradientColors: { from: "rgb(139, 92, 246)", to: "rgb(196, 181, 253)" },
        properties: {
            rasa: "All five tastes",
            guna: "Light, Dry",
            virya: "Neutral",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Gentle Detoxification", description: "Cleanses the digestive tract and removes accumulated toxins." },
            { title: "Digestive Regulation", description: "Supports regular bowel movements without dependency." },
            { title: "Eye Health", description: "Traditionally used as an eye wash to improve vision." },
            { title: "Rejuvenation", description: "Nourishes tissues and supports overall vitality." }
        ],
        usageMethods: [
            { method: "Powder with Water", dosage: "1-2 tsp", instructions: "Take with warm water before bed" },
            { method: "Triphala Tablets", dosage: "2-4 tablets", instructions: "Take before bed with warm water" },
            { method: "Eye Wash", dosage: "1/2 tsp in water", instructions: "Strain well and use as eye wash" }
        ],
        cautions: ["May cause loose stools initially", "Reduce dose if excessive cleansing occurs", "Not recommended during pregnancy"],
        rating: 4.8,
        reviewCount: 342
    },
    {
        id: "neem",
        title: "NEEM",
        sanskritName: "Nimba",
        botanicalName: "Azadirachta indica",
        description: "Powerful blood purifier and skin healer. Known for its antibacterial and antifungal properties.",
        longDescription: "Neem is called 'Sarva Roga Nivarini' - the healer of all ailments. This bitter herb is one of the most powerful blood purifiers and skin healers in Ayurveda. Every part of the neem tree has medicinal value.",
        imagePath: "/ayurvedic_plants/neem.jpg",
        category: "Skin Care",
        doshas: ["Pitta", "Kapha"],
        benefits: ["Skin Health", "Blood Purifier", "Antibacterial"],
        gradientColors: { from: "rgb(20, 184, 166)", to: "rgb(94, 234, 212)" },
        properties: {
            rasa: "Bitter, Astringent",
            guna: "Light, Dry",
            virya: "Cooling",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Blood Purification", description: "Cleanses toxins from blood and supports clear skin." },
            { title: "Skin Healing", description: "Effective for acne, eczema, psoriasis, and various skin conditions." },
            { title: "Antibacterial Action", description: "Fights bacterial, viral, and fungal infections." },
            { title: "Oral Health", description: "Supports healthy gums and teeth, traditionally used as tooth cleaning twig." }
        ],
        usageMethods: [
            { method: "Neem Leaves", dosage: "5-10 leaves", instructions: "Chew fresh leaves or take as juice" },
            { method: "Neem Powder", dosage: "1-3g", instructions: "Mix with water or honey" },
            { method: "Neem Oil", dosage: "External", instructions: "Apply to skin or scalp as needed" }
        ],
        cautions: ["Very cooling - may aggravate Vata", "Not for long-term internal use", "Avoid during pregnancy and when trying to conceive"],
        rating: 4.6,
        reviewCount: 178
    },
    {
        id: "brahmi",
        title: "BRAHMI",
        sanskritName: "Brahmi",
        botanicalName: "Bacopa monnieri",
        description: "Premier brain tonic that enhances memory, focus, and cognitive function. Calms the mind.",
        longDescription: "Brahmi, named after Brahma the creator, is the foremost brain tonic in Ayurveda. It enhances all aspects of mental function including memory, concentration, and learning ability while also calming the nervous system.",
        imagePath: "/ayurvedic_plants/Brahmi.jpg",
        category: "Brain Health",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Memory", "Focus", "Calm Mind"],
        gradientColors: { from: "rgb(59, 130, 246)", to: "rgb(147, 197, 253)" },
        properties: {
            rasa: "Bitter, Astringent, Sweet",
            guna: "Light, Unctuous",
            virya: "Cooling",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Memory Enhancement", description: "Improves short-term and long-term memory retention." },
            { title: "Focus & Concentration", description: "Enhances attention span and mental clarity." },
            { title: "Stress Relief", description: "Calms the nervous system and reduces anxiety." },
            { title: "Sleep Support", description: "Promotes restful sleep without causing drowsiness." }
        ],
        usageMethods: [
            { method: "Brahmi Powder", dosage: "1-3g", instructions: "Mix with warm milk or ghee" },
            { method: "Fresh Juice", dosage: "10-20ml", instructions: "Take fresh leaf juice with honey" },
            { method: "Brahmi Oil", dosage: "External", instructions: "Apply to scalp and massage" }
        ],
        cautions: ["May cause digestive upset in large doses", "Start with lower doses", "Monitor if taking sedative medications"],
        rating: 4.8,
        reviewCount: 234
    },
    {
        id: "giloy",
        title: "GILOY",
        sanskritName: "Guduchi",
        botanicalName: "Tinospora cordifolia",
        description: "Divine nectar of immortality. Powerful immunomodulator that fights infections and fever.",
        longDescription: "Giloy, also known as Guduchi or Amrita (nectar of immortality), is one of the most valued herbs in Ayurveda for immunity. It is a powerful immunomodulator that helps the body fight infections and recover from illness.",
        imagePath: "/ayurvedic_plants/Giloy.png",
        category: "Immunity",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Immunity", "Fever Relief", "Detox"],
        gradientColors: { from: "rgb(34, 197, 94)", to: "rgb(74, 222, 128)" },
        properties: {
            rasa: "Bitter, Astringent",
            guna: "Light, Unctuous",
            virya: "Heating",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Immune Modulation", description: "Strengthens and balances the immune system." },
            { title: "Fever Management", description: "Effective in reducing chronic and recurrent fevers." },
            { title: "Detoxification", description: "Purifies blood and removes toxins from the body." },
            { title: "Anti-inflammatory", description: "Reduces inflammation and joint pain." }
        ],
        usageMethods: [
            { method: "Fresh Stem Juice", dosage: "10-20ml", instructions: "Extract juice from fresh stems" },
            { method: "Giloy Satva", dosage: "500mg-1g", instructions: "Take with honey or water" },
            { method: "Giloy Kadha", dosage: "30-50ml", instructions: "Boil stems in water and drink decoction" }
        ],
        cautions: ["May lower blood sugar significantly", "Avoid in autoimmune conditions", "Stop 2 weeks before surgery"],
        rating: 4.7,
        reviewCount: 198
    },
    {
        id: "shatavari",
        title: "SHATAVARI",
        sanskritName: "Shatavari",
        botanicalName: "Asparagus racemosus",
        description: "Supreme women's tonic that supports hormonal balance, fertility, and lactation.",
        longDescription: "Shatavari, meaning 'she who possesses a hundred husbands,' is the premier women's rejuvenative herb in Ayurveda. It nourishes and supports the female reproductive system through all stages of life.",
        imagePath: "/ayurvedic_plants/Shatavari.png",
        category: "Women's Health",
        doshas: ["Vata", "Pitta"],
        benefits: ["Hormonal Balance", "Fertility", "Vitality"],
        gradientColors: { from: "rgb(236, 72, 153)", to: "rgb(249, 168, 212)" },
        properties: {
            rasa: "Sweet, Bitter",
            guna: "Heavy, Unctuous",
            virya: "Cooling",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Hormonal Balance", description: "Supports healthy hormone levels throughout life stages." },
            { title: "Fertility Support", description: "Nourishes reproductive tissues and supports conception." },
            { title: "Lactation Enhancement", description: "Traditionally used to promote healthy breast milk production." },
            { title: "Digestive Soothing", description: "Calms hyperacidity and supports digestive health." }
        ],
        usageMethods: [
            { method: "Shatavari Powder", dosage: "3-6g", instructions: "Mix with warm milk and ghee" },
            { method: "Shatavari Kalpa", dosage: "1-2 tsp", instructions: "Traditional preparation with sugar" },
            { method: "Capsules", dosage: "500mg-1g", instructions: "Take twice daily with meals" }
        ],
        cautions: ["Avoid with estrogen-sensitive conditions", "May increase Kapha if used excessively", "Consult practitioner during pregnancy"],
        rating: 4.8,
        reviewCount: 167
    },
    {
        id: "aloe-vera",
        title: "ALOE VERA",
        sanskritName: "Kumari",
        botanicalName: "Aloe barbadensis",
        description: "Cooling gel that heals skin, soothes burns, and supports digestive health internally.",
        longDescription: "Aloe Vera, called Kumari (young maiden) in Sanskrit, is valued for its cooling, soothing properties. The gel is excellent for skin healing while the internal gel supports digestive health and gentle detoxification.",
        imagePath: "/ayurvedic_plants/Aloe Vera.jpg",
        category: "Skin Care",
        doshas: ["Pitta"],
        benefits: ["Skin Healing", "Cooling", "Digestive"],
        gradientColors: { from: "rgb(16, 185, 129)", to: "rgb(167, 243, 208)" },
        properties: {
            rasa: "Bitter, Sweet, Astringent",
            guna: "Heavy, Unctuous, Slimy",
            virya: "Cooling",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Skin Healing", description: "Accelerates wound healing, soothes burns and irritation." },
            { title: "Digestive Support", description: "Supports healthy digestion and regular elimination." },
            { title: "Cooling Effect", description: "Reduces excess Pitta and calms inflammation." },
            { title: "Rejuvenation", description: "Nourishes tissues and promotes youthful vitality." }
        ],
        usageMethods: [
            { method: "Fresh Gel", dosage: "2-3 tbsp", instructions: "Scoop gel from leaf and blend with water" },
            { method: "Aloe Juice", dosage: "15-30ml", instructions: "Take on empty stomach" },
            { method: "External Gel", dosage: "As needed", instructions: "Apply fresh gel to skin" }
        ],
        cautions: ["Internal use may cause cramping", "Avoid during pregnancy", "May interact with diabetes medications"],
        rating: 4.6,
        reviewCount: 145
    },
    {
        id: "cinnamon",
        title: "CINNAMON",
        sanskritName: "Twak",
        botanicalName: "Cinnamomum verum",
        description: "Sweet warming spice that regulates blood sugar, aids digestion, and boosts metabolism.",
        longDescription: "Cinnamon is a beloved spice in both culinary and medicinal traditions. It kindles digestive fire, regulates blood sugar, and adds a sweet, warming quality to foods and remedies.",
        imagePath: "/ayurvedic_plants/Cinnamon.jpg",
        category: "Spice",
        doshas: ["Vata", "Kapha"],
        benefits: ["Blood Sugar", "Metabolism", "Warming"],
        gradientColors: { from: "rgb(180, 83, 9)", to: "rgb(217, 119, 6)" },
        properties: {
            rasa: "Pungent, Sweet",
            guna: "Light, Dry, Sharp",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Blood Sugar Regulation", description: "Helps maintain healthy blood sugar levels." },
            { title: "Digestive Enhancement", description: "Kindles digestive fire and reduces bloating." },
            { title: "Circulation Support", description: "Improves blood flow and warms the body." },
            { title: "Antimicrobial", description: "Has natural antibacterial and antifungal properties." }
        ],
        usageMethods: [
            { method: "Cinnamon Tea", dosage: "1/2 tsp", instructions: "Steep powder in hot water" },
            { method: "With Honey", dosage: "1/4 tsp", instructions: "Mix with honey and take daily" },
            { method: "In Food", dosage: "1-3g", instructions: "Add to oatmeal, smoothies, curries" }
        ],
        cautions: ["Cassia cinnamon contains coumarin - use Ceylon variety", "May interact with diabetes medications", "High doses may be hepatotoxic"],
        rating: 4.5,
        reviewCount: 132
    },
    {
        id: "cardamom",
        title: "CARDAMOM",
        sanskritName: "Ela",
        botanicalName: "Elettaria cardamomum",
        description: "Aromatic spice that aids digestion, freshens breath, and uplifts the mood.",
        longDescription: "Cardamom, the 'Queen of Spices,' is one of the most valued spices for its aromatic, digestive, and mood-enhancing properties. It balances all three doshas and is particularly effective for digestive issues.",
        imagePath: "/ayurvedic_plants/Cardamom.png",
        category: "Digestive",
        doshas: ["Vata", "Kapha"],
        benefits: ["Digestion", "Fresh Breath", "Mood Lift"],
        gradientColors: { from: "rgb(22, 163, 74)", to: "rgb(74, 222, 128)" },
        properties: {
            rasa: "Pungent, Sweet",
            guna: "Light, Dry",
            virya: "Cooling",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Digestive Support", description: "Relieves gas, bloating, and digestive discomfort." },
            { title: "Breath Freshener", description: "Naturally freshens breath and supports oral health." },
            { title: "Mood Enhancement", description: "Its aroma uplifts mood and clears the mind." },
            { title: "Respiratory Support", description: "Opens airways and supports respiratory function." }
        ],
        usageMethods: [
            { method: "Chew Seeds", dosage: "2-3 pods", instructions: "Chew after meals for digestion" },
            { method: "Cardamom Tea", dosage: "1-2 pods", instructions: "Add crushed pods to tea or milk" },
            { method: "In Cooking", dosage: "As desired", instructions: "Add to both sweet and savory dishes" }
        ],
        cautions: ["Generally very safe", "May have mild diuretic effect", "Use moderately in gallbladder issues"],
        rating: 4.7,
        reviewCount: 89
    },
    {
        id: "cumin",
        title: "CUMIN",
        sanskritName: "Jiraka",
        botanicalName: "Cuminum cyminum",
        description: "Essential digestive spice that boosts metabolism and aids nutrient absorption.",
        longDescription: "Cumin is one of the most important digestive spices in Ayurveda. It kindles digestive fire without aggravating Pitta, making it suitable for almost everyone. It enhances the absorption of nutrients from food.",
        imagePath: "/ayurvedic_plants/cumin seed.jpg",
        category: "Digestive",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Metabolism", "Digestion", "Iron Rich"],
        gradientColors: { from: "rgb(161, 98, 7)", to: "rgb(202, 138, 4)" },
        properties: {
            rasa: "Pungent",
            guna: "Light, Dry",
            virya: "Cooling",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Digestive Enhancement", description: "Stimulates digestive enzymes and improves absorption." },
            { title: "Metabolism Boost", description: "Supports healthy metabolism and weight management." },
            { title: "Gas Relief", description: "Effectively reduces bloating and flatulence." },
            { title: "Iron Source", description: "Natural source of iron for blood health." }
        ],
        usageMethods: [
            { method: "Cumin Water", dosage: "1 tsp", instructions: "Soak overnight and drink in morning" },
            { method: "Roasted Cumin", dosage: "1/2 tsp", instructions: "Sprinkle on food after cooking" },
            { method: "Cumin Tea", dosage: "1 tsp", instructions: "Boil seeds in water and strain" }
        ],
        cautions: ["Very safe for most people", "May reduce blood sugar", "Use with awareness if on medication"],
        rating: 4.6,
        reviewCount: 98
    },
    {
        id: "coriander",
        title: "CORIANDER",
        sanskritName: "Dhanyaka",
        botanicalName: "Coriandrum sativum",
        description: "Cooling herb that aids digestion, reduces inflammation, and balances Pitta.",
        longDescription: "Coriander is one of the best cooling digestive herbs in Ayurveda. Both the seeds and fresh leaves have medicinal value. It is particularly beneficial for those with Pitta imbalance.",
        imagePath: "/ayurvedic_plants/Coriander.png",
        category: "Digestive",
        doshas: ["Pitta"],
        benefits: ["Cooling", "Digestion", "Detox"],
        gradientColors: { from: "rgb(34, 197, 94)", to: "rgb(187, 247, 208)" },
        properties: {
            rasa: "Astringent, Sweet, Pungent",
            guna: "Light, Unctuous",
            virya: "Cooling",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Pitta Pacification", description: "Cools excess heat and reduces inflammation." },
            { title: "Digestive Support", description: "Aids digestion without creating heat." },
            { title: "Urinary Health", description: "Supports healthy urinary tract function." },
            { title: "Fever Management", description: "Traditionally used to reduce fever." }
        ],
        usageMethods: [
            { method: "Coriander Water", dosage: "1-2 tsp seeds", instructions: "Soak overnight, strain and drink" },
            { method: "Fresh Cilantro", dosage: "Handful", instructions: "Add to food or blend into chutney" },
            { method: "Coriander Tea", dosage: "1 tsp", instructions: "Boil seeds in water for 5 minutes" }
        ],
        cautions: ["Some people are allergic to coriander", "Very safe for most", "May cause photosensitivity in rare cases"],
        rating: 4.5,
        reviewCount: 76
    },
    {
        id: "fennel",
        title: "FENNEL",
        sanskritName: "Shatapushpa",
        botanicalName: "Foeniculum vulgare",
        description: "Sweet aromatic seeds that relieve bloating, improve digestion, and freshen breath.",
        longDescription: "Fennel is one of the best herbs for digestive comfort. It is cooling and sweet, making it suitable for all doshas. Traditionally chewed after meals to aid digestion and freshen breath.",
        imagePath: "/ayurvedic_plants/Fennel Gratin.png",
        category: "Digestive",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Bloating Relief", "Digestion", "Cooling"],
        gradientColors: { from: "rgb(132, 204, 22)", to: "rgb(190, 242, 100)" },
        properties: {
            rasa: "Sweet, Pungent",
            guna: "Light, Sharp",
            virya: "Cooling",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Gas & Bloating Relief", description: "One of the best herbs for relieving digestive discomfort." },
            { title: "Digestive Support", description: "Stimulates digestion without creating excess heat." },
            { title: "Eye Health", description: "Traditionally used to support healthy vision." },
            { title: "Lactation Support", description: "Helps promote healthy breast milk production." }
        ],
        usageMethods: [
            { method: "Chew Seeds", dosage: "1/2 tsp", instructions: "Chew after meals" },
            { method: "Fennel Tea", dosage: "1 tsp", instructions: "Steep crushed seeds in hot water" },
            { method: "CCF Tea", dosage: "Equal parts", instructions: "Mix with cumin and coriander" }
        ],
        cautions: ["Generally very safe", "May have estrogenic effects - use moderately in hormone-sensitive conditions", "Seeds can be a choking hazard for children"],
        rating: 4.6,
        reviewCount: 87
    },
    {
        id: "ajwain",
        title: "AJWAIN",
        sanskritName: "Yavani",
        botanicalName: "Trachyspermum ammi",
        description: "Potent digestive aid that relieves gas, bloating, and stomach discomfort quickly.",
        longDescription: "Ajwain, or Carom seeds, is a powerful digestive and carminative. It acts quickly to relieve digestive discomfort and is particularly effective for Vata-related digestive issues like gas and bloating.",
        imagePath: "/ayurvedic_plants/ajwain.jpg",
        category: "Digestive",
        doshas: ["Vata", "Kapha"],
        benefits: ["Gas Relief", "Digestion", "Warming"],
        gradientColors: { from: "rgb(113, 63, 18)", to: "rgb(180, 83, 9)" },
        properties: {
            rasa: "Pungent, Bitter",
            guna: "Light, Dry, Sharp",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Quick Gas Relief", description: "Acts rapidly to relieve gas and bloating." },
            { title: "Digestive Fire", description: "Strongly kindles Agni for better digestion." },
            { title: "Respiratory Support", description: "Helps clear congestion and supports breathing." },
            { title: "Pain Relief", description: "Relieves colic and abdominal pain." }
        ],
        usageMethods: [
            { method: "Chew Seeds", dosage: "1/4 tsp", instructions: "Chew with a pinch of salt after meals" },
            { method: "Ajwain Water", dosage: "1/2 tsp", instructions: "Boil in water and drink warm" },
            { method: "With Jaggery", dosage: "1/2 tsp", instructions: "Mix with jaggery for digestive issues" }
        ],
        cautions: ["Very heating - use cautiously in Pitta conditions", "May aggravate ulcers", "Use in small amounts"],
        rating: 4.5,
        reviewCount: 67
    },
    {
        id: "fenugreek",
        title: "FENUGREEK",
        sanskritName: "Methika",
        botanicalName: "Trigonella foenum-graecum",
        description: "Bitter seeds that support lactation, regulate blood sugar, and aid digestion.",
        longDescription: "Fenugreek is valued in Ayurveda for its ability to support blood sugar balance, enhance lactation, and strengthen the body. The seeds have a slightly bitter taste that becomes aromatic when toasted.",
        imagePath: "/ayurvedic_plants/Fenugreek.png",
        category: "Women's Health",
        doshas: ["Vata", "Kapha"],
        benefits: ["Lactation", "Blood Sugar", "Digestion"],
        gradientColors: { from: "rgb(101, 163, 13)", to: "rgb(163, 230, 53)" },
        properties: {
            rasa: "Bitter, Pungent",
            guna: "Light, Unctuous",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Lactation Support", description: "Traditional galactagogue to enhance breast milk production." },
            { title: "Blood Sugar Balance", description: "Helps maintain healthy blood sugar levels." },
            { title: "Digestive Support", description: "Lubricates intestines and supports elimination." },
            { title: "Hair Health", description: "Traditionally used for hair growth and scalp health." }
        ],
        usageMethods: [
            { method: "Soaked Seeds", dosage: "1-2 tsp", instructions: "Soak overnight and eat in morning" },
            { method: "Sprouts", dosage: "1-2 tbsp", instructions: "Sprout seeds and add to salads" },
            { method: "Methi Water", dosage: "1 tsp", instructions: "Boil seeds in water and drink" }
        ],
        cautions: ["May significantly lower blood sugar", "Avoid during pregnancy (may cause contractions)", "Can cause maple syrup smell in body fluids"],
        rating: 4.5,
        reviewCount: 78
    },
    {
        id: "moringa",
        title: "MORINGA",
        sanskritName: "Shigru",
        botanicalName: "Moringa oleifera",
        description: "Nutrient-dense superfood packed with vitamins, minerals, and antioxidants.",
        longDescription: "Moringa, called the 'drumstick tree,' is one of the most nutritious plants on earth. Every part of the tree is used in traditional medicine. The leaves are particularly valued for their exceptional nutritional content.",
        imagePath: "/ayurvedic_plants/Moringa.png",
        category: "Immunity",
        doshas: ["Vata", "Kapha"],
        benefits: ["Nutrition", "Energy", "Antioxidant"],
        gradientColors: { from: "rgb(34, 197, 94)", to: "rgb(74, 222, 128)" },
        properties: {
            rasa: "Pungent, Bitter",
            guna: "Light, Dry, Sharp",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Nutritional Powerhouse", description: "Contains exceptional levels of vitamins, minerals, and amino acids." },
            { title: "Energy Enhancement", description: "Provides sustained energy without caffeine." },
            { title: "Anti-inflammatory", description: "Reduces inflammation and supports joint health." },
            { title: "Blood Sugar Support", description: "Helps maintain healthy blood sugar levels." }
        ],
        usageMethods: [
            { method: "Moringa Powder", dosage: "1-2 tsp", instructions: "Add to smoothies, juices, or water" },
            { method: "Fresh Leaves", dosage: "Handful", instructions: "Add to soups, curries, or stir-fries" },
            { method: "Moringa Tea", dosage: "1 tsp leaves", instructions: "Steep in hot water for 5 minutes" }
        ],
        cautions: ["May interact with thyroid medications", "Start with small doses", "Avoid roots during pregnancy"],
        rating: 4.7,
        reviewCount: 156
    },
    {
        id: "haritaki",
        title: "HARITAKI",
        sanskritName: "Haritaki",
        botanicalName: "Terminalia chebula",
        description: "Supreme rejuvenator that cleanses the body, sharpens intellect, and promotes longevity.",
        longDescription: "Haritaki, known as the 'King of Medicines' in Tibet, is one of the most valued herbs in Ayurveda. It balances all three doshas and is particularly revered for its rejuvenating and cleansing properties.",
        imagePath: "/ayurvedic_plants/Haritaki.jpg",
        category: "Rejuvenation",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Rejuvenation", "Cleansing", "Intellect"],
        gradientColors: { from: "rgb(124, 58, 237)", to: "rgb(167, 139, 250)" },
        properties: {
            rasa: "All five tastes (except salty)",
            guna: "Light, Dry",
            virya: "Heating",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Digestive Cleansing", description: "Gently cleanses the digestive tract and removes toxins." },
            { title: "Cognitive Enhancement", description: "Sharpens memory, intelligence, and awareness." },
            { title: "Rejuvenation", description: "One of the premier Rasayana herbs for longevity." },
            { title: "Eye Health", description: "Traditionally used to support healthy vision." }
        ],
        usageMethods: [
            { method: "Haritaki Powder", dosage: "1-3g", instructions: "Take with warm water before bed" },
            { method: "Haritaki Churna", dosage: "1/2 tsp", instructions: "Mix with honey or ghee" },
            { method: "As Triphala", dosage: "Standard dose", instructions: "Combined with Amalaki and Bibhitaki" }
        ],
        cautions: ["May cause loose stools initially", "Reduce during pregnancy", "Start with small doses"],
        rating: 4.8,
        reviewCount: 134
    },
    {
        id: "bibhitaki",
        title: "BIBHITAKI",
        sanskritName: "Bibhitaki",
        botanicalName: "Terminalia bellirica",
        description: "Respiratory tonic that clears congestion and supports healthy lung function.",
        longDescription: "Bibhitaki, one of the three fruits in Triphala, is particularly valued for its effects on the respiratory system and its ability to balance Kapha dosha. It helps clear excess mucus and supports healthy elimination.",
        imagePath: "/ayurvedic_plants/Bibhitaki.jpg",
        category: "Respiratory",
        doshas: ["Pitta", "Kapha"],
        benefits: ["Respiratory", "Detox", "Eye Health"],
        gradientColors: { from: "rgb(79, 70, 229)", to: "rgb(165, 180, 252)" },
        properties: {
            rasa: "Astringent",
            guna: "Light, Dry",
            virya: "Heating",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Respiratory Clearing", description: "Helps clear congestion and excess mucus from lungs." },
            { title: "Voice Support", description: "Traditionally used to improve voice quality." },
            { title: "Eye Health", description: "Supports healthy vision and eye function." },
            { title: "Hair Health", description: "Used externally for hair growth and scalp health." }
        ],
        usageMethods: [
            { method: "Bibhitaki Powder", dosage: "1-3g", instructions: "Take with warm water or honey" },
            { method: "As Gargle", dosage: "1 tsp in water", instructions: "Gargle for sore throat" },
            { method: "In Triphala", dosage: "Standard dose", instructions: "As part of Triphala formula" }
        ],
        cautions: ["May cause dryness if used excessively", "Use with care in Vata conditions", "Best combined with other herbs"],
        rating: 4.4,
        reviewCount: 67
    },
    {
        id: "guduchi",
        title: "GUDUCHI",
        sanskritName: "Guduchi",
        botanicalName: "Tinospora cordifolia",
        description: "Nectar of life that boosts immunity, fights infections, and rejuvenates the body.",
        longDescription: "Guduchi (also known as Giloy) is called 'Amrita' or 'nectar of immortality' in Ayurveda. It is one of the most powerful immunomodulatory herbs, supporting the body's natural defense mechanisms and promoting overall vitality.",
        imagePath: "/ayurvedic_plants/Guduchi.png",
        category: "Immunity",
        doshas: ["Vata", "Pitta", "Kapha"],
        benefits: ["Immunity", "Anti-fever", "Rejuvenation"],
        gradientColors: { from: "rgb(5, 150, 105)", to: "rgb(52, 211, 153)" },
        properties: {
            rasa: "Bitter, Astringent",
            guna: "Light, Unctuous",
            virya: "Heating",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Immune Enhancement", description: "Strengthens and modulates the immune system." },
            { title: "Fever Management", description: "Excellent for chronic, recurrent, and unknown fevers." },
            { title: "Liver Support", description: "Protects and supports healthy liver function." },
            { title: "Joint Health", description: "Reduces inflammation and supports joint comfort." }
        ],
        usageMethods: [
            { method: "Fresh Stem Juice", dosage: "10-20ml", instructions: "Juice from fresh stems with honey" },
            { method: "Guduchi Churna", dosage: "1-3g", instructions: "Take with warm water or honey" },
            { method: "Guduchi Satva", dosage: "500mg-1g", instructions: "Premium extract with water" }
        ],
        cautions: ["May lower blood sugar significantly", "Avoid with immunosuppressants", "Discontinue before surgery"],
        rating: 4.8,
        reviewCount: 189
    },
    {
        id: "manjistha",
        title: "MANJISTHA",
        sanskritName: "Manjistha",
        botanicalName: "Rubia cordifolia",
        description: "Premier blood purifier that clears skin, supports lymphatic system, and reduces inflammation.",
        longDescription: "Manjistha is considered the best blood purifying herb in Ayurveda. Its name means 'bright red,' referring to its root color. It clears toxins from the blood and lymphatic system, promoting clear skin and healthy circulation.",
        imagePath: "/ayurvedic_plants/Manjistha.jpg",
        category: "Skin Care",
        doshas: ["Pitta", "Kapha"],
        benefits: ["Blood Purifier", "Skin Glow", "Lymphatic"],
        gradientColors: { from: "rgb(220, 38, 38)", to: "rgb(248, 113, 113)" },
        properties: {
            rasa: "Bitter, Sweet, Astringent",
            guna: "Heavy, Dry",
            virya: "Heating",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Blood Purification", description: "Cleanses blood and removes deep-seated toxins." },
            { title: "Skin Clarity", description: "Promotes clear, radiant skin and even complexion." },
            { title: "Lymphatic Support", description: "Helps clear stagnation in the lymphatic system." },
            { title: "Menstrual Support", description: "Helps regulate menstrual flow and relieve cramps." }
        ],
        usageMethods: [
            { method: "Manjistha Powder", dosage: "1-3g", instructions: "Take with warm water twice daily" },
            { method: "Manjistha Churna", dosage: "1/2-1 tsp", instructions: "Mix with honey or ghee" },
            { method: "External Paste", dosage: "As needed", instructions: "Apply paste to skin conditions" }
        ],
        cautions: ["May color urine and sweat red (harmless)", "Use with care in bleeding disorders", "Avoid during pregnancy"],
        rating: 4.6,
        reviewCount: 112
    },
    {
        id: "yashtimadhu",
        title: "YASHTIMADHU",
        sanskritName: "Yashtimadhu",
        botanicalName: "Glycyrrhiza glabra",
        description: "Sweet root that soothes the throat, supports respiratory health, and calms the stomach.",
        longDescription: "Yashtimadhu, or Licorice, is one of the most widely used herbs in Ayurveda. Its sweet taste and soothing properties make it excellent for respiratory and digestive issues, and it is often used as a harmonizing herb in formulas.",
        imagePath: "/ayurvedic_plants/Yastimadhu.jpg",
        category: "Respiratory",
        doshas: ["Vata", "Pitta"],
        benefits: ["Throat Care", "Respiratory", "Soothing"],
        gradientColors: { from: "rgb(234, 179, 8)", to: "rgb(253, 224, 71)" },
        properties: {
            rasa: "Sweet",
            guna: "Heavy, Unctuous",
            virya: "Cooling",
            vipaka: "Sweet"
        },
        therapeuticBenefits: [
            { title: "Throat Soothing", description: "Relieves sore throat, cough, and voice strain." },
            { title: "Respiratory Support", description: "Helps liquefy and expel mucus from the respiratory tract." },
            { title: "Digestive Soothing", description: "Calms stomach acid and supports ulcer healing." },
            { title: "Adrenal Support", description: "Supports healthy adrenal function and energy." }
        ],
        usageMethods: [
            { method: "Licorice Powder", dosage: "1-3g", instructions: "Take with honey or warm milk" },
            { method: "Licorice Tea", dosage: "1-2 sticks", instructions: "Simmer in water for 10 minutes" },
            { method: "Chew Root", dosage: "Small piece", instructions: "Chew for throat relief" }
        ],
        cautions: ["May raise blood pressure with long-term use", "Avoid in hypertension", "Limit use to 4-6 weeks"],
        rating: 4.5,
        reviewCount: 98
    },
    {
        id: "arjuna",
        title: "ARJUNA",
        sanskritName: "Arjuna",
        botanicalName: "Terminalia arjuna",
        description: "Premier heart tonic that strengthens cardiac muscles and supports cardiovascular health.",
        longDescription: "Arjuna is named after the heroic archer from the Mahabharata, symbolizing strength and courage. It is the foremost heart herb in Ayurveda, used to strengthen the heart muscle and support healthy cardiovascular function.",
        imagePath: "/ayurvedic_plants/Arjuna.jpg",
        category: "Heart Health",
        doshas: ["Pitta", "Kapha"],
        benefits: ["Heart Health", "Blood Pressure", "Strength"],
        gradientColors: { from: "rgb(239, 68, 68)", to: "rgb(252, 165, 165)" },
        properties: {
            rasa: "Astringent",
            guna: "Light, Dry",
            virya: "Cooling",
            vipaka: "Pungent"
        },
        therapeuticBenefits: [
            { title: "Heart Strengthening", description: "Tones and strengthens the heart muscle." },
            { title: "Blood Pressure Support", description: "Helps maintain healthy blood pressure levels." },
            { title: "Cholesterol Balance", description: "Supports healthy cholesterol levels." },
            { title: "Antioxidant Protection", description: "Protects heart from oxidative stress." }
        ],
        usageMethods: [
            { method: "Arjuna Powder", dosage: "3-6g", instructions: "Take with warm water or milk" },
            { method: "Arjuna Ksheerpaka", dosage: "Traditional", instructions: "Boil powder in milk and water" },
            { method: "Arjuna Capsules", dosage: "500mg-1g", instructions: "Take twice daily with meals" }
        ],
        cautions: ["May interact with heart medications", "Monitor blood pressure", "Consult practitioner for heart conditions"],
        rating: 4.7,
        reviewCount: 143
    }
];

// Helper function to get herb by ID
export function getHerbById(id: string): Herb | undefined {
    return herbs.find(herb => herb.id === id);
}

// Helper function to get related herbs (same category, different herb)
export function getRelatedHerbs(herbId: string, limit: number = 3): Herb[] {
    const currentHerb = getHerbById(herbId);
    if (!currentHerb) return [];

    return herbs
        .filter(h => h.id !== herbId && (h.category === currentHerb.category || h.doshas.some(d => currentHerb.doshas.includes(d))))
        .slice(0, limit);
}

// Export categories and doshas for filtering
export const categories = ["All", "Immunity", "Digestive", "Adaptogen", "Skin Care", "Respiratory", "Heart Health", "Women's Health", "Brain Health", "Detox", "Spice", "Rejuvenation"];
export const doshaOptions = ["Vata", "Pitta", "Kapha"];

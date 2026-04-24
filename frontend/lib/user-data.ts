// Mock user data for dashboard demonstration

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    location: string;
    avatarUrl: string;
    memberSince: string;
}

export interface DoshaConstitution {
    vata: number;
    pitta: number;
    kapha: number;
}

export interface DoshaImbalance {
    dosha: 'Vata' | 'Pitta' | 'Kapha';
    severity: 'mild' | 'moderate' | 'severe';
    symptoms: string[];
}

export interface HealthCondition {
    name: string;
    status: 'active' | 'managed' | 'resolved';
    since: string;
}

export interface Allergy {
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    hasInteraction?: boolean;
    interactionWarning?: string;
}

export interface ActivityItem {
    id: string;
    type: 'consultation' | 'remedy' | 'quiz' | 'article';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

export interface SavedRemedy {
    id: string;
    name: string;
    category: string;
    imagePath: string;
    savedAt: string;
}

export interface HealthMetric {
    date: string;
    vataBalance: number;
    pittaBalance: number;
    kaphaBalance: number;
    overallWellness: number;
}

export interface UserData {
    profile: UserProfile;
    doshaConstitution: DoshaConstitution;
    currentImbalances: DoshaImbalance[];
    healthConditions: HealthCondition[];
    allergies: Allergy[];
    medications: Medication[];
    dietaryPreferences: string[];
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    recentActivity: ActivityItem[];
    savedRemedies: SavedRemedy[];
    healthMetrics: HealthMetric[];
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    language: string;
}

// Mock user data
export const mockUserData: UserData = {
    profile: {
        id: 'user_001',
        name: 'Arjun Sharma',
        email: 'arjun.sharma@example.com',
        age: 34,
        gender: 'male',
        location: 'Mumbai, India',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
        memberSince: '2024-03-15',
    },
    doshaConstitution: {
        vata: 35,
        pitta: 40,
        kapha: 25,
    },
    currentImbalances: [
        {
            dosha: 'Pitta',
            severity: 'moderate',
            symptoms: ['Acid reflux', 'Skin irritation', 'Irritability'],
        },
        {
            dosha: 'Vata',
            severity: 'mild',
            symptoms: ['Dry skin', 'Occasional anxiety'],
        },
    ],
    healthConditions: [
        { name: 'Mild Hypertension', status: 'managed', since: '2022-06-10' },
        { name: 'Seasonal Allergies', status: 'active', since: '2020-03-01' },
        { name: 'Lower Back Pain', status: 'managed', since: '2023-01-15' },
    ],
    allergies: [
        { name: 'Peanuts', severity: 'severe' },
        { name: 'Dust', severity: 'moderate' },
        { name: 'Shellfish', severity: 'mild' },
    ],
    medications: [
        {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            hasInteraction: true,
            interactionWarning: 'Avoid with Licorice (Yashtimadhu)',
        },
        {
            name: 'Ashwagandha',
            dosage: '500mg',
            frequency: 'Twice daily',
        },
        {
            name: 'Triphala',
            dosage: '1 tsp',
            frequency: 'Before bed',
        },
    ],
    dietaryPreferences: ['Vegetarian', 'No Onion/Garlic', 'Low Spice'],
    activityLevel: 'moderate',
    recentActivity: [
        {
            id: 'act_001',
            type: 'consultation',
            title: 'Digestive Health Consultation',
            description: 'AI consultation for improving digestion and reducing bloating',
            timestamp: '2026-01-08T14:30:00',
            icon: 'chat',
        },
        {
            id: 'act_002',
            type: 'remedy',
            title: 'Viewed: Triphala Benefits',
            description: 'Explored Triphala for digestive health',
            timestamp: '2026-01-08T10:15:00',
            icon: 'leaf',
        },
        {
            id: 'act_003',
            type: 'quiz',
            title: 'Weekly Dosha Check',
            description: 'Completed weekly dosha balance assessment',
            timestamp: '2026-01-07T09:00:00',
            icon: 'quiz',
        },
        {
            id: 'act_004',
            type: 'article',
            title: 'Read: Winter Wellness Tips',
            description: 'Seasonal Ayurvedic practices for winter',
            timestamp: '2026-01-06T16:45:00',
            icon: 'article',
        },
        {
            id: 'act_005',
            type: 'remedy',
            title: 'Saved: Ashwagandha',
            description: 'Added Ashwagandha to favorites',
            timestamp: '2026-01-05T11:20:00',
            icon: 'bookmark',
        },
    ],
    savedRemedies: [
        {
            id: 'tulsi',
            name: 'Tulsi',
            category: 'Immunity',
            imagePath: '/ayurvedic_plants/Tulsi.png',
            savedAt: '2026-01-05',
        },
        {
            id: 'ashwagandha',
            name: 'Ashwagandha',
            category: 'Adaptogen',
            imagePath: '/ayurvedic_plants/Ashwagandha.jpg',
            savedAt: '2026-01-04',
        },
        {
            id: 'triphala',
            name: 'Triphala',
            category: 'Detox',
            imagePath: '/ayurvedic_plants/Triphala.jpg',
            savedAt: '2026-01-03',
        },
        {
            id: 'brahmi',
            name: 'Brahmi',
            category: 'Brain Health',
            imagePath: '/ayurvedic_plants/Brahmi.jpg',
            savedAt: '2026-01-02',
        },
    ],
    healthMetrics: [
        { date: 'Jan 1', vataBalance: 65, pittaBalance: 55, kaphaBalance: 80, overallWellness: 68 },
        { date: 'Jan 2', vataBalance: 68, pittaBalance: 58, kaphaBalance: 78, overallWellness: 70 },
        { date: 'Jan 3', vataBalance: 70, pittaBalance: 52, kaphaBalance: 82, overallWellness: 72 },
        { date: 'Jan 4', vataBalance: 72, pittaBalance: 55, kaphaBalance: 80, overallWellness: 74 },
        { date: 'Jan 5', vataBalance: 75, pittaBalance: 60, kaphaBalance: 78, overallWellness: 76 },
        { date: 'Jan 6', vataBalance: 73, pittaBalance: 58, kaphaBalance: 82, overallWellness: 75 },
        { date: 'Jan 7', vataBalance: 78, pittaBalance: 62, kaphaBalance: 85, overallWellness: 78 },
    ],
    notifications: {
        email: true,
        push: true,
        sms: false,
    },
    language: 'English',
};

// Seasonal wellness tips
export const seasonalTips = [
    {
        season: 'Winter',
        tips: [
            'Favor warm, cooked foods and avoid cold drinks',
            'Practice Abhyanga (self-massage) with warm sesame oil',
            'Drink ginger tea to keep Kapha balanced',
            'Include warming spices like cinnamon and black pepper',
        ],
    },
];

// Wellness quote of the day
export const wellnessQuote = {
    text: "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need.",
    author: "Ayurvedic Proverb",
};

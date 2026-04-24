'use client';

import React from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell,
    ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────
interface ProfileData {
    basic_profile: {
        full_name: string;
        age: number;
        gender: string;
        height: number | null;
        weight: number | null;
        location: string;
        occupation: string;
        activity_level: string;
    };
    health_metrics: {
        blood_pressure: string;
        blood_sugar_fasting: string;
        blood_sugar_post_meal: string;
        cholesterol: string;
        thyroid_levels: string;
        heart_rate: string;
        sleep_duration: string;
        stress_level: number;
    };
    diet_info: {
        diet_type: string;
        food_allergies: string;
        daily_water_intake: string;
        current_diet_pattern: string;
        cheat_meal_frequency: string;
        supplements: string;
    };
    medical_history: {
        conditions: string[];
        injury_history: string;
        surgery_history: string;
        consent: boolean;
    };
}

// ─── Color Palette ──────────────────────────────────────────
const COLORS = {
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    blue: '#3b82f6',
    orange: '#f97316',
};

const PIE_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e'];

// ─── Helpers ────────────────────────────────────────────────
function parseNumeric(val: string | undefined | null): number | null {
    if (!val) return null;
    const num = parseFloat(val.replace(/[^\d.]/g, ''));
    return isNaN(num) ? null : num;
}

function calcBMI(height: number | null, weight: number | null): number | null {
    if (!height || !weight || height <= 0) return null;
    const heightM = height / 100;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

function getBMICategory(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: 'Underweight', color: COLORS.amber };
    if (bmi < 25) return { label: 'Normal', color: COLORS.emerald };
    if (bmi < 30) return { label: 'Overweight', color: COLORS.orange };
    return { label: 'Obese', color: COLORS.rose };
}

// ─── BMI Gauge ──────────────────────────────────────────────
function BMIGauge({ bmi }: { bmi: number }) {
    const category = getBMICategory(bmi);
    const gaugeData = [
        { name: 'BMI', value: Math.min(bmi, 40) },
        { name: 'Remaining', value: Math.max(40 - bmi, 0) },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                Body Mass Index (BMI)
            </h3>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={gaugeData}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={28}
                                outerRadius={40}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={category.color} />
                                <Cell fill="#f3f4f6" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <p className="text-3xl font-bold" style={{ color: category.color }}>{bmi}</p>
                    <p className="text-sm text-gray-500">{category.label}</p>
                </div>
            </div>
            <div className="mt-3 flex gap-1">
                {['Underweight', 'Normal', 'Overweight', 'Obese'].map((label) => {
                    const c = getBMICategory(label === 'Underweight' ? 17 : label === 'Normal' ? 22 : label === 'Overweight' ? 27 : 35);
                    return (
                        <div key={label} className="flex-1 text-center">
                            <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: c.color, opacity: category.label === label ? 1 : 0.25 }} />
                            <span className="text-[10px] text-gray-400">{label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Health Metrics Radar ───────────────────────────────────
function HealthRadar({ metrics }: { metrics: ProfileData['health_metrics'] }) {
    const stressScore = metrics.stress_level ? (10 - metrics.stress_level) * 10 : 50;
    const sleepHours = parseNumeric(metrics.sleep_duration);
    const sleepScore = sleepHours ? Math.min((sleepHours / 8) * 100, 100) : 50;
    const heartRate = parseNumeric(metrics.heart_rate);
    const heartScore = heartRate ? (heartRate >= 60 && heartRate <= 100 ? 90 : heartRate < 60 ? 70 : 50) : 50;

    const bp = metrics.blood_pressure;
    let bpScore = 50;
    if (bp) {
        const parts = bp.split('/');
        if (parts.length === 2) {
            const sys = parseFloat(parts[0]);
            if (!isNaN(sys)) {
                bpScore = sys <= 120 ? 90 : sys <= 140 ? 70 : 40;
            }
        }
    }

    const sugarFasting = parseNumeric(metrics.blood_sugar_fasting);
    const sugarScore = sugarFasting ? (sugarFasting <= 100 ? 90 : sugarFasting <= 126 ? 60 : 30) : 50;

    const cholesterol = parseNumeric(metrics.cholesterol);
    const cholScore = cholesterol ? (cholesterol < 200 ? 90 : cholesterol < 240 ? 60 : 30) : 50;

    const radarData = [
        { metric: 'Stress Mgmt', score: stressScore, fullMark: 100 },
        { metric: 'Sleep', score: sleepScore, fullMark: 100 },
        { metric: 'Heart Rate', score: heartScore, fullMark: 100 },
        { metric: 'Blood Pressure', score: bpScore, fullMark: 100 },
        { metric: 'Blood Sugar', score: sugarScore, fullMark: 100 },
        { metric: 'Cholesterol', score: cholScore, fullMark: 100 },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-1">Health Score Radar</h3>
            <p className="text-xs text-gray-400 mb-3">Higher = healthier (based on your metrics)</p>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Health Score"
                            dataKey="score"
                            stroke={COLORS.emerald}
                            fill={COLORS.emerald}
                            fillOpacity={0.2}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                            formatter={(value: number | undefined) => [`${value ?? 0}/100`, 'Score']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Vitals Bar Chart ───────────────────────────────────────
function VitalsBarChart({ metrics, profile }: { metrics: ProfileData['health_metrics']; profile: ProfileData['basic_profile'] }) {
    const vitals: { name: string; value: number; unit: string; color: string }[] = [];

    const heartRate = parseNumeric(metrics.heart_rate);
    if (heartRate) vitals.push({ name: 'Heart Rate', value: heartRate, unit: 'bpm', color: COLORS.rose });

    const sugarFasting = parseNumeric(metrics.blood_sugar_fasting);
    if (sugarFasting) vitals.push({ name: 'Sugar (Fast)', value: sugarFasting, unit: 'mg/dL', color: COLORS.amber });

    const sugarPost = parseNumeric(metrics.blood_sugar_post_meal);
    if (sugarPost) vitals.push({ name: 'Sugar (Post)', value: sugarPost, unit: 'mg/dL', color: COLORS.orange });

    const cholesterol = parseNumeric(metrics.cholesterol);
    if (cholesterol) vitals.push({ name: 'Cholesterol', value: cholesterol, unit: 'mg/dL', color: COLORS.violet });

    if (profile.weight) vitals.push({ name: 'Weight', value: profile.weight, unit: 'kg', color: COLORS.blue });

    if (vitals.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-1">Key Vitals</h3>
            <p className="text-xs text-gray-400 mb-3">Your recorded health measurements</p>
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vitals} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 11, fill: '#4b5563' }}
                            width={85}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={((value: number | undefined, _name: string, props: any) => [`${value ?? 0} ${props?.payload?.unit ?? ''}`, '']) as any}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                            {vitals.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Conditions Distribution Pie ────────────────────────────
function ConditionsPie({ conditions }: { conditions: string[] }) {
    if (conditions.length === 0) return null;

    const data = conditions.map((c, i) => ({
        name: c,
        value: 1,
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-1">Medical Conditions</h3>
            <p className="text-xs text-gray-400 mb-3">Your tracked health conditions</p>
            <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={50}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.map((item) => (
                        <span
                            key={item.name}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Lifestyle Score Cards ──────────────────────────────────
function LifestyleScoreCards({ profile }: { profile: ProfileData }) {
    const { health_metrics: hm, diet_info: di, basic_profile: bp } = profile;

    const cards: { label: string; value: string; emoji: string; color: string; subtext?: string }[] = [];

    // Stress
    if (hm.stress_level) {
        const stressColor = hm.stress_level <= 3 ? COLORS.emerald : hm.stress_level <= 6 ? COLORS.amber : COLORS.rose;
        const stressLabel = hm.stress_level <= 3 ? 'Low' : hm.stress_level <= 6 ? 'Moderate' : 'High';
        cards.push({ label: 'Stress', value: `${hm.stress_level}/10`, emoji: '🧘', color: stressColor, subtext: stressLabel });
    }

    // Sleep
    const sleepHours = parseNumeric(hm.sleep_duration);
    if (sleepHours) {
        const sleepColor = sleepHours >= 7 ? COLORS.emerald : sleepHours >= 5 ? COLORS.amber : COLORS.rose;
        cards.push({ label: 'Sleep', value: `${sleepHours}h`, emoji: '🌙', color: sleepColor, subtext: sleepHours >= 7 ? 'Good' : 'Needs improvement' });
    }

    // Water
    const water = parseNumeric(di.daily_water_intake);
    if (water) {
        const waterColor = water >= 3 ? COLORS.emerald : water >= 2 ? COLORS.amber : COLORS.rose;
        cards.push({ label: 'Water', value: `${water}L`, emoji: '💧', color: waterColor, subtext: water >= 3 ? 'Well hydrated' : 'Drink more' });
    }

    // Activity
    const activityEmoji = bp.activity_level === 'active' ? '🏃' : bp.activity_level === 'moderate' ? '🚶' : '🪑';
    const activityColor = bp.activity_level === 'active' ? COLORS.emerald : bp.activity_level === 'moderate' ? COLORS.amber : COLORS.rose;
    cards.push({
        label: 'Activity',
        value: bp.activity_level?.charAt(0).toUpperCase() + bp.activity_level?.slice(1),
        emoji: activityEmoji,
        color: activityColor,
    });

    // Diet Type
    if (di.diet_type) {
        const dietEmoji = di.diet_type === 'vegetarian' ? '🥬' : di.diet_type === 'vegan' ? '🌱' : '🍗';
        cards.push({ label: 'Diet', value: di.diet_type.charAt(0).toUpperCase() + di.diet_type.slice(1), emoji: dietEmoji, color: COLORS.teal });
    }

    if (cards.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="text-2xl mb-2">{card.emoji}</div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: card.color }}>{card.value}</p>
                    {card.subtext && <p className="text-[10px] text-gray-400 mt-0.5">{card.subtext}</p>}
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function HealthStatsCharts({ profile }: { profile: ProfileData }) {
    const bmi = calcBMI(profile.basic_profile.height, profile.basic_profile.weight);

    return (
        <div className="space-y-4">
            {/* Lifestyle Score Cards */}
            <LifestyleScoreCards profile={profile} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BMI Gauge */}
                {bmi && <BMIGauge bmi={bmi} />}

                {/* Health Radar */}
                <HealthRadar metrics={profile.health_metrics} />

                {/* Vitals Bar Chart */}
                <VitalsBarChart metrics={profile.health_metrics} profile={profile.basic_profile} />

                {/* Conditions Pie */}
                <ConditionsPie conditions={profile.medical_history.conditions} />
            </div>
        </div>
    );
}

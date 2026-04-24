'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarDoshaChartProps {
    vata: number;
    pitta: number;
    kapha: number;
}



export default function RadarDoshaChart({ vata, pitta, kapha }: RadarDoshaChartProps) {
    const chartData = [
        { subject: 'Air & Space (Vata)', value: vata, fullMark: 100 },
        { subject: 'Fire & Water (Pitta)', value: pitta, fullMark: 100 },
        { subject: 'Earth & Water (Kapha)', value: kapha, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Dosha Level"
                        dataKey="value"
                        stroke="#059669"
                        strokeWidth={3}
                        fill="#10b981"
                        fillOpacity={0.5}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

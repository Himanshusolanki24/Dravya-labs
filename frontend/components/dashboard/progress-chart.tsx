'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HealthMetric } from '@/lib/user-data';

interface ProgressChartProps {
    data: HealthMetric[];
}

const DOSHA_COLORS = {
    vataBalance: '#3B82F6',
    pittaBalance: '#F59E0B',
    kaphaBalance: '#14B8A6',
    overallWellness: '#10B981',
};

// CustomTooltip defined outside component to avoid re-creation on render
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name === 'vataBalance' ? 'Vata' :
                            entry.name === 'pittaBalance' ? 'Pitta' :
                                entry.name === 'kaphaBalance' ? 'Kapha' : 'Overall'}: {entry.value}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ProgressChart({ data }: ProgressChartProps) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={(value) => {
                        const labels: Record<string, string> = {
                            vataBalance: 'Vata',
                            pittaBalance: 'Pitta',
                            kaphaBalance: 'Kapha',
                            overallWellness: 'Overall',
                        };
                        return <span className="text-xs font-medium">{labels[value] || value}</span>;
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="vataBalance"
                    stroke={DOSHA_COLORS.vataBalance}
                    strokeWidth={2}
                    dot={{ r: 3, fill: DOSHA_COLORS.vataBalance }}
                    activeDot={{ r: 5 }}
                />
                <Line
                    type="monotone"
                    dataKey="pittaBalance"
                    stroke={DOSHA_COLORS.pittaBalance}
                    strokeWidth={2}
                    dot={{ r: 3, fill: DOSHA_COLORS.pittaBalance }}
                    activeDot={{ r: 5 }}
                />
                <Line
                    type="monotone"
                    dataKey="kaphaBalance"
                    stroke={DOSHA_COLORS.kaphaBalance}
                    strokeWidth={2}
                    dot={{ r: 3, fill: DOSHA_COLORS.kaphaBalance }}
                    activeDot={{ r: 5 }}
                />
                <Line
                    type="monotone"
                    dataKey="overallWellness"
                    stroke={DOSHA_COLORS.overallWellness}
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: DOSHA_COLORS.overallWellness }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

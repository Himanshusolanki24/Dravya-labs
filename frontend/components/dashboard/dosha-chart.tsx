'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from 'recharts';

interface DoshaChartProps {
    vata: number;
    pitta: number;
    kapha: number;
    size?: 'small' | 'medium' | 'large';
}

const DOSHA_COLORS = {
    Vata: '#3B82F6',   // Blue
    Pitta: '#F59E0B',  // Amber/Orange
    Kapha: '#14B8A6',  // Teal
};

// CustomTooltip defined outside component to avoid re-creation on render
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100">
                <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
                    {payload[0].name}: {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

// renderCustomLabel defined outside component
const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    
    // Handle potentially undefined values
    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
        return null;
    }

    const RADIAN = Math.PI / 180;
    const cxNum = Number(cx);
    const cyNum = Number(cy);
    const innerR = Number(innerRadius);
    const outerR = Number(outerRadius);
    const radius = innerR + (outerR - innerR) * 0.5;
    const x = cxNum + radius * Math.cos(-midAngle * RADIAN);
    const y = cyNum + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.1) return null;

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs font-bold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function DoshaChart({ vata, pitta, kapha, size = 'medium' }: DoshaChartProps) {
    const data = [
        { name: 'Vata', value: vata, color: DOSHA_COLORS.Vata },
        { name: 'Pitta', value: pitta, color: DOSHA_COLORS.Pitta },
        { name: 'Kapha', value: kapha, color: DOSHA_COLORS.Kapha },
    ];

    const dimensions = {
        small: { width: 150, height: 150, innerRadius: 30, outerRadius: 55 },
        medium: { width: 200, height: 200, innerRadius: 40, outerRadius: 75 },
        large: { width: 280, height: 280, innerRadius: 55, outerRadius: 100 },
    };

    const { innerRadius, outerRadius } = dimensions[size];

    return (
        <div className="flex flex-col items-center">
            <ResponsiveContainer width={dimensions[size].width} height={dimensions[size].height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
                {data.map((dosha) => (
                    <div key={dosha.name} className="flex items-center gap-1.5">
                        <div
                            className="size-3 rounded-full"
                            style={{ backgroundColor: dosha.color }}
                        />
                        <span className="text-xs font-medium text-gray-600">{dosha.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

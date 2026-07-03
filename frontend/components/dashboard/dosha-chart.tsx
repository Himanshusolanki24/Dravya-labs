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
    // Reorder data to match the design (Pitta Orange on left, Vata Blue top right, Kapha Green bottom right)
    const data = [
        { name: 'Pitta', value: pitta, color: '#F8971C' }, // Bright Orange
        { name: 'Vata', value: vata, color: '#3282F6' },   // Bright Blue
        { name: 'Kapha', value: kapha, color: '#21C482' }, // Bright Green
    ];

    const dimensions = {
        small: { width: 200, height: 120, innerRadius: 25, outerRadius: 50 },
        medium: { width: 320, height: 160, innerRadius: 35, outerRadius: 70 },
        large: { width: 400, height: 200, innerRadius: 45, outerRadius: 90 },
    };

    const { innerRadius, outerRadius, width, height } = dimensions[size];

    return (
        <div className="flex items-center justify-between w-full pr-4">
            {/* Chart Side */}
            <div className="relative flex-shrink-0">
                <ResponsiveContainer width={height * 1.2} height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                            labelLine={false}
                            label={renderCustomLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={{ outline: 'none' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend Side */}
            <div className="flex flex-col gap-3 justify-center">
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-[#3282F6]"></div>
                    <span className="text-sm font-semibold text-gray-700">Vata</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-[#F8971C]"></div>
                    <span className="text-sm font-semibold text-gray-700">Pitta</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-[#21C482]"></div>
                    <span className="text-sm font-semibold text-gray-700">Kapha</span>
                </div>
            </div>
        </div>
    );
}

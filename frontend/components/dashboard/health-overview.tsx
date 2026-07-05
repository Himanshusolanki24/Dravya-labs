'use client';

import React from 'react';
import { Leaf, ArrowRight, Flame, Wind } from 'lucide-react';

export function HealthOverview() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 @container">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 text-[#347659]">
                        <Leaf className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1F2937] text-xl leading-tight">Health Overview</h3>
                        <p className="text-[14px] text-[#6B7280]">Your body&apos;s signals at a glance</p>
                    </div>
                </div>
                <button className="text-[13px] font-semibold text-[#1A6136] flex items-center gap-1.5 hover:text-[#104825] bg-white border border-[#E8F4E8] px-4 py-2 rounded-full transition-colors shadow-sm">
                    View Full Report <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 @[420px]:grid-cols-2 @[750px]:grid-cols-4 gap-4">
                {/* Pitta Card */}
                <div className="rounded-[16px] border border-gray-100 p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-[160px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center text-[#F97316] shrink-0">
                            <Flame className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[#1F2937] text-[15px]">Pitta</span>
                    </div>
                    <div className="mt-auto mb-4">
                        <h4 className="text-[#F97316] font-bold text-[17px] leading-tight mb-1">Moderate</h4>
                        <p className="text-[13px] font-medium text-[#6B7280]">Needs Balance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#F3F4F6] rounded-full h-2">
                            <div className="bg-[#F97316] h-full rounded-full" style={{ width: '40%' }}></div>
                        </div>
                        <span className="text-[13px] font-bold text-[#4B5563]">40%</span>
                    </div>
                </div>
                {/* Vata Card */}
                <div className="rounded-[16px] border border-gray-100 p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-[160px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] shrink-0">
                            <Wind className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[#1F2937] text-[15px]">Vata</span>
                    </div>
                    <div className="mt-auto mb-4">
                        <h4 className="text-[#3B82F6] font-bold text-[17px] leading-tight mb-1">Balanced</h4>
                        <p className="text-[13px] font-medium text-[#6B7280]">Good</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#F3F4F6] rounded-full h-2">
                            <div className="bg-[#3B82F6] h-full rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-[13px] font-bold text-[#4B5563]">35%</span>
                    </div>
                </div>
                {/* Kapha Card */}
                <div className="rounded-[16px] border border-gray-100 p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-[160px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#22C55E] shrink-0">
                            <Leaf className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[#1F2937] text-[15px]">Kapha</span>
                    </div>
                    <div className="mt-auto mb-4">
                        <h4 className="text-[#22C55E] font-bold text-[17px] leading-tight mb-1">Mild</h4>
                        <p className="text-[13px] font-medium text-[#6B7280]">Slightly Elevated</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#F3F4F6] rounded-full h-2">
                            <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <span className="text-[13px] font-bold text-[#4B5563]">25%</span>
                    </div>
                </div>
                {/* Agni Card */}
                <div className="rounded-[16px] border border-gray-100 p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-[160px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FAF5FF] flex items-center justify-center text-[#9333EA] shrink-0">
                            <Flame className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[#1F2937] text-[15px] leading-tight">Agni</span>
                            <span className="text-[11px] font-medium text-[#6B7280]">(Digestive Fire)</span>
                        </div>
                    </div>
                    <div className="mt-auto mb-4">
                        <h4 className="text-[#9333EA] font-bold text-[17px] leading-tight mb-1">Good</h4>
                        <p className="text-[13px] font-medium text-[#6B7280]">Strong</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#F3F4F6] rounded-full h-2">
                            <div className="bg-[#9333EA] h-full rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <span className="text-[13px] font-bold text-[#4B5563]">80%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

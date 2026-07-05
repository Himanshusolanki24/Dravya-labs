'use client';

import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export function HealthAlerts() {
    return (
        <div className="bg-[#FFF5F5] rounded-2xl p-6 border border-[#FEE2E2] relative overflow-hidden">
            {/* Subtle organic gradient glow instead of crude SVG */}
            <div className="absolute top-0 right-0 w-[300px] h-full pointer-events-none">
                <div className="absolute top-[-30%] right-[-20%] w-[250px] h-[250px] rounded-full bg-[#FECACA]/20 blur-[80px]"></div>
                <div className="absolute bottom-[-20%] right-[10%] w-[180px] h-[180px] rounded-full bg-[#FCA5A5]/10 blur-[60px]"></div>
            </div>
            
            <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="text-[#EF4444] shrink-0">
                    <ShieldAlert className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="font-bold text-[#1F2937] text-xl leading-tight">Health Alerts</h3>
                    <p className="text-[14px] text-[#6B7280]">Important insights for your wellbeing</p>
                </div>
            </div>
            
            <div className="bg-[#FFF1F2] border border-[#FEE2E2] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 text-[#EF4444]">
                        <AlertCircle className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[14px] font-bold text-[#1F2937] mb-1">
                            Your Pitta levels have been higher than normal for 5 days.
                        </p>
                        <p className="text-[13px] text-[#4B5563] font-medium">
                            Consider following a cooling diet and avoiding spicy, oily foods.
                        </p>
                    </div>
                </div>
                <button className="shrink-0 bg-white border border-[#FEE2E2] text-[#EF4444] font-bold text-[13px] px-5 py-2.5 rounded-full hover:bg-[#FEF2F2] transition-colors">
                    View Recommendations
                </button>
            </div>
        </div>
    );
}

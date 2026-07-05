'use client';

import React from 'react';
import { History, ArrowRight, MessageSquare, Leaf, FileText } from 'lucide-react';

export function RecentActivity() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[300px] h-full">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#347659]" />
                    <h3 className="font-bold text-[#1F2937] text-lg">Recent Activity</h3>
                </div>
                <button className="text-[13px] font-semibold text-[#1A6136] flex items-center gap-1 hover:text-[#104825] transition-colors">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <div className="space-y-0 flex-1">
                {/* Item 1 */}
                <div className="flex items-center justify-between group cursor-pointer py-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F2F9F2] flex items-center justify-center text-[#347659] transition-colors">
                            <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="text-[14px] font-semibold text-[#374151] group-hover:text-[#1A6136] transition-colors">Chat about indigestion</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#6B7280]">2 hours ago</span>
                </div>
                
                {/* Item 2 */}
                <div className="flex items-center justify-between group cursor-pointer py-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F2F9F2] flex items-center justify-center text-[#347659] transition-colors">
                            <Leaf className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="text-[14px] font-semibold text-[#374151] group-hover:text-[#1A6136] transition-colors">Ashwagandha benefits</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#6B7280]">1 day ago</span>
                </div>
                
                {/* Item 3 */}
                <div className="flex items-center justify-between group cursor-pointer py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F2F9F2] flex items-center justify-center text-[#347659] transition-colors">
                            <FileText className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="text-[14px] font-semibold text-[#374151] group-hover:text-[#1A6136] transition-colors">Pitta imbalance symptoms</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#6B7280]">2 days ago</span>
                </div>
            </div>
        </div>
    );
}

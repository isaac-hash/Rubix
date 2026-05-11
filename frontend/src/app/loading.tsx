"use client";

import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen w-screen bg-[#0b0f10] flex items-center justify-center fixed inset-0 z-[200]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 bg-[#10b981] rounded-[4px] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
            <Zap className="h-8 w-8 text-[#0b0f10] fill-current" />
          </div>
          <div className="absolute -inset-4 border border-[#10b981]/20 rounded-[8px] animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-[0.3em]">Rubix</span>
          <span className="text-[10px] font-medium text-[#10b981] uppercase tracking-[0.1em]">Initializing Infrastructure</span>
        </div>
      </div>
    </div>
  );
}

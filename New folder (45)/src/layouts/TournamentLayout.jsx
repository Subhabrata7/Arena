import React from "react";
import { cn } from "../utils/cn";

/**
 * TournamentLayout
 * - NO top bar
 * - NO bottom bar
 * - Tabs rendered as section chips
 * - Mobile-first
 */
export default function TournamentLayout({
  title,
  status,
  tabs,
  activeTab,
  onTabChange,
  children,
}) {
  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 space-y-8">
      {/* TITLE */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10">
            {status}
          </span>
        </div>
      </div>

      {/* TAB CHIPS */}
      <div className="flex gap-2 flex-wrap no-scrollbar overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
              activeTab === tab
                ? "bg-[#39FF14] text-black border-[#39FF14]"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-4 md:p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

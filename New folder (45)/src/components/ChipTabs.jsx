import React from "react";
import { cn } from "../utils/cn";

export default function ChipTabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn("flex gap-2 flex-wrap no-scrollbar overflow-x-auto", className)}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
            active === t
              ? "bg-[#39FF14] text-black border-[#39FF14]"
              : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

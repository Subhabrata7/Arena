import React from "react";

export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="py-16 text-center space-y-4">
      <div className="text-slate-200 text-xl font-black italic uppercase tracking-tight">
        {title}
      </div>
      {subtitle && (
        <div className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
          {subtitle}
        </div>
      )}
      {action && <div className="pt-6 flex justify-center">{action}</div>}
    </div>
  );
}

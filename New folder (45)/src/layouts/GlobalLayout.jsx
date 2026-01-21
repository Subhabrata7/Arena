import React from "react";

export default function GlobalLayout({ title, subtitle, actions, children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* HEADER */}
      <header className="space-y-3 border-l-4 border-[#39FF14] pl-6">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em]">
            {subtitle}
          </p>
        )}
      </header>

      {/* ACTIONS */}
      {actions && (
        <div className="flex flex-wrap gap-4">
          {actions}
        </div>
      )}

      {/* CONTENT */}
      <section className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-6 md:p-10 shadow-2xl">
        {children}
      </section>
    </div>
  );
}

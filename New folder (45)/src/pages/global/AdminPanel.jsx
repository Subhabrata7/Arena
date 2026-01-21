import React from "react";
import EmptyState from "../../components/EmptyState";

export default function AdminPanel({ tournaments = [], myUid, onCreateTournament, onEnterTournament }) {
  const owned = tournaments.filter((t) => t.ownerId === myUid);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
            Organizer Tools
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.35em]">
            Create • manage • publish
          </div>
        </div>

        <button
          onClick={onCreateTournament}
          className="px-8 py-4 rounded-2xl bg-[#39FF14] text-black font-black uppercase text-[11px] tracking-[0.35em] shadow-2xl hover:scale-[1.02] transition-transform"
        >
          Create Tournament
        </button>
      </div>

      {!owned.length ? (
        <EmptyState title="No tournaments owned by you" subtitle="Create one to unlock full admin controls." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {owned.map((t) => (
            <button
              key={t.id}
              onClick={() => onEnterTournament(t.id)}
              className="text-left rounded-[2.2rem] border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all shadow-2xl p-7"
            >
              <div className="text-xl font-black italic uppercase tracking-tighter text-white">
                {t.name}
              </div>
              <div className="mt-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.35em]">
                {t.format} • {t.status}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React from "react";

/* =========================
   BROWSE TOURNAMENTS
========================= */

export default function BrowseTournaments({
  tournaments = [],
  onEnterTournament,
}) {
  if (!tournaments.length) {
    return (
      <div className="text-center py-32 text-slate-600 font-black uppercase tracking-[0.4em] text-[11px]">
        No tournaments available
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
          Browse Tournaments
        </h2>
        <p className="mt-2 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
          Public Arenas
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tournaments.map((t) => (
          <TournamentCard
            key={t.id}
            tournament={t}
            onEnter={() => onEnterTournament(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   TOURNAMENT CARD
========================= */

function TournamentCard({ tournament, onEnter }) {
  const {
    name,
    format,
    mode,
    status,
    maxPlayers,
    playerCount,
    type,
    entryFee,
  } = tournament;

  return (
    <div
      onClick={onEnter}
      className="group cursor-pointer rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl hover:border-[#39FF14]/40 transition-all relative overflow-hidden"
    >
      {/* GLOW */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#39FF14]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* TITLE */}
      <div className="relative z-10 space-y-2">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-[#39FF14] transition-colors">
          {name}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge label={format} />
          <Badge label={mode} />
          <Badge label={status} highlight />
        </div>
      </div>

      {/* META */}
      <div className="relative z-10 mt-8 space-y-4">
        <MetaRow
          label="Players"
          value={`${playerCount || 0} / ${maxPlayers}`}
        />
        <MetaRow
          label="Entry"
          value={type === "Paid" ? `₹ ${entryFee}` : "Free"}
        />
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-8">
        <div className="w-full text-center py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 group-hover:bg-[#39FF14] group-hover:text-black transition-all">
          Enter Arena
        </div>
      </div>
    </div>
  );
}

/* =========================
   SMALL UI PARTS
========================= */

function Badge({ label, highlight }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
        ${
          highlight
            ? "border-[#39FF14]/40 text-[#39FF14]"
            : "border-white/10 text-slate-400"
        }`}
    >
      {label}
    </span>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}

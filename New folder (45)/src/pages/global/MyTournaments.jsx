import React, { useMemo } from "react";

/* =========================
   MY TOURNAMENTS
========================= */

export default function MyTournaments({
  tournaments = [],
  myUid,
  onEnterTournament,
}) {
  const { joined, owned } = useMemo(() => {
    const joined = [];
    const owned = [];

    tournaments.forEach((t) => {
      if (t.ownerId === myUid || (t.adminIds || []).includes(myUid)) {
        owned.push(t);
      } else if ((t.participants || []).includes(myUid)) {
        joined.push(t);
      }
    });

    return { joined, owned };
  }, [tournaments, myUid]);

  return (
    <div className="space-y-14 animate-in fade-in duration-500">
      {/* OWNED */}
      <Section
        title="Managed by You"
        subtitle="Organizer / Admin"
        tournaments={owned}
        onEnterTournament={onEnterTournament}
        emptyText="You are not managing any tournaments yet."
      />

      {/* JOINED */}
      <Section
        title="Joined Tournaments"
        subtitle="Your Active Arenas"
        tournaments={joined}
        onEnterTournament={onEnterTournament}
        emptyText="You have not joined any tournaments yet."
      />
    </div>
  );
}

/* =========================
   SECTION
========================= */

function Section({
  title,
  subtitle,
  tournaments,
  onEnterTournament,
  emptyText,
}) {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
          {title}
        </h2>
        <p className="mt-2 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
          {subtitle}
        </p>
      </div>

      {/* CONTENT */}
      {tournaments.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-10 text-center text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onEnter={() => onEnterTournament(t.id)}
            />
          ))}
        </div>
      )}
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
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-8">
        <div className="w-full text-center py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 group-hover:bg-[#39FF14] group-hover:text-black transition-all">
          Open Tournament
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

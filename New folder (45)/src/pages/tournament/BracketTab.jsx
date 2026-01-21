import React, { useMemo } from "react";

/* =========================
   BRACKET TAB
========================= */

export default function BracketTab({ matches = [] }) {
  const rounds = useMemo(() => {
    const map = {};
    matches
      .filter((m) => m.roundName)
      .forEach((m) => {
        if (!map[m.roundName]) map[m.roundName] = [];
        map[m.roundName].push(m);
      });
    return map;
  }, [matches]);

  const roundNames = Object.keys(rounds);

  if (roundNames.length === 0) {
    return (
      <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
        Knockout stage not started yet
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Bracket
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mt-2">
          Knockout stage
        </p>
      </div>

      {/* BRACKET */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-8 min-w-max pb-4">
          {roundNames.map((round) => (
            <RoundColumn
              key={round}
              title={round}
              matches={rounds[round]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   ROUND COLUMN
========================= */

function RoundColumn({ title, matches }) {
  return (
    <div className="w-[260px] flex flex-col gap-6">
      <div className="text-center text-[11px] font-black uppercase tracking-widest text-[#39FF14]">
        {title}
      </div>

      {matches
        .sort((a, b) => a.order - b.order)
        .map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
    </div>
  );
}

/* =========================
   MATCH CARD
========================= */

function MatchCard({ match }) {
  const { playerAName, playerBName, score, status } = match;

  const aWin =
    status === "confirmed" && score?.a > score?.b;
  const bWin =
    status === "confirmed" && score?.b > score?.a;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl space-y-3">
      <PlayerRow
        name={playerAName}
        score={score?.a}
        winner={aWin}
      />
      <div className="h-px bg-white/10" />
      <PlayerRow
        name={playerBName}
        score={score?.b}
        winner={bWin}
      />

      <div className="pt-2 text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
            ${
              status === "confirmed"
                ? "border-[#39FF14]/30 text-[#39FF14]"
                : "border-white/10 text-slate-500"
            }
          `}
        >
          {status.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}

/* =========================
   PLAYER ROW
========================= */

function PlayerRow({ name, score, winner }) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={`font-black uppercase italic truncate ${
          winner ? "text-[#39FF14]" : "text-white"
        }`}
      >
        {name || "TBD"}
      </span>

      <span
        className={`text-lg font-black italic ${
          winner ? "text-[#39FF14]" : "text-slate-400"
        }`}
      >
        {typeof score === "number" ? score : "-"}
      </span>
    </div>
  );
}

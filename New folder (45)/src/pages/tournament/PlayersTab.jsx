import React, { useState } from "react";

/* =========================
   PLAYERS TAB (FINAL)
========================= */

export default function PlayersTab({
  participants = [],
  presence = {},
  mode,
}) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Players
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mt-2">
          Tournament roster
        </p>
      </div>

      {/* PLAYER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((p) => {
          const online = !!presence[p.userId];
          const expanded = openId === p.userId;

          return (
            <div
              key={p.userId}
              className={`rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 cursor-pointer transition-all duration-300 ${
                expanded ? "ring-1 ring-[#39FF14]/20" : ""
              }`}
              onClick={() =>
                setOpenId(expanded ? null : p.userId)
              }
            >
              {/* PLAYER ROW */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-black uppercase text-white">
                    {p.playerName}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        online ? "bg-[#39FF14]" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* STATUS BADGES */}
                <div className="flex items-center gap-2">
                  {p.bannedNextMatch && (
                    <Badge
                      text="BANNED"
                      color="red"
                    />
                  )}

                  {typeof p.strikes === "number" &&
                    p.strikes > 0 && (
                      <Badge
                        text={`STRIKES ${p.strikes}`}
                        color="yellow"
                      />
                    )}

                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Tap
                  </span>
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {expanded && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2">
                  <Detail
                    label="Game Name"
                    value={p.gameName || "—"}
                  />

                  {mode === "Authentic" && (
                    <Detail
                      label="Assigned Team"
                      value={
                        p.assignedTeam
                          ? p.assignedTeam
                          : "Pending Assignment"
                      }
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {participants.length === 0 && (
        <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
          No players joined yet
        </div>
      )}
    </div>
  );
}

/* =========================
   UI HELPERS
========================= */

function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">
        {label}
      </span>
      <span className="text-white font-black uppercase">
        {value}
      </span>
    </div>
  );
}

function Badge({ text, color }) {
  const styles = {
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    yellow:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
        styles[color]
      }`}
    >
      {text}
    </span>
  );
}

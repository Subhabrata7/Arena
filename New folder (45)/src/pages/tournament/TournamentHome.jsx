import React from "react";
import SponsorBanner from "../../components/SponsorBanner";

/* =========================
   TOURNAMENT HOME
========================= */

export default function TournamentHome({
  tournament,
  myUid,
  isRegistered,
  onJoin,
}) {
  if (!tournament) return null;

  const {
    name,
    format,
    mode,
    status,
    maxPlayers,
    playerCount,
    rules,
    deadline,
    sponsors,
    currentMatchday,
    sponsorConfig,
  } = tournament;

  const isFull = (playerCount || 0) >= maxPlayers;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">

      {/* =========================
         SPONSOR BANNER
      ========================== */}
      <SponsorBanner
        sponsors={sponsors || []}
        matchday={currentMatchday || null}
        config={sponsorConfig || { rotation: "static" }}
      />

      {/* HEADER */}
      <div className="rounded-[3rem] border border-white/10 bg-[#0a0a0a] p-10 md:p-14 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#39FF14]/10 blur-3xl rounded-full" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge label={format} />
            <Badge label={mode} />
            <Badge label={status} highlight />
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            {name}
          </h1>

          <div className="flex flex-wrap gap-6 pt-2">
            <Stat label="Players">
              {playerCount || 0} / {maxPlayers}
            </Stat>
            {deadline && (
              <Stat label="Registration Closes">
                {new Date(deadline).toLocaleString()}
              </Stat>
            )}
          </div>
        </div>
      </div>

      {/* ACTION PANEL */}
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 md:p-10 shadow-2xl">
        {!isRegistered ? (
          <JoinState
            isFull={isFull}
            status={status}
            onJoin={onJoin}
          />
        ) : (
          <JoinedState />
        )}
      </div>

      {/* RULES */}
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 md:p-10 shadow-2xl">
        <div className="border-l-4 border-[#39FF14] pl-6 mb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">
            Tournament Rules
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">
            Mandatory Compliance
          </p>
        </div>

        <pre className="whitespace-pre-wrap text-slate-300 font-bold leading-relaxed">
          {rules || "No rules defined yet."}
        </pre>
      </div>
    </div>
  );
}

/* =========================
   STATES
========================= */

function JoinState({ isFull, status, onJoin }) {
  if (status !== "Registration Open") {
    return <StateBox text="Registration Closed" muted />;
  }

  if (isFull) {
    return <StateBox text="Tournament Full" muted />;
  }

  return (
    <div className="text-center space-y-6">
      <p className="text-slate-400 font-bold">
        You are not registered in this tournament.
      </p>

      <button
        onClick={onJoin}
        className="px-12 py-6 rounded-2xl bg-[#39FF14] text-black font-black uppercase tracking-[0.35em] text-[11px] shadow-[0_0_35px_rgba(57,255,20,0.25)] hover:scale-[1.02]"
      >
        Join Tournament
      </button>
    </div>
  );
}

function JoinedState() {
  return (
    <StateBox
      text="You are registered in this tournament"
      success
    />
  );
}

function StateBox({ text, muted, success }) {
  return (
    <div
      className={`rounded-2xl px-8 py-6 text-center font-black uppercase tracking-[0.35em] text-[10px]
        ${
          success
            ? "bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14]"
            : muted
            ? "bg-white/5 border border-white/10 text-slate-500"
            : ""
        }`}
    >
      {text}
    </div>
  );
}

/* =========================
   UI PARTS
========================= */

function Badge({ label, highlight }) {
  return (
    <span
      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border
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

function Stat({ label, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="text-lg font-black uppercase tracking-tight text-white">
        {children}
      </div>
    </div>
  );
}

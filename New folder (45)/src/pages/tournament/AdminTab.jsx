import React, { useMemo, useState } from "react";
import {
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase/config";

/* =========================
   ADMIN TAB (4.20)
   - Dispute decision UI
   - Force confirm
   - Override score
   - Remove strikes / remove ban flag
========================= */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminTab({
  tournament,
  participants = [],
  matches = [],
  user,
  isAdmin,
}) {
  const [active, setActive] = useState("disputes"); // disputes | players

  const disputed = useMemo(
    () => matches.filter((m) => m.status === "disputed"),
    [matches]
  );

  if (!isAdmin) {
    return (
      <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
        Admin access required
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Admin
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mt-2">
          Disputes • Strikes • Overrides
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl flex gap-2 flex-wrap">
        <TabButton
          label="Disputes"
          active={active === "disputes"}
          onClick={() => setActive("disputes")}
        />
        <TabButton
          label="Players"
          active={active === "players"}
          onClick={() => setActive("players")}
        />
      </div>

      {active === "disputes" && (
        <DisputePanel disputed={disputed} participants={participants} />
      )}

      {active === "players" && (
        <PlayersPanel participants={participants} />
      )}
    </div>
  );
}

/* =========================
   DISPUTE PANEL
========================= */

function DisputePanel({ disputed, participants }) {
  return (
    <div className="space-y-6">
      {disputed.map((m) => (
        <DisputeCard key={m.id} match={m} participants={participants} />
      ))}

      {disputed.length === 0 && (
        <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
          No disputes right now
        </div>
      )}
    </div>
  );
}

function DisputeCard({ match, participants }) {
  const [a, setA] = useState(match?.score?.a ?? 0);
  const [b, setB] = useState(match?.score?.b ?? 0);
  const [busy, setBusy] = useState(false);

  const submitterId = match.scoreSubmittedBy || match.submittedBy || null;
  const submitter = participants.find((p) => p.userId === submitterId);
  const submitterName = submitter?.playerName || submitter?.displayName || "Unknown";

  async function forceConfirm() {
    setBusy(true);
    try {
      await updateDoc(doc(db, "matches", match.id), {
        status: "confirmed",
        confirmedAt: Date.now(),
        confirmedBy: "admin",
      });
    } finally {
      setBusy(false);
    }
  }

  async function overrideScore() {
    setBusy(true);
    try {
      await updateDoc(doc(db, "matches", match.id), {
        score: { a: Number(a), b: Number(b) },
        status: "confirmed",
        confirmedAt: Date.now(),
        confirmedBy: "admin_override",
        overriddenAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  async function clearSubmitterStrikes() {
    if (!submitter?.id) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "participants", submitter.id), {
        strikes: 0,
        bannedNextMatch: false,
        strikeClearedAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-8 shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-red-200">
            Disputed Match
          </div>
          <div className="mt-2 text-2xl font-black italic uppercase tracking-tighter text-white">
            {match.playerAName} <span className="text-slate-600">vs</span>{" "}
            {match.playerBName}
          </div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
            Dispute is against:{" "}
            <span className="text-red-200">{submitterName}</span>
          </div>
        </div>

        <div className="px-4 py-2 rounded-full border border-red-500/20 bg-black/30 text-[9px] font-black uppercase tracking-widest text-red-200">
          Needs decision
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Override Score (Admin)
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <input
            type="number"
            min="0"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-20 text-center text-2xl font-black italic rounded-2xl p-4 border border-white/10 bg-black text-white outline-none focus:border-[#39FF14]/40"
          />
          <div className="text-3xl font-black text-slate-600">:</div>
          <input
            type="number"
            min="0"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-20 text-center text-2xl font-black italic rounded-2xl p-4 border border-white/10 bg-black text-white outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={forceConfirm}
            disabled={busy}
            className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 text-slate-200 font-black uppercase tracking-[0.35em] text-[10px]"
          >
            {busy ? "…" : "Force Confirm (keep score)"}
          </button>
          <button
            onClick={overrideScore}
            disabled={busy}
            className="px-10 py-5 rounded-2xl bg-[#39FF14] text-black font-black uppercase tracking-[0.35em] text-[10px]"
          >
            {busy ? "…" : "Override & Confirm"}
          </button>
        </div>

        <div className="mt-5">
          <button
            onClick={clearSubmitterStrikes}
            disabled={busy || !submitter?.id}
            className="w-full px-10 py-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-200 font-black uppercase tracking-[0.35em] text-[10px]"
          >
            {busy ? "…" : "Clear Submitter Strikes + Remove Ban Flag"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PLAYERS PANEL
========================= */

function PlayersPanel({ participants }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {participants.map((p) => (
        <PlayerAdminCard key={p.id || p.userId} p={p} />
      ))}
      {participants.length === 0 && (
        <div className="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
          No participants loaded
        </div>
      )}
    </div>
  );
}

function PlayerAdminCard({ p }) {
  const [busy, setBusy] = useState(false);

  const strikes = Number(p.strikes || 0);
  const banned = !!p.bannedNextMatch;

  // Optional accuracy fields
  const total = Number(p.accuracyTotal || 0);
  const ok = Number(p.accuracyConfirmed || 0);
  const accuracy = total > 0 ? Math.round((ok / total) * 100) : 100;

  async function clearStrikes() {
    if (!p?.id) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "participants", p.id), {
        strikes: 0,
        bannedNextMatch: false,
        strikeClearedAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  async function addStrike() {
    if (!p?.id) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "participants", p.id), {
        strikes: increment(1),
        lastDisputeAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-7 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-black italic uppercase tracking-tighter text-xl">
            {p.playerName || p.displayName || "Player"}
          </div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            UID: {p.userId}
          </div>
        </div>

        <div className={cn(
          "px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest",
          banned ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-white/10 bg-white/5 text-slate-400"
        )}>
          {banned ? "BANNED NEXT" : "OK"}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat label="Strikes" value={`${strikes}/3`} danger={strikes >= 3} />
        <MiniStat label="Accuracy" value={`${accuracy}%`} />
        <MiniStat label="Paid" value={p.paid ? "YES" : "NO"} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={addStrike}
          disabled={busy || !p?.id}
          className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-200 font-black uppercase tracking-[0.35em] text-[10px]"
        >
          Add Strike
        </button>
        <button
          onClick={clearStrikes}
          disabled={busy || !p?.id}
          className="px-8 py-4 rounded-2xl bg-[#39FF14] text-black font-black uppercase tracking-[0.35em] text-[10px]"
        >
          Clear Strikes
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, danger }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/5 px-5 py-4",
        danger ? "border-red-500/30" : "border-white/10"
      )}
    >
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-lg font-black uppercase tracking-tight",
          danger ? "text-red-200" : "text-white"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-full border text-[9px] font-black uppercase tracking-widest transition",
        active
          ? "border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14]"
          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
      )}
    >
      {label}
    </button>
  );
}

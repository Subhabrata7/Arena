import React, { useMemo, useState } from "react";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { registerDispute } from "../../utils/disputeEngine";

/* =========================
   FIXTURES TAB (4.19)
   - Filters: matchday/status/presence
   - MatchCenter modal: ready + submit + confirm + dispute
========================= */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "need_confirm", label: "Need Confirm" },
  { key: "confirmed", label: "Confirmed" },
  { key: "disputed", label: "Disputed" },
];

const PRESENCE_FILTERS = [
  { key: "all", label: "All" },
  { key: "both_ready", label: "Both Ready" },
  { key: "one_ready", label: "One Ready" },
  { key: "none_ready", label: "None Ready" },
];

export default function FixturesTab({
  tournament,
  user,
  isAdmin,
  matches = [],
  participants = [],
  presence = {},
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [presenceFilter, setPresenceFilter] = useState("all");
  const [matchday, setMatchday] = useState("all");
  const [openMatch, setOpenMatch] = useState(null);

  const matchdays = useMemo(() => {
    const set = new Set();
    matches.forEach((m) => {
      const md = m.matchday || m.roundName || m.matchDay || null;
      if (md) set.add(String(md));
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [matches]);

  const filtered = useMemo(() => {
    return matches
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((m) => {
        // matchday
        if (matchday !== "all") {
          const md = String(m.matchday || m.roundName || m.matchDay || "");
          if (md !== matchday) return false;
        }

        // status mapping
        if (statusFilter !== "all") {
          const st = m.status || "pending";
          if (statusFilter === "need_confirm" && st !== "pending_confirmation")
            return false;
          if (statusFilter === "pending" && st !== "pending") return false;
          if (statusFilter === "confirmed" && st !== "confirmed") return false;
          if (statusFilter === "disputed" && st !== "disputed") return false;
        }

        // presence / ready mapping
        if (presenceFilter !== "all") {
          const ra = !!m.readyA;
          const rb = !!m.readyB;
          if (presenceFilter === "both_ready" && !(ra && rb)) return false;
          if (presenceFilter === "one_ready" && !((ra && !rb) || (!ra && rb)))
            return false;
          if (presenceFilter === "none_ready" && (ra || rb)) return false;
        }

        return true;
      });
  }, [matches, matchday, statusFilter, presenceFilter]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Fixtures
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mt-2">
          Matchday + Status + Presence Filters
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-5 md:p-6 shadow-2xl flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <SelectPill
            label="Matchday"
            value={matchday}
            options={matchdays}
            onChange={setMatchday}
          />
          <ChipRow
            label="Status"
            items={STATUS_FILTERS}
            active={statusFilter}
            onChange={setStatusFilter}
          />
          <ChipRow
            label="Presence"
            items={PRESENCE_FILTERS}
            active={presenceFilter}
            onChange={setPresenceFilter}
          />
        </div>

        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
          Showing {filtered.length} matches
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((m) => (
          <MatchTile
            key={m.id}
            match={m}
            presence={presence}
            onOpen={() => setOpenMatch(m)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
            No matches found for selected filters
          </div>
        )}
      </div>

      {/* MATCH CENTER MODAL */}
      {openMatch && (
        <MatchCenterModal
          tournament={tournament}
          user={user}
          isAdmin={isAdmin}
          match={openMatch}
          presence={presence}
          participants={participants}
          matches={matches}
          onClose={() => setOpenMatch(null)}
        />
      )}
    </div>
  );
}

/* =========================
   UI COMPONENTS
========================= */

function ChipRow({ label, items, active, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-1">
        {label}
      </span>
      {items.map((x) => (
        <button
          key={x.key}
          onClick={() => onChange(x.key)}
          className={cn(
            "px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition",
            active === x.key
              ? "border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14]"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
          )}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}

function SelectPill({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[9px] outline-none focus:border-[#39FF14]/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "all" ? "All" : o}
          </option>
        ))}
      </select>
    </div>
  );
}

function dot(isOn) {
  return (
    <span
      className={cn(
        "w-2 h-2 rounded-full",
        isOn ? "bg-[#39FF14] shadow-[0_0_10px_#39FF14]" : "bg-slate-700"
      )}
    />
  );
}

function statusBadge(st) {
  const s = st || "pending";
  const map = {
    pending: "Pending",
    pending_confirmation: "Need Confirm",
    confirmed: "Confirmed",
    disputed: "Disputed",
  };
  const label = map[s] || s;

  const cls =
    s === "confirmed"
      ? "border-[#39FF14]/40 text-[#39FF14] bg-[#39FF14]/10"
      : s === "disputed"
      ? "border-red-500/30 text-red-300 bg-red-500/10"
      : s === "pending_confirmation"
      ? "border-yellow-400/30 text-yellow-200 bg-yellow-400/10"
      : "border-white/10 text-slate-400 bg-white/5";

  return (
    <span
      className={cn(
        "px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest",
        cls
      )}
    >
      {label}
    </span>
  );
}

function MatchTile({ match, presence, onOpen }) {
  const aOnline = !!presence?.[match.playerAId];
  const bOnline = !!presence?.[match.playerBId];

  const scoreText =
    match.status === "confirmed"
      ? `${match?.score?.a ?? 0} : ${match?.score?.b ?? 0}`
      : "VS";

  return (
    <button
      onClick={onOpen}
      className="text-left rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-7 shadow-2xl hover:border-[#39FF14]/30 transition"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
          {match.matchday || match.roundName || "Match"}
        </div>
        {statusBadge(match.status)}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="space-y-2">
          <div className="font-black uppercase italic text-white">
            {match.playerAName || "Player A"}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
            {dot(aOnline)} {match.readyA ? "Ready" : "Not Ready"}
          </div>
        </div>

        <div className="text-3xl md:text-4xl font-black italic text-white tracking-tighter">
          {scoreText}
        </div>

        <div className="space-y-2 text-right">
          <div className="font-black uppercase italic text-white">
            {match.playerBName || "Player B"}
          </div>
          <div className="flex justify-end items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
            {match.readyB ? "Ready" : "Not Ready"} {dot(bOnline)}
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================
   MATCH CENTER MODAL (4.19)
========================= */

function MatchCenterModal({
  tournament,
  user,
  isAdmin,
  match,
  presence,
  participants,
  matches,
  onClose,
}) {
  const [readyBusy, setReadyBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sa, setSa] = useState(match?.score?.a ?? 0);
  const [sb, setSb] = useState(match?.score?.b ?? 0);

  const isA = match.playerAId === user?.uid;
  const isB = match.playerBId === user?.uid;
  const isPlayer = isA || isB;

  const myReady = isA ? !!match.readyA : isB ? !!match.readyB : false;
  const opReady = isA ? !!match.readyB : isB ? !!match.readyA : false;

  const aOnline = !!presence?.[match.playerAId];
  const bOnline = !!presence?.[match.playerBId];

  const myParticipant = useMemo(() => {
    return participants.find((p) => p.userId === user?.uid) || null;
  }, [participants, user?.uid]);

  const submitterId = match.scoreSubmittedBy || match.submittedBy || null;
  const iAmSubmitter = submitterId && submitterId === user?.uid;

  // Helpers
  const matchRef = doc(db, "matches", match.id);

  async function toggleReady() {
    if (!isPlayer) return;
    setReadyBusy(true);
    try {
      const field = isA ? "readyA" : "readyB";
      await updateDoc(matchRef, { [field]: !myReady, updatedAt: Date.now() });
    } finally {
      setReadyBusy(false);
    }
  }

  async function submitScore() {
    if (!isPlayer) return;
    if (!(myReady && opReady)) return;

    // only if not already submitted/locked
    if (match.status !== "pending") return;

    setBusy(true);
    try {
      await updateDoc(matchRef, {
        score: { a: Number(sa), b: Number(sb) },
        status: "pending_confirmation",
        scoreSubmittedBy: user.uid,
        scoreSubmittedAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  async function confirmScore() {
    if (!isPlayer) return;
    if (match.status !== "pending_confirmation") return;
    if (iAmSubmitter) return;

    setBusy(true);
    try {
      await updateDoc(matchRef, {
        status: "confirmed",
        confirmedAt: Date.now(),
        confirmedBy: user.uid,
      });
    } finally {
      setBusy(false);
      onClose();
    }
  }

  async function disputeScore() {
    if (!isPlayer) return;
    if (match.status !== "pending_confirmation") return;
    if (iAmSubmitter) return;
    if (!submitterId) return;

    setBusy(true);
    try {
      // 1) mark match disputed
      await updateDoc(matchRef, {
        status: "disputed",
        disputedAt: Date.now(),
        disputedBy: user.uid,
      });

      // 2) strike ONLY against submitter (your rule)
      //    expected participant doc: participants/{uid} or participants/{docId}
      //    We'll store strikes inside participant doc by querying locally list:
      const submitterParticipant =
        participants.find((p) => p.userId === submitterId) || null;

      if (submitterParticipant?.id) {
        const currentStrikes = Number(submitterParticipant.strikes || 0);

        const res = registerDispute({
          submitterId,
          tournamentId: tournament?.id,
          currentStrikes,
        });

        await updateDoc(doc(db, "participants", submitterParticipant.id), {
          strikes: res.strikes,
          lastDisputeAt: res.lastDisputeAt,
          // keep flag for admin panel visibility
          bannedNextMatch: res.bannedNextMatch,
        });

        // Note: actual ban assignment to a specific NEXT MATCH is handled in AdminTab (4.20),
        // because Admin needs final authority + schedule awareness.
      }
    } finally {
      setBusy(false);
      onClose();
    }
  }

  const locked =
    match.status === "pending_confirmation" ||
    match.status === "confirmed" ||
    match.status === "disputed";

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 md:p-10 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              Match Center
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
              {match.playerAName} <span className="text-slate-600">vs</span>{" "}
              {match.playerBName}
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-black uppercase text-[10px] tracking-widest hover:border-[#39FF14]/30"
          >
            Close
          </button>
        </div>

        {/* STATUS */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          {statusBadge(match.status)}
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Presence:
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
            A {dot(aOnline)} • B {dot(bOnline)}
          </span>
        </div>

        {/* READY CHECK */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                Ready Check
              </div>
              <div className="mt-2 text-slate-300 font-bold">
                Both players must be Ready to submit a score.
              </div>
            </div>

            {isPlayer && (
              <button
                onClick={toggleReady}
                disabled={readyBusy}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition",
                  myReady
                    ? "border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14]"
                    : "border-white/10 bg-[#0a0a0a] text-slate-200 hover:border-[#39FF14]/30"
                )}
              >
                {readyBusy ? "..." : myReady ? "Ready ✅" : "Mark Ready"}
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
              <div className="text-slate-500">Player A</div>
              <div className="mt-1 text-slate-200 flex items-center gap-2">
                {match.playerAName} {dot(match.readyA)}
                <span className="text-slate-500">{match.readyA ? "Ready" : "Not"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
              <div className="text-slate-500">Player B</div>
              <div className="mt-1 text-slate-200 flex items-center gap-2">
                {match.playerBName} {dot(match.readyB)}
                <span className="text-slate-500">{match.readyB ? "Ready" : "Not"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCORE SECTION */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Score
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <input
              type="number"
              min="0"
              value={sa}
              disabled={locked}
              onChange={(e) => setSa(e.target.value)}
              className={cn(
                "w-20 md:w-24 text-center text-2xl md:text-3xl font-black italic rounded-2xl p-4 border outline-none",
                locked
                  ? "border-white/10 bg-black/50 text-slate-500"
                  : "border-white/10 bg-black text-white focus:border-[#39FF14]/40"
              )}
            />
            <div className="text-3xl font-black text-slate-600">:</div>
            <input
              type="number"
              min="0"
              value={sb}
              disabled={locked}
              onChange={(e) => setSb(e.target.value)}
              className={cn(
                "w-20 md:w-24 text-center text-2xl md:text-3xl font-black italic rounded-2xl p-4 border outline-none",
                locked
                  ? "border-white/10 bg-black/50 text-slate-500"
                  : "border-white/10 bg-black text-white focus:border-[#39FF14]/40"
              )}
            />
          </div>

          {match.status === "pending" && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={submitScore}
                disabled={busy || !(myReady && opReady) || !isPlayer}
                className={cn(
                  "px-12 py-5 rounded-2xl bg-[#39FF14] text-black font-black uppercase tracking-[0.35em] text-[10px] shadow-[0_0_35px_rgba(57,255,20,0.25)] transition",
                  (!(myReady && opReady) || !isPlayer) && "opacity-50 cursor-not-allowed"
                )}
              >
                {busy ? "Submitting…" : "Submit Score"}
              </button>
            </div>
          )}

          {match.status === "pending_confirmation" && (
            <div className="mt-6">
              {iAmSubmitter ? (
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-6 py-5 text-center">
                  <div className="text-yellow-200 font-black uppercase tracking-widest text-[10px]">
                    Waiting for opponent confirmation
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={confirmScore}
                    disabled={busy}
                    className="px-10 py-5 rounded-2xl bg-[#39FF14] text-black font-black uppercase tracking-[0.35em] text-[10px]"
                  >
                    {busy ? "…" : "Confirm"}
                  </button>
                  <button
                    onClick={disputeScore}
                    disabled={busy}
                    className="px-10 py-5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 font-black uppercase tracking-[0.35em] text-[10px]"
                  >
                    {busy ? "…" : "Dispute"}
                  </button>
                </div>
              )}

              <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                After submission, only Admin/Organizer can edit the score.
              </div>
            </div>
          )}

          {match.status === "confirmed" && (
            <div className="mt-6 rounded-2xl border border-[#39FF14]/20 bg-[#39FF14]/10 px-6 py-5 text-center">
              <div className="text-[#39FF14] font-black uppercase tracking-widest text-[10px]">
                Score Confirmed (Locked)
              </div>
            </div>
          )}

          {match.status === "disputed" && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-center">
              <div className="text-red-200 font-black uppercase tracking-widest text-[10px]">
                Disputed — Admin decision required
              </div>
            </div>
          )}
        </div>

        {!isPlayer && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center">
            <div className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
              Spectator mode: You cannot submit/confirm scores
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

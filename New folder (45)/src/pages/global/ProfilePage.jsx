import React from "react";
import EmptyState from "../../components/EmptyState";

export default function ProfilePage({ userProfile, onOpenProfileEdit }) {
  if (!userProfile) {
    return <EmptyState title="Profile not loaded" subtitle="Check firestore permissions or profile doc path." />;
  }

  const rows = [
    ["Player Name", userProfile.playerName || "---"],
    ["Game Name", userProfile.gameName || "---"],
    ["Game ID", userProfile.gameId || "---"],
    ["Mobile", userProfile.mobile || "---"],
    ["UPI ID", userProfile.upiId || "---"],
    ["Platform", userProfile.platform || "---"],
    ["Region", userProfile.region || "---"],
    ["Profile Status", userProfile.isComplete ? "Complete" : "Incomplete"],
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              {k}
            </div>
            <div className="mt-3 text-xl font-black italic uppercase tracking-tighter text-white">
              {String(v)}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onOpenProfileEdit}
        className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[#39FF14] font-black uppercase text-[11px] tracking-[0.35em] hover:bg-[#39FF14] hover:text-black transition-all"
      >
        Edit Profile
      </button>
    </div>
  );
}

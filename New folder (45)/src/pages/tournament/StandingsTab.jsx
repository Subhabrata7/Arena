import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   STANDINGS TAB (4.18)
   - League: medals + rank change animation
   - Group+Knockout: per-group standings + qualification line
========================= */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function medal(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function computeTable({ participants, matches, onlyIds }) {
  const rows = new Map();
  (participants || []).forEach((p) => {
    if (onlyIds && !onlyIds.has(p.userId)) return;
    rows.set(p.userId, {
      userId: p.userId,
      name: p.playerName || p.displayName || "Player",
      P: 0,
      W: 0,
      D: 0,
      L: 0,
      GF: 0,
      GA: 0,
      GD: 0,
      PTS: 0,
    });
  });

  (matches || [])
    .filter((m) => m?.status === "confirmed")
    .forEach((m) => {
      const aId = m.playerAId;
      const bId = m.playerBId;
      if (!rows.has(aId) || !rows.has(bId)) return;

      const a = rows.get(aId);
      const b = rows.get(bId);

      const sa = safeNum(m?.score?.a);
      const sb = safeNum(m?.score?.b);

      a.P += 1;
      b.P += 1;

      a.GF += sa;
      a.GA += sb;
      b.GF += sb;
      b.GA += sa;

      if (sa > sb) {
        a.W += 1;
        b.L += 1;
        a.PTS += 3;
      } else if (sa < sb) {
        b.W += 1;
        a.L += 1;
        b.PTS += 3;
      } else {
        a.D += 1;
        b.D += 1;
        a.PTS += 1;
        b.PTS += 1;
      }

      a.GD = a.GF - a.GA;
      b.GD = b.GF - b.GA;
    });

  const list = Array.from(rows.values()).sort(
    (x, y) =>
      y.PTS - x.PTS || y.GD - x.GD || y.GF - x.GF || x.name.localeCompare(y.name)
  );

  return list;
}

export default function StandingsTab({ tournament, participants = [], matches = [] }) {
  const format = tournament?.format || tournament?.type || "League";
  const isGroupMode =
    String(format).toLowerCase().includes("group") || tournament?.hasGroups;

  const qualifiersPerGroup = safeNum(tournament?.qualifiersPerGroup || 2);

  // Detect groups from participants.groupKey or participants.groupId
  const groups = useMemo(() => {
    const map = {};
    participants.forEach((p) => {
      const g = p.groupKey || p.groupId || p.group || null;
      if (!g) return;
      map[g] = map[g] || [];
      map[g].push(p.userId);
    });
    return map;
  }, [participants]);

  // League table (or fallback)
  const leagueTable = useMemo(() => {
    return computeTable({ participants, matches });
  }, [participants, matches]);

  // Rank change animation (league only)
  const prevRanksRef = useRef({});
  const [rankDelta, setRankDelta] = useState({});
  useEffect(() => {
    const prev = prevRanksRef.current || {};
    const now = {};
    leagueTable.forEach((r, idx) => (now[r.userId] = idx + 1));

    const deltas = {};
    Object.keys(now).forEach((uid) => {
      const before = prev[uid];
      const after = now[uid];
      if (!before) deltas[uid] = 0;
      else deltas[uid] = before - after; // + means moved up
    });

    prevRanksRef.current = now;
    setRankDelta(deltas);
  }, [leagueTable]);

  const GroupBlock = ({ groupKey, ids }) => {
    const idSet = useMemo(() => new Set(ids), [ids]);
    const table = useMemo(() => computeTable({ participants, matches, onlyIds: idSet }), [
      participants,
      matches,
      idSet,
    ]);

    return (
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="font-black italic uppercase tracking-tighter text-xl">
            Group {String(groupKey).toUpperCase()}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Qualify Top {qualifiersPerGroup}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-center">P</th>
                <th className="px-6 py-4 text-center">W</th>
                <th className="px-6 py-4 text-center">D</th>
                <th className="px-6 py-4 text-center">L</th>
                <th className="px-6 py-4 text-center">GA</th>
                <th className="px-6 py-4 text-center">GF</th>
                <th className="px-6 py-4 text-center">GD</th>
                <th className="px-6 py-4 text-center text-[#39FF14]">PTS</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r, i) => {
                const rank = i + 1;
                const qualifies = rank <= qualifiersPerGroup;
                const isLine = rank === qualifiersPerGroup;

                return (
                  <tr
                    key={r.userId}
                    className={cn(
                      "border-t border-white/10",
                      qualifies && "bg-[#39FF14]/[0.04]",
                      isLine && "relative"
                    )}
                  >
                    <td className="px-6 py-4 font-black text-left">{rank}</td>
                    <td className="px-6 py-4 font-black uppercase italic text-left">
                      {r.name}
                      {qualifies && (
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
                          QUALIFIED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-black">{r.P}</td>
                    <td className="px-6 py-4 text-center font-black">{r.W}</td>
                    <td className="px-6 py-4 text-center font-black">{r.D}</td>
                    <td className="px-6 py-4 text-center font-black">{r.L}</td>
                    <td className="px-6 py-4 text-center font-black">{r.GA}</td>
                    <td className="px-6 py-4 text-center font-black">{r.GF}</td>
                    <td
                      className={cn(
                        "px-6 py-4 text-center font-black",
                        r.GD > 0 && "text-[#39FF14]",
                        r.GD < 0 && "text-red-400",
                        r.GD === 0 && "text-slate-300"
                      )}
                    >
                      {r.GD > 0 ? `+${r.GD}` : r.GD}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-white">
                      {r.PTS}
                    </td>

                    {isLine && (
                      <td className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-[#39FF14]/40 animate-pulse" />
                    )}
                  </tr>
                );
              })}

              {table.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-8 py-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]"
                  >
                    No players in this group yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // MAIN RENDER
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="border-l-4 border-[#39FF14] pl-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Standings
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mt-2">
          {isGroupMode ? "Group Tables" : "League Table"}
        </p>
      </div>

      {/* GROUP MODE */}
      {isGroupMode && Object.keys(groups).length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(groups)
            .sort(([a], [b]) => String(a).localeCompare(String(b)))
            .map(([g, ids]) => (
              <GroupBlock key={g} groupKey={g} ids={ids} />
            ))}
        </div>
      ) : (
        /* LEAGUE MODE */
        <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <div className="font-black italic uppercase tracking-tighter text-xl">
              League Standings
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              Live Ranking
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-center">P</th>
                  <th className="px-6 py-4 text-center">W</th>
                  <th className="px-6 py-4 text-center">D</th>
                  <th className="px-6 py-4 text-center">L</th>
                  <th className="px-6 py-4 text-center">GA</th>
                  <th className="px-6 py-4 text-center">GF</th>
                  <th className="px-6 py-4 text-center">GD</th>
                  <th className="px-6 py-4 text-center text-[#39FF14]">PTS</th>
                </tr>
              </thead>

              <tbody>
                {leagueTable.map((r, idx) => {
                  const rank = idx + 1;
                  const delta = rankDelta[r.userId] || 0;

                  return (
                    <tr
                      key={r.userId}
                      className={cn(
                        "border-t border-white/10 transition",
                        delta !== 0 && "bg-white/[0.03]"
                      )}
                    >
                      <td className="px-6 py-4 font-black text-left">
                        <div className="flex items-center gap-3">
                          <span className="w-8">{rank}</span>
                          <span className="text-lg">{medal(rank)}</span>
                          {delta !== 0 && (
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                delta > 0 ? "text-[#39FF14]" : "text-red-400"
                              )}
                            >
                              {delta > 0 ? `▲ +${delta}` : `▼ ${Math.abs(delta)}`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black uppercase italic text-left">
                        {r.name}
                      </td>

                      <td className="px-6 py-4 text-center font-black">{r.P}</td>
                      <td className="px-6 py-4 text-center font-black">{r.W}</td>
                      <td className="px-6 py-4 text-center font-black">{r.D}</td>
                      <td className="px-6 py-4 text-center font-black">{r.L}</td>
                      <td className="px-6 py-4 text-center font-black">{r.GA}</td>
                      <td className="px-6 py-4 text-center font-black">{r.GF}</td>
                      <td
                        className={cn(
                          "px-6 py-4 text-center font-black",
                          r.GD > 0 && "text-[#39FF14]",
                          r.GD < 0 && "text-red-400",
                          r.GD === 0 && "text-slate-300"
                        )}
                      >
                        {r.GD > 0 ? `+${r.GD}` : r.GD}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-white">
                        {r.PTS}
                      </td>
                    </tr>
                  );
                })}

                {leagueTable.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-8 py-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]"
                    >
                      No standings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

/* =========================
   ANNOUNCEMENTS TAB
========================= */

export default function AnnouncementsTab({ tournament, user, isAdmin }) {
  const [announcements, setAnnouncements] = useState([]);
  const [lastReadAt, setLastReadAt] = useState(null);
  const [draft, setDraft] = useState("");

  /* -------------------------
     LOAD ANNOUNCEMENTS
  -------------------------- */
  useEffect(() => {
    if (!tournament?.id) return;

    const q = query(
      collection(db, "announcements"),
      where("tournamentId", "==", tournament.id)
    );

    return onSnapshot(q, (snap) => {
      setAnnouncements(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => b.createdAt - a.createdAt)
      );
    });
  }, [tournament?.id]);

  /* -------------------------
     LOAD LAST READ STATE
  -------------------------- */
  useEffect(() => {
    if (!user?.uid || !tournament?.id) return;

    const ref = doc(
      db,
      "announcementReads",
      `${tournament.id}_${user.uid}`
    );

    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setLastReadAt(snap.data().lastReadAt);
      }
    });
  }, [user?.uid, tournament?.id]);

  /* -------------------------
     AUTO MARK READ ON OPEN
  -------------------------- */
  useEffect(() => {
    if (!user?.uid || !tournament?.id || announcements.length === 0) return;

    const newest = announcements[0]?.createdAt || 0;

    if (!lastReadAt || newest > lastReadAt) {
      markAllRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements]);

  /* -------------------------
     MARK ALL READ
  -------------------------- */
  const markAllRead = async () => {
    if (!user?.uid || !tournament?.id) return;

    const now = Date.now();

    await setDoc(
      doc(db, "announcementReads", `${tournament.id}_${user.uid}`),
      {
        tournamentId: tournament.id,
        userId: user.uid,
        lastReadAt: now,
      },
      { merge: true }
    );

    setLastReadAt(now);
  };

  /* -------------------------
     UNREAD COUNT
  -------------------------- */
  const unreadCount = useMemo(() => {
    if (!lastReadAt) return announcements.length;
    return announcements.filter(
      (a) => a.createdAt > lastReadAt
    ).length;
  }, [announcements, lastReadAt]);

  /* -------------------------
     POST ANNOUNCEMENT (ADMIN)
  -------------------------- */
  const postAnnouncement = async () => {
    if (!draft.trim()) return;

    await addDoc(collection(db, "announcements"), {
      tournamentId: tournament.id,
      text: draft.trim(),
      createdAt: Date.now(),
      createdBy: user.uid,
      type: "manual",
    });

    setDraft("");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-end justify-between border-l-4 border-[#39FF14] pl-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            Announcements
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mt-2">
            Tournament broadcasts
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* ADMIN POST */}
      {isAdmin && (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Post announcement..."
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-slate-200 font-bold outline-none focus:border-[#39FF14]"
          />
          <button
            onClick={postAnnouncement}
            className="px-8 py-3 rounded-xl bg-[#39FF14] text-black font-black uppercase tracking-widest text-[10px]"
          >
            Publish
          </button>
        </div>
      )}

      {/* ANNOUNCEMENT LIST */}
      <div className="space-y-4">
        {announcements.map((a) => {
          const unread = !lastReadAt || a.createdAt > lastReadAt;

          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-6 transition
                ${
                  unread
                    ? "border-[#39FF14]/40 bg-[#39FF14]/5"
                    : "border-white/10 bg-[#0a0a0a]"
                }
              `}
            >
              <div className="flex justify-between items-start gap-4">
                <p className="text-slate-200 font-bold leading-relaxed">
                  {a.text}
                </p>

                {unread && (
                  <span className="px-2 py-1 rounded-full bg-[#39FF14] text-black text-[9px] font-black uppercase">
                    NEW
                  </span>
                )}
              </div>

              <div className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                {new Date(a.createdAt).toLocaleString()}
                {a.type === "system" && " • SYSTEM"}
              </div>
            </div>
          );
        })}

        {announcements.length === 0 && (
          <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
            No announcements yet
          </div>
        )}
      </div>
    </div>
  );
}

// src/firebase/queries.js
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, rtdb } from "./config";

/**
 * -----------------------------
 * COLLECTION NAMES (LOCKED)
 * -----------------------------
 */
export const COL = {
  TOURNAMENTS: "tournaments",
  PARTICIPANTS: "participants",
  MATCHES: "matches",
  ANNOUNCEMENTS: "announcements",
  SUPPORT: "support",
};

/**
 * Utility: safe subscribe wrapper
 */
function safeOnSnapshot(qOrRef, onData, onError) {
  return onSnapshot(
    qOrRef,
    (snap) => {
      if ("docs" in snap) {
        onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        onData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      }
    },
    (err) => {
      console.warn("[Firestore listen error]", err);
      onError?.(err);
    }
  );
}

/* =========================
   TOURNAMENTS
========================= */

export function listenPublicTournaments(onData, onError) {
  // Public feed: newest first
  const q = query(collection(db, COL.TOURNAMENTS), orderBy("createdAt", "desc"));
  return safeOnSnapshot(q, onData, onError);
}

export function listenTournament(tournamentId, onData, onError) {
  if (!tournamentId) return () => {};
  const refDoc = doc(db, COL.TOURNAMENTS, tournamentId);
  return safeOnSnapshot(refDoc, onData, onError);
}

export function listenMyTournaments(myUid, onData, onError) {
  if (!myUid) return () => {};
  // You can treat "ownerId" tournaments as "my tournaments"
  // Later we can also include "adminIds contains" and "participants contains"
  const q = query(
    collection(db, COL.TOURNAMENTS),
    where("ownerId", "==", myUid),
    orderBy("createdAt", "desc")
  );
  return safeOnSnapshot(q, onData, onError);
}

/* =========================
   PARTICIPANTS
========================= */

export function listenTournamentParticipants(tournamentId, onData, onError) {
  if (!tournamentId) return () => {};
  const q = query(
    collection(db, COL.PARTICIPANTS),
    where("tournamentId", "==", tournamentId)
  );
  return safeOnSnapshot(q, onData, onError);
}

/* =========================
   MATCHES
========================= */

export function listenTournamentMatches(tournamentId, onData, onError) {
  if (!tournamentId) return () => {};
  const q = query(
    collection(db, COL.MATCHES),
    where("tournamentId", "==", tournamentId),
    orderBy("order", "asc")
  );
  return safeOnSnapshot(q, onData, onError);
}

/* =========================
   ANNOUNCEMENTS
========================= */

export function listenTournamentAnnouncements(tournamentId, onData, onError) {
  if (!tournamentId) return () => {};
  const q = query(
    collection(db, COL.ANNOUNCEMENTS),
    where("tournamentId", "==", tournamentId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return safeOnSnapshot(q, onData, onError);
}

/* =========================
   SUPPORT (TICKETS)
========================= */

export function listenSupportTicketsForUser(tournamentId, myUid, onData, onError) {
  if (!tournamentId || !myUid) return () => {};
  const q = query(
    collection(db, COL.SUPPORT),
    where("tournamentId", "==", tournamentId),
    where("userId", "==", myUid),
    orderBy("lastUpdated", "desc"),
    limit(20)
  );
  return safeOnSnapshot(q, onData, onError);
}

export function listenSupportTicketsForAdmin(tournamentId, onData, onError) {
  if (!tournamentId) return () => {};
  const q = query(
    collection(db, COL.SUPPORT),
    where("tournamentId", "==", tournamentId),
    orderBy("lastUpdated", "desc"),
    limit(50)
  );
  return safeOnSnapshot(q, onData, onError);
}

/* =========================
   REALTIME DB: PRESENCE (READ)
========================= */

export function listenPresence(tournamentId, onData) {
  if (!tournamentId) return () => {};
  const presRef = ref(rtdb, `presence/${tournamentId}`);
  const off = onValue(presRef, (snap) => onData(snap.val() || {}));
  // RTDB "onValue" returns unsubscribe function in v9 compat style? not always.
  // To keep safe:
  return () => off?.();
}

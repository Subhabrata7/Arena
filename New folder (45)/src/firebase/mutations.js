// src/firebase/mutations.js
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { ref, set, onDisconnect, remove } from "firebase/database";
import { db, rtdb } from "./config";
import { COL } from "./queries";

/* =========================
   TOURNAMENT: CREATE
========================= */

export async function createTournament({ form, user }) {
  // form should already contain: name, format, mode, maxPlayers, deadline, etc.
  const payload = {
    ...form,
    ownerId: user.uid,
    organizerName: user.displayName || "Organizer",
    status: "Registration Open",
    createdAt: Date.now(),
    createdAtServer: serverTimestamp(),
    adminIds: [],
    playerCount: 0,
    participants: [],
  };

  const docRef = await addDoc(collection(db, COL.TOURNAMENTS), payload);
  return docRef.id;
}

/* =========================
   PARTICIPANTS: JOIN + APPROVE
========================= */

export async function requestJoinTournament({
  tournamentId,
  user,
  userProfile,
  utr = null,
}) {
  // Create participant row (pending)
  const participant = {
    tournamentId,
    userId: user.uid,
    displayName: userProfile?.playerName || user.displayName || "Player",
    status: "pending",
    utr,
    createdAt: Date.now(),
    createdAtServer: serverTimestamp(),
    paid: false,
    disputeStrikes: 0,
    accuracyConfirmed: 0,
    accuracyTotal: 0,
  };

  const pRef = await addDoc(collection(db, COL.PARTICIPANTS), participant);

  // Add to tournament participants list (for quick checks)
  await updateDoc(doc(db, COL.TOURNAMENTS, tournamentId), {
    participants: arrayUnion(user.uid),
  });

  return pRef.id;
}

export async function approveParticipant({ participantId, tournamentId }) {
  await updateDoc(doc(db, COL.PARTICIPANTS, participantId), {
    status: "approved",
    updatedAt: Date.now(),
    updatedAtServer: serverTimestamp(),
  });

  // increment playerCount once approval is done
  await updateDoc(doc(db, COL.TOURNAMENTS, tournamentId), {
    playerCount: increment(1),
  });
}

/* =========================
   ADMINS: GRANT / REVOKE
========================= */

export async function grantAdmin({ tournamentId, uid }) {
  await updateDoc(doc(db, COL.TOURNAMENTS, tournamentId), {
    adminIds: arrayUnion(uid),
  });
}

export async function revokeAdmin({ tournamentId, uid }) {
  await updateDoc(doc(db, COL.TOURNAMENTS, tournamentId), {
    adminIds: arrayRemove(uid),
  });
}

/* =========================
   ANNOUNCEMENTS
========================= */

export async function createAnnouncement({ tournamentId, content, user }) {
  await addDoc(collection(db, COL.ANNOUNCEMENTS), {
    tournamentId,
    content,
    createdAt: Date.now(),
    createdAtServer: serverTimestamp(),
    createdBy: user?.uid || null,
  });
}

/* =========================
   SUPPORT (TICKETS)
========================= */

export async function sendSupportMessage({
  tournamentId,
  user,
  ticketId = null,
  text,
}) {
  if (!text?.trim()) return;

  const msg = {
    senderId: user.uid,
    senderName: user.displayName || "Player",
    text: text.trim(),
    createdAt: Date.now(),
  };

  if (ticketId) {
    await updateDoc(doc(db, COL.SUPPORT, ticketId), {
      messages: arrayUnion(msg),
      lastUpdated: Date.now(),
      lastUpdatedServer: serverTimestamp(),
    });
    return ticketId;
  }

  const docRef = await addDoc(collection(db, COL.SUPPORT), {
    tournamentId,
    userId: user.uid,
    userName: user.displayName || "Player",
    messages: [msg],
    lastUpdated: Date.now(),
    lastUpdatedServer: serverTimestamp(),
  });

  return docRef.id;
}

/* =========================
   FIXTURES: ROUND ROBIN GENERATOR (LEAGUE)
========================= */

export async function generateLeagueFixtures({ tournamentId, participants }) {
  // Only approved participants
  const confirmed = participants.filter((p) => p.status === "approved");
  if (confirmed.length < 2) return { created: 0 };

  // Circle method
  let players = confirmed.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
  }));

  if (players.length % 2 !== 0) players.push({ userId: "bye", displayName: "BYE" });

  const rounds = players.length - 1;
  const half = players.length / 2;
  let order = 0;
  let created = 0;

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const pA = players[i];
      const pB = players[players.length - 1 - i];

      if (pA.userId !== "bye" && pB.userId !== "bye") {
        await addDoc(collection(db, COL.MATCHES), {
          tournamentId,
          playerAId: pA.userId,
          playerAName: pA.displayName,
          playerBId: pB.userId,
          playerBName: pB.displayName,
          order: order++,
          status: "pending",
          score: { a: 0, b: 0 },
          readyA: false,
          readyB: false,
          roundName: `Matchday ${r + 1}`,
          createdAt: Date.now(),
          createdAtServer: serverTimestamp(),
        });
        created++;
      }
    }

    // rotate (keep index 0 fixed)
    players.splice(1, 0, players.pop());
  }

  await updateDoc(doc(db, COL.TOURNAMENTS, tournamentId), {
    status: "Live",
  });

  return { created };
}

/* =========================
   MATCH FLOW: READY + SUBMIT + CONFIRM + DISPUTE
========================= */

export async function toggleReady({ matchId, myUid, match }) {
  const isA = match.playerAId === myUid;
  const field = isA ? "readyA" : "readyB";
  await updateDoc(doc(db, COL.MATCHES, matchId), { [field]: !match[field] });
}

export async function submitScore({ matchId, match, myUid, scoreA, scoreB }) {
  // increment accuracyTotal for submitter participant
  const q = query(
    collection(db, COL.PARTICIPANTS),
    where("tournamentId", "==", match.tournamentId),
    where("userId", "==", myUid)
  );
  const snap = await getDocs(q);
  const pDoc = snap.docs[0];

  if (pDoc) {
    await updateDoc(doc(db, COL.PARTICIPANTS, pDoc.id), {
      accuracyTotal: increment(1),
    });
  }

  await updateDoc(doc(db, COL.MATCHES, matchId), {
    score: { a: Number(scoreA), b: Number(scoreB) },
    status: "pending_confirmation",
    submittedBy: myUid,
    submittedAt: Date.now(),
  });
}

export async function confirmScore({ matchId, match }) {
  // reward accuracyConfirmed to submitter
  if (match.submittedBy) {
    const q = query(
      collection(db, COL.PARTICIPANTS),
      where("tournamentId", "==", match.tournamentId),
      where("userId", "==", match.submittedBy)
    );
    const snap = await getDocs(q);
    const pDoc = snap.docs[0];
    if (pDoc) {
      await updateDoc(doc(db, COL.PARTICIPANTS, pDoc.id), {
        accuracyConfirmed: increment(1),
      });
    }
  }

  await updateDoc(doc(db, COL.MATCHES, matchId), {
    status: "confirmed",
    confirmedAt: Date.now(),
  });
}

export async function disputeMatch({ matchId, match, myUid }) {
  // add strike to disputer
  const q = query(
    collection(db, COL.PARTICIPANTS),
    where("tournamentId", "==", match.tournamentId),
    where("userId", "==", myUid)
  );
  const snap = await getDocs(q);
  const pDoc = snap.docs[0];

  if (pDoc) {
    await updateDoc(doc(db, COL.PARTICIPANTS, pDoc.id), {
      disputeStrikes: increment(1),
    });
  }

  await updateDoc(doc(db, COL.MATCHES, matchId), {
    status: "disputed",
    disputerId: myUid,
    disputedAt: Date.now(),
  });
}

/* =========================
   REALTIME DB: PRESENCE (WRITE)
========================= */

export async function setUserPresence({ tournamentId, user }) {
  if (!tournamentId || !user?.uid) return;

  const userRef = ref(rtdb, `presence/${tournamentId}/${user.uid}`);

  await set(userRef, {
    status: "online",
    name: user.displayName || "Player",
    lastSeen: Date.now(),
  });

  // auto remove on disconnect
  onDisconnect(userRef).remove();
}

export async function clearUserPresence({ tournamentId, uid }) {
  if (!tournamentId || !uid) return;
  const userRef = ref(rtdb, `presence/${tournamentId}/${uid}`);
  await remove(userRef);
}

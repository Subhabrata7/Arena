import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";

/* =========================
   AUTO RESOLVE MATCH
========================= */

export async function autoResolveMatch({
  match,
  presenceMap,
  now = Date.now(),
}) {
  if (!match.deadline || now < match.deadline) return false;
  if (match.status === "confirmed") return false;

  const aOnline = !!presenceMap[match.playerAId];
  const bOnline = !!presenceMap[match.playerBId];

  let score = { a: 0, b: 0 };
  let reason = "";

  // Presence-based resolution
  if (aOnline && !bOnline) {
    score = { a: 3, b: 0 };
    reason = "A_PRESENT_B_ABSENT";
  } else if (!aOnline && bOnline) {
    score = { a: 0, b: 3 };
    reason = "B_PRESENT_A_ABSENT";
  } else {
    score = { a: 0, b: 0 };
    reason = "NO_PLAY";
  }

  await updateDoc(doc(db, "matches", match.id), {
    score,
    status: "confirmed",
    resolvedBy: "auto",
    autoReason: reason,
    confirmedAt: Date.now(),
  });

  return true;
}

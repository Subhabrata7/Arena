import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Auto-advance knockout winner
 */
export async function advanceKnockoutMatch(match, tournament) {
  if (!match || match.status !== "confirmed") return;

  const winnerId =
    match.scoreA > match.scoreB ? match.playerAId : match.playerBId;
  const winnerName =
    match.scoreA > match.scoreB ? match.playerAName : match.playerBName;

  // Final match → tournament completed
  if (match.round === "Final") {
    await updateDoc(doc(db, "tournaments", tournament.id), {
      status: "Completed",
      winnerId,
      winnerName,
    });

    // Create payout entry
    await addDoc(collection(db, "payouts"), {
      tournamentId: tournament.id,
      userId: winnerId,
      playerName: winnerName,
      amount: tournament.prizes?.winner || 0,
      status: "pending",
      createdAt: Date.now(),
    });

    return;
  }

  // Otherwise move winner to next round
  const nextRoundMap = {
    Round16: "Quarter",
    Quarter: "Semi",
    Semi: "Final",
  };

  const nextRound = nextRoundMap[match.round];
  if (!nextRound) return;

  await addDoc(collection(db, "matches"), {
    tournamentId: tournament.id,
    round: nextRound,
    playerAId: winnerId,
    playerAName: winnerName,
    playerBId: null,
    playerBName: null,
    status: "pending",
    scoreA: 0,
    scoreB: 0,
    createdAt: Date.now(),
  });
}

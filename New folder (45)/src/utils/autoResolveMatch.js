export function autoResolveMatch(match, presenceMap) {
  const now = Date.now();
  if (!match.deadline || now < match.deadline) return null;
  if (match.status === "confirmed" || match.autoResolved) return null;

  const Aonline = !!presenceMap[match.playerAId];
  const Bonline = !!presenceMap[match.playerBId];

  // Rule A
  if (Aonline && !Bonline) {
    return {
      scoreA: 3,
      scoreB: 0,
      reason: "opponent_absent",
    };
  }

  if (!Aonline && Bonline) {
    return {
      scoreA: 0,
      scoreB: 3,
      reason: "opponent_absent",
    };
  }

  // Rule B / C
  return {
    scoreA: 0,
    scoreB: 0,
    reason: Aonline && Bonline
      ? "no_submission"
      : "both_absent",
  };
}

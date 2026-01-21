// src/utils/matchAutoRules.js

export function getAutoResult(match, presence = {}) {
  if (!match.deadline) return null;
  if (Date.now() < match.deadline) return null;
  if (match.status === "confirmed" || match.autoResolved) return null;

  const A = presence[match.playerAId];
  const B = presence[match.playerBId];

  // One present, one absent
  if (A && !B) return { a: 3, b: 0, reason: "opponent_absent" };
  if (!A && B) return { a: 0, b: 3, reason: "opponent_absent" };

  // Both present but no submission OR both absent
  return { a: 0, b: 0, reason: A || B ? "no_submission" : "both_absent" };
}

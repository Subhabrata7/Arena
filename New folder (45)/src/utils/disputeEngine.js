/* =========================
   DISPUTE & STRIKE ENGINE
========================= */

/**
 * Increment strike for score submitter
 */
export function registerDispute({
  submitterId,
  tournamentId,
  currentStrikes = 0,
}) {
  const strikes = currentStrikes + 1;

  return {
    strikes,
    bannedNextMatch: strikes >= 3,
    lastDisputeAt: Date.now(),
    tournamentId,
    userId: submitterId,
  };
}

/**
 * Check if player is banned for this match
 */
export function isPlayerBanned({
  playerId,
  bans = {},
  matchId,
}) {
  const ban = bans[playerId];
  if (!ban) return false;

  // Ban applies only to next match
  if (ban.matchId === matchId && !ban.used) {
    return true;
  }

  return false;
}

/**
 * Consume ban after match
 */
export function consumeBan({
  bans,
  playerId,
}) {
  if (!bans[playerId]) return bans;

  return {
    ...bans,
    [playerId]: {
      ...bans[playerId],
      used: true,
      usedAt: Date.now(),
    },
  };
}

/**
 * Auto-ban record generator
 */
export function createBan({
  playerId,
  matchId,
  reason = "3 disputed score submissions",
}) {
  return {
    [playerId]: {
      matchId,
      reason,
      createdAt: Date.now(),
      used: false,
    },
  };
}

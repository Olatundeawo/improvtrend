import cron from "node-cron";
import prisma from "../prisma/client.js";

const CRON_SCHEDULE     = "*/15 * * * *";
const WARNING_BEFORE_MS = 6 * 60 * 60 * 1000; // warn when ≤ 6 h remain

function hoursLeft(expiresAt) {
  return Math.ceil((expiresAt.getTime() - Date.now()) / (60 * 60 * 1000));
}

// ─── job 1: 6-hour warning notification ──────────────────────────────────────

async function sendExpiryWarnings() {
  const now           = new Date();
  const warningCutoff = new Date(now.getTime() + WARNING_BEFORE_MS);

  const characters = await prisma.character.findMany({
    where: {
      claimedByUserId: { not: null },
      claimExpiresAt:  { gt: now, lte: warningCutoff },
      warningSentAt:   null,
    },
    select: { id: true, name: true, claimedByUserId: true, claimExpiresAt: true },
  });

  if (!characters.length) return;

  await Promise.allSettled(
    characters.map(async (char) => {
      try {
        const hours = hoursLeft(char.claimExpiresAt);

        await prisma.notification.create({
          data: {
            userId:  char.claimedByUserId,
            type:    "CLAIM_EXPIRY_WARNING",
            title:   "Character claim expiring soon",
            message: `Your claim on "${char.name}" expires in ~${hours}h. Write a turn to keep it!`,
          },
        });

        await prisma.character.update({
          where: { id: char.id },
          data:  { warningSentAt: now },
        });
      } catch (err) {
        console.error(`[scheduler] Warning notification failed for character ${char.id}:`, err.message);
      }
    })
  );

  console.log(`[scheduler] Sent expiry warnings for ${characters.length} character(s).`);
}

// ─── job 2: auto-release expired claims ──────────────────────────────────────

async function releaseExpiredClaims() {
  const now = new Date();

  const expired = await prisma.character.findMany({
    where: {
      claimedByUserId: { not: null },
      claimExpiresAt:  { lte: now },
    },
    select: { id: true, name: true, claimedByUserId: true },
  });

  if (!expired.length) return;

  // Release all expired claims in one query
  await prisma.character.updateMany({
    where: { id: { in: expired.map((c) => c.id) } },
    data: {
      claimedByUserId: null,
      claimExpiresAt:  null,
      lastTurnAt:      null,
      warningSentAt:   null,
    },
  });

  // Write one notification per released character
  await Promise.allSettled(
    expired.map((char) =>
      prisma.notification.create({
        data: {
          userId:  char.claimedByUserId,
          type:    "CLAIM_AUTO_RELEASED",
          title:   "Character auto-released",
          message: `Your claim on "${char.name}" expired after 48 hours of inactivity. It's now available for others to claim.`,
        },
      }).catch((err) =>
        console.error(`[scheduler] Release notification failed for character ${char.id}:`, err.message)
      )
    )
  );

  console.log(`[scheduler] Auto-released ${expired.length} expired character claim(s).`);
}

// ─── entry point ─────────────────────────────────────────────────────────────

export function startScheduler() {
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      await sendExpiryWarnings();
      await releaseExpiredClaims();
    } catch (err) {
      console.error("[scheduler] Job error:", err.message);
    }
  });

  console.log(`[scheduler] Started (${CRON_SCHEDULE}).`);
}
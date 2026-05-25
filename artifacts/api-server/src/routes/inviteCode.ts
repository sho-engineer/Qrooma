import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, couponsTable, couponRedemptionsTable } from "@workspace/db";

export type AccessType = "tester" | "early_access" | "special";

interface InviteCodeDef {
  accessType: AccessType;
  isUnlimitedUser: boolean;
  dailyRunLimit: number | null;
  monthlyRunLimit: number | null;
}

const BUILT_IN_CODES: Record<string, InviteCodeDef> = {
  QRTESTER: {
    accessType: "tester",
    isUnlimitedUser: true,
    dailyRunLimit: null,
    monthlyRunLimit: null,
  },
  EARLYBIRD: {
    accessType: "early_access",
    isUnlimitedUser: true,
    dailyRunLimit: null,
    monthlyRunLimit: null,
  },
  QRSPECIAL: {
    accessType: "special",
    isUnlimitedUser: true,
    dailyRunLimit: null,
    monthlyRunLimit: null,
  },
};

function loadEnvCodes(): Record<string, InviteCodeDef> {
  const raw = process.env["INVITE_CODES"];
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, InviteCodeDef>;
  } catch {
    return {};
  }
}

/**
 * Calculate new fullAccessExpiresAt with stacking and 30-day cap.
 * - If currentExpiry is in the future: extend from currentExpiry
 * - Otherwise: extend from now
 * - Cap at now + 30 days
 */
function calcNewExpiry(currentExpiry: Date | null, daysToAdd: number): Date {
  const now        = new Date();
  const maxExpiry  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const base       = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const candidate  = new Date(base.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return candidate < maxExpiry ? candidate : maxExpiry;
}

const router = Router();

router.post("/invite-code/apply", async (req, res) => {
  const body   = req.body as { code?: unknown };
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!body.code || typeof body.code !== "string") {
    res.status(400).json({ valid: false, reason: "invalid_request" });
    return;
  }

  const normalized = body.code.trim().toUpperCase();

  // ── 1. Try DB coupon first ─────────────────────────────────────────────
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, normalized));

    const coupon = rows[0];

    if (coupon) {
      // Validate active / date range / capacity
      if (!coupon.isActive) {
        res.json({ valid: false, reason: "inactive" });
        return;
      }
      if (coupon.startsAt && coupon.startsAt > now) {
        res.json({ valid: false, reason: "not_started" });
        return;
      }
      if (coupon.expiresAt && coupon.expiresAt < now) {
        res.json({ valid: false, reason: "expired" });
        return;
      }
      if (coupon.maxRedemptions !== null && coupon.currentRedemptions >= coupon.maxRedemptions) {
        res.json({ valid: false, reason: "max_redemptions" });
        return;
      }

      // Check per-user usage
      if (userId) {
        const used = await db
          .select({ id: couponRedemptionsTable.id })
          .from(couponRedemptionsTable)
          .where(
            and(
              eq(couponRedemptionsTable.couponId, coupon.id),
              eq(couponRedemptionsTable.userId, userId)
            )
          );
        if (used.length > 0) {
          res.json({ valid: false, reason: "already_used" });
          return;
        }
      }

      // Handle free_trial_days — stacking logic
      if (coupon.discountType === "free_trial_days" && userId) {
        const daysToAdd = coupon.discountValue;

        // Get current expiry from DB
        const userRows = await db
          .select({ fullAccessExpiresAt: usersTable.fullAccessExpiresAt })
          .from(usersTable)
          .where(eq(usersTable.id, userId));
        const current = userRows[0]?.fullAccessExpiresAt ?? null;

        const newExpiry = calcNewExpiry(current, daysToAdd);

        // Update user's fullAccessExpiresAt
        await db
          .update(usersTable)
          .set({ fullAccessExpiresAt: newExpiry, lastActiveAt: now })
          .where(eq(usersTable.id, userId));

        // Record redemption
        await db.insert(couponRedemptionsTable).values({
          couponId:   coupon.id,
          userId,
          redeemedAt: now,
          metadata:   { daysAdded: daysToAdd, newExpiry: newExpiry.toISOString() },
        });

        // Increment counter
        await db
          .update(couponsTable)
          .set({ currentRedemptions: coupon.currentRedemptions + 1, updatedAt: now })
          .where(eq(couponsTable.id, coupon.id));

        req.log.info({ userId, couponId: coupon.id, daysAdded: daysToAdd, newExpiry }, "Full access coupon applied");

        res.json({
          valid:               true,
          type:                "full_access",
          daysAdded:           daysToAdd,
          fullAccessExpiresAt: newExpiry.toISOString(),
        });
        return;
      }

      // Other discount types (percentage, fixed_amount) — record redemption only
      if (userId) {
        await db.insert(couponRedemptionsTable).values({
          couponId:   coupon.id,
          userId,
          redeemedAt: now,
          metadata:   { discountType: coupon.discountType, discountValue: coupon.discountValue },
        });
        await db
          .update(couponsTable)
          .set({ currentRedemptions: coupon.currentRedemptions + 1, updatedAt: now })
          .where(eq(couponsTable.id, coupon.id));
      }

      res.json({
        valid:          true,
        type:           "discount",
        discountType:   coupon.discountType,
        discountValue:  coupon.discountValue,
      });
      return;
    }
  } catch (e) {
    req.log.error(e, "DB coupon lookup failed");
    // Fall through to built-in codes
  }

  // ── 2. Fall back to built-in / env codes ──────────────────────────────
  const allCodes = { ...BUILT_IN_CODES, ...loadEnvCodes() };
  const match    = allCodes[normalized];

  if (!match) {
    res.status(200).json({ valid: false, reason: "not_found" });
    return;
  }

  res.status(200).json({
    valid:           true,
    type:            "invite",
    accessType:      match.accessType,
    isUnlimitedUser: match.isUnlimitedUser,
    dailyRunLimit:   match.dailyRunLimit,
    monthlyRunLimit: match.monthlyRunLimit,
  });
});

export default router;

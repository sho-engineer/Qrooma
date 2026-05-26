import { Router } from "express";
import { db, couponsTable, couponRedemptionsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// ── Validate (public — no auth required) ──────────────────────────────────
router.post("/coupons/validate", async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code) { res.status(400).json({ valid: false, error: "code required" }); return; }

  try {
    const rows = await db.select().from(couponsTable).where(eq(couponsTable.code, code.toUpperCase().trim()));
    if (rows.length === 0) { res.json({ valid: false, error: "not_found" }); return; }

    const c = rows[0];
    if (!c.isActive)                                                           { res.json({ valid: false, error: "inactive" }); return; }
    if (c.expiresAt && c.expiresAt <= new Date())                             { res.json({ valid: false, error: "expired" }); return; }
    if (c.maxRedemptions !== null && c.currentRedemptions >= c.maxRedemptions) { res.json({ valid: false, error: "fully_used" }); return; }

    res.json({ valid: true, accessDays: c.accessDays, couponType: c.couponType, code: c.code });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ valid: false, error: "server_error" });
  }
});

// ── Redeem (requires x-user-id) ───────────────────────────────────────────
router.post("/coupons/redeem", async (req, res) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  const { code } = req.body as { code?: string };

  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }
  if (!code)   { res.status(400).json({ error: "code required" }); return; }

  try {
    // Re-validate
    const rows = await db.select().from(couponsTable).where(eq(couponsTable.code, code.toUpperCase().trim()));
    if (rows.length === 0) { res.status(404).json({ error: "not_found" }); return; }

    const c = rows[0];
    if (!c.isActive)                                                           { res.status(400).json({ error: "inactive" }); return; }
    if (c.expiresAt && c.expiresAt <= new Date())                             { res.status(400).json({ error: "expired" }); return; }
    if (c.maxRedemptions !== null && c.currentRedemptions >= c.maxRedemptions) { res.status(400).json({ error: "fully_used" }); return; }

    // Get user
    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (users.length === 0) { res.status(404).json({ error: "user_not_found" }); return; }
    const user = users[0];

    // Compute new expiry (cap at 30 days from now)
    const now           = new Date();
    const maxExpiry     = new Date(now.getTime() + 30 * 86_400_000);
    const currentExpiry = user.fullAccessExpiresAt;
    const base          = currentExpiry && currentExpiry > now ? currentExpiry : now;
    let   newExpiry     = new Date(base.getTime() + c.accessDays * 86_400_000);
    if (newExpiry > maxExpiry) newExpiry = maxExpiry;

    // Update user access (skip for admin/tester — they stay unlimited)
    if (user.role !== "admin" && user.role !== "tester") {
      await db.update(usersTable).set({ fullAccessExpiresAt: newExpiry }).where(eq(usersTable.id, userId));
    }

    // Record redemption
    await db.insert(couponRedemptionsTable).values({
      couponId:                c.id,
      userId,
      userEmail:               user.email,
      accessDaysGranted:       c.accessDays,
      previousAccessExpiresAt: currentExpiry ?? null,
      newAccessExpiresAt:      newExpiry,
    });

    // Increment redemption count
    await db.update(couponsTable)
      .set({ currentRedemptions: sql`${couponsTable.currentRedemptions} + 1`, updatedAt: new Date() })
      .where(eq(couponsTable.id, c.id));

    res.json({ success: true, accessDays: c.accessDays, newExpiresAt: newExpiry.toISOString() });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;

import { Router, type Request, type Response, type NextFunction } from "express";
import { db, usersTable, analyticsEventsTable, couponsTable, couponRedemptionsTable, feedbackPostsTable, feedbackVotesTable } from "@workspace/db";
import { eq, gte, count, sql, desc } from "drizzle-orm";

const router = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId));
  if (rows[0]?.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  next();
}

router.use(requireAdmin);

// ── Overview metrics ────────────────────────────────────────────────────────
router.get("/admin/metrics", async (req, res) => {
  try {
    const now = new Date();
    const today   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week7   = new Date(Date.now() - 7  * 86400_000);
    const week30  = new Date(Date.now() - 30 * 86400_000);
    const month1  = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      [totalUsers],
      [newToday],
      [newWeek],
      [newMonth],
      [active7],
      [active30],
      [totalRooms],
      [totalMemos],
      [totalFeedback],
      [totalVotes],
      [totalCoupons],
      [totalRedemptions],
    ] = await Promise.all([
      db.select({ c: count() }).from(usersTable),
      db.select({ c: count() }).from(usersTable).where(gte(usersTable.createdAt, today)),
      db.select({ c: count() }).from(usersTable).where(gte(usersTable.createdAt, week7)),
      db.select({ c: count() }).from(usersTable).where(gte(usersTable.createdAt, month1)),
      db.select({ c: count() }).from(usersTable).where(gte(usersTable.lastActiveAt, week7)),
      db.select({ c: count() }).from(usersTable).where(gte(usersTable.lastActiveAt, week30)),
      db.select({ c: count() }).from(analyticsEventsTable).where(eq(analyticsEventsTable.eventName, "create_decision_room")),
      db.select({ c: count() }).from(analyticsEventsTable).where(eq(analyticsEventsTable.eventName, "generate_decision_memo")),
      db.select({ c: count() }).from(feedbackPostsTable),
      db.select({ c: count() }).from(feedbackVotesTable),
      db.select({ c: count() }).from(couponsTable),
      db.select({ c: count() }).from(couponRedemptionsTable),
    ]);

    res.json({
      totalUsers:          totalUsers.c,
      newUsersToday:       newToday.c,
      newUsersThisWeek:    newWeek.c,
      newUsersThisMonth:   newMonth.c,
      activeUsers7d:       active7.c,
      activeUsers30d:      active30.c,
      totalDecisionRooms:  totalRooms.c,
      totalMemos:          totalMemos.c,
      totalFeedbackPosts:  totalFeedback.c,
      totalFeedbackVotes:  totalVotes.c,
      totalCoupons:        totalCoupons.c,
      totalRedemptions:    totalRedemptions.c,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// ── Users ───────────────────────────────────────────────────────────────────
router.get("/admin/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

router.patch("/admin/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body as { role: "user" | "admin" };
  if (role !== "user" && role !== "admin") { res.status(400).json({ error: "invalid role" }); return; }
  try {
    const rows = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// ── Coupons ─────────────────────────────────────────────────────────────────
router.get("/admin/coupons", async (req, res) => {
  try {
    const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
    res.json(coupons);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

router.post("/admin/coupons", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  const { code, name, description, discountType, discountValue, currency, startsAt, expiresAt, maxRedemptions, maxRedemptionsPerUser } = req.body;
  if (!code || !name || !discountType || discountValue === undefined) {
    res.status(400).json({ error: "code, name, discountType, discountValue required" });
    return;
  }
  try {
    const rows = await db.insert(couponsTable).values({
      code: code.toUpperCase(),
      name,
      description: description ?? null,
      discountType,
      discountValue: Number(discountValue),
      currency: currency ?? null,
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      maxRedemptionsPerUser: maxRedemptionsPerUser ? Number(maxRedemptionsPerUser) : 1,
      createdBy: userId,
      isActive: true,
    }).returning();
    res.json(rows[0]);
  } catch (e: unknown) {
    req.log.error(e);
    const msg = e instanceof Error ? e.message : "db error";
    if (msg.includes("unique")) { res.status(409).json({ error: "Coupon code already exists" }); return; }
    res.status(500).json({ error: "db error" });
  }
});

router.patch("/admin/coupons/:id", async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };
  try {
    const rows = await db.update(couponsTable).set({ isActive, updatedAt: new Date() }).where(eq(couponsTable.id, id)).returning();
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

router.get("/admin/coupons/:id/redemptions", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.select().from(couponRedemptionsTable).where(eq(couponRedemptionsTable.couponId, id)).orderBy(desc(couponRedemptionsTable.redeemedAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// ── Admin Feedback ──────────────────────────────────────────────────────────
router.get("/admin/feedback", async (req, res) => {
  try {
    const posts = await db.select().from(feedbackPostsTable).orderBy(desc(feedbackPostsTable.upvoteCount));
    res.json(posts);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// ── Analytics ───────────────────────────────────────────────────────────────
router.get("/admin/analytics", async (req, res) => {
  try {
    const rows = await db
      .select({ eventName: analyticsEventsTable.eventName, c: count() })
      .from(analyticsEventsTable)
      .groupBy(analyticsEventsTable.eventName)
      .orderBy(desc(sql`count(*)`));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

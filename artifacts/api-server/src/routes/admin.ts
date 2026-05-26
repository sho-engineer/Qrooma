import { Router, type Request, type Response, type NextFunction } from "express";
import { db, usersTable, analyticsEventsTable, couponsTable, couponRedemptionsTable, feedbackPostsTable, feedbackVotesTable, waitlistEntriesTable, adminAuditLogsTable } from "@workspace/db";
import { eq, gte, count, sql, desc } from "drizzle-orm";

async function writeAuditLog(fields: {
  actorUid:   string;
  actorEmail: string;
  action:     string;
  targetType: string;
  targetId?:  string;
  beforeVal?: string;
  afterVal?:  string;
  note?:      string;
}) {
  try {
    await db.insert(adminAuditLogsTable).values({
      actorUid:   fields.actorUid,
      actorEmail: fields.actorEmail,
      action:     fields.action,
      targetType: fields.targetType,
      targetId:   fields.targetId ?? null,
      beforeVal:  fields.beforeVal ?? null,
      afterVal:   fields.afterVal ?? null,
      note:       fields.note ?? null,
    });
  } catch {
    // audit log write is non-blocking
  }
}

const router = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.path.startsWith("/admin")) { next(); return; }
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
      [totalWaitlist],
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
      db.select({ c: count() }).from(waitlistEntriesTable),
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
      totalWaitlist:       totalWaitlist.c,
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
  const actorUid = req.headers["x-user-id"] as string;
  const { id }   = req.params;
  const { role } = req.body as { role: "user" | "tester" | "admin" };
  if (role !== "user" && role !== "tester" && role !== "admin") {
    res.status(400).json({ error: "invalid role" });
    return;
  }
  if (actorUid === id) {
    res.status(403).json({ error: "Cannot change your own role" });
    return;
  }
  try {
    const before = await db.select({ role: usersTable.role, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, id));
    const rows   = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    const actor  = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, actorUid));
    await writeAuditLog({
      actorUid,
      actorEmail: actor[0]?.email ?? actorUid,
      action:     "user.role_changed",
      targetType: "user",
      targetId:   id,
      beforeVal:  before[0]?.role ?? "unknown",
      afterVal:   role,
      note:       `Target: ${before[0]?.email ?? id}`,
    });
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
  const actorUid = req.headers["x-user-id"] as string;
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
      createdBy: actorUid,
      isActive: true,
    }).returning();
    const actor = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, actorUid));
    await writeAuditLog({
      actorUid,
      actorEmail: actor[0]?.email ?? actorUid,
      action:     "coupon.created",
      targetType: "coupon",
      targetId:   rows[0]?.id,
      afterVal:   code.toUpperCase(),
      note:       name,
    });
    res.json(rows[0]);
  } catch (e: unknown) {
    req.log.error(e);
    const msg = e instanceof Error ? e.message : "db error";
    if (msg.includes("unique")) { res.status(409).json({ error: "Coupon code already exists" }); return; }
    res.status(500).json({ error: "db error" });
  }
});

router.patch("/admin/coupons/:id", async (req, res) => {
  const actorUid = req.headers["x-user-id"] as string;
  const { id }   = req.params;
  const { isActive } = req.body as { isActive: boolean };
  try {
    const before = await db.select({ isActive: couponsTable.isActive, code: couponsTable.code }).from(couponsTable).where(eq(couponsTable.id, id));
    const rows   = await db.update(couponsTable).set({ isActive, updatedAt: new Date() }).where(eq(couponsTable.id, id)).returning();
    const actor  = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, actorUid));
    await writeAuditLog({
      actorUid,
      actorEmail: actor[0]?.email ?? actorUid,
      action:     isActive ? "coupon.activated" : "coupon.deactivated",
      targetType: "coupon",
      targetId:   id,
      beforeVal:  before[0]?.isActive ? "active" : "inactive",
      afterVal:   isActive ? "active" : "inactive",
      note:       before[0]?.code,
    });
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

router.get("/admin/feedback/regions", async (req, res) => {
  try {
    const rows = await db
      .select({
        country:    sql<string>`COALESCE(${feedbackVotesTable.country}, 'Unknown')`,
        region:     sql<string>`COALESCE(${feedbackVotesTable.region}, 'Unknown')`,
        voteCount:  sql<number>`COUNT(*)::int`,
        postCount:  sql<number>`COUNT(DISTINCT ${feedbackVotesTable.feedbackPostId})::int`,
        lastVoteAt: sql<string>`MAX(${feedbackVotesTable.createdAt})`,
      })
      .from(feedbackVotesTable)
      .groupBy(
        sql`COALESCE(${feedbackVotesTable.country}, 'Unknown')`,
        sql`COALESCE(${feedbackVotesTable.region}, 'Unknown')`,
      )
      .orderBy(desc(sql`COUNT(*)`));
    res.json(rows);
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

// ── Seed test account ────────────────────────────────────────────────────────
router.post("/admin/seed-test-account", async (req, res) => {
  const firebaseApiKey = process.env["VITE_FIREBASE_API_KEY"];
  if (!firebaseApiKey) {
    res.status(500).json({ error: "VITE_FIREBASE_API_KEY not configured" });
    return;
  }

  const TEST_EMAIL    = "dev@adjudo.com";
  const TEST_PASSWORD = "AdjudoDev-2026-Beta!";
  const TEST_NAME     = "Dev Tester";

  try {
    // 1. Create Firebase Auth user via Identity Toolkit REST API
    const createRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: false }),
      }
    );
    const createData = await createRes.json() as { localId?: string; error?: { message?: string } };

    let uid: string;

    if (createRes.ok && createData.localId) {
      uid = createData.localId;
      req.log.info({ uid }, "Firebase test account created");
    } else if (createData.error?.message === "EMAIL_EXISTS") {
      // Already exists — sign in to retrieve UID
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
        }
      );
      const signInData = await signInRes.json() as { localId?: string; error?: { message?: string } };
      if (!signInData.localId) {
        res.status(409).json({ error: "User already exists but sign-in failed: " + (signInData.error?.message ?? "unknown") });
        return;
      }
      uid = signInData.localId;
      req.log.info({ uid }, "Firebase test account already exists");
    } else {
      res.status(500).json({ error: "Firebase error: " + (createData.error?.message ?? "unknown") });
      return;
    }

    // 2. Upsert PostgreSQL user record (role: user, NOT admin)
    const existing = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, uid));
    if (existing.length === 0) {
      await db.insert(usersTable).values({ id: uid, email: TEST_EMAIL, name: TEST_NAME, role: "user" });
    } else {
      await db.update(usersTable).set({ lastActiveAt: new Date(), email: TEST_EMAIL, name: TEST_NAME }).where(eq(usersTable.id, uid));
    }

    req.log.info({ uid }, "Test account seeded successfully");
    res.json({
      ok:    true,
      uid,
      email: TEST_EMAIL,
      note:  "Firestore profile users/{uid} will be written automatically on first login.",
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Seed failed" });
  }
});

// ── Waitlist ─────────────────────────────────────────────────────────────────
router.get("/admin/waitlist", async (req, res) => {
  try {
    const entries = await db
      .select()
      .from(waitlistEntriesTable)
      .orderBy(desc(waitlistEntriesTable.createdAt));
    res.json(entries);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

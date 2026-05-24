import { Router } from "express";
import { db, feedbackPostsTable, feedbackVotesTable, usersTable } from "@workspace/db";
import type { FeedbackPost } from "@workspace/db";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";

type FeedbackStatus   = FeedbackPost["status"];
type FeedbackCategory = FeedbackPost["category"];

const router = Router();

function getUserId(req: Parameters<Parameters<typeof router.get>[1]>[0]): string | null {
  return (req.headers["x-user-id"] as string) || null;
}

async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const rows = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId));
  return rows[0]?.role === "admin";
}

const VALID_STATUSES: FeedbackStatus[] = ["under_review", "planned", "in_progress", "released", "not_planned"];
const VALID_CATEGORIES: NonNullable<FeedbackCategory>[] = ["feature_request", "improvement", "bug", "integration", "pricing", "other"];

// GET /api/feedback — list posts (pinned first, then by upvotes)
router.get("/feedback", async (req, res) => {
  const userId    = getUserId(req);
  const voterEmail = (req.query.voter_email as string | undefined)?.trim().toLowerCase() || null;
  const { status, category, sort } = req.query as { status?: string; category?: string; sort?: string };
  try {
    const conditions = [eq(feedbackPostsTable.isHidden, false)] as ReturnType<typeof eq>[];

    const safeStatus = VALID_STATUSES.find((s) => s === status);
    if (safeStatus) conditions.push(eq(feedbackPostsTable.status, safeStatus));

    const safeCategory = VALID_CATEGORIES.find((c) => c === category);
    if (safeCategory) conditions.push(eq(feedbackPostsTable.category, safeCategory));

    const posts = await db
      .select()
      .from(feedbackPostsTable)
      .where(and(...conditions))
      .orderBy(
        desc(feedbackPostsTable.isPinned),
        sort === "newest"
          ? desc(feedbackPostsTable.createdAt)
          : sort === "updated"
            ? desc(feedbackPostsTable.updatedAt)
            : desc(feedbackPostsTable.upvoteCount),
      );

    let votedIds: Set<string> = new Set();
    if (userId) {
      const votes = await db
        .select({ id: feedbackVotesTable.feedbackPostId })
        .from(feedbackVotesTable)
        .where(and(eq(feedbackVotesTable.userId, userId), isNotNull(feedbackVotesTable.userId)));
      votedIds = new Set(votes.map((v) => v.id));
    } else if (voterEmail) {
      const votes = await db
        .select({ id: feedbackVotesTable.feedbackPostId })
        .from(feedbackVotesTable)
        .where(eq(feedbackVotesTable.voterEmail, voterEmail));
      votedIds = new Set(votes.map((v) => v.id));
    }

    res.json(posts.map((p) => ({ ...p, hasVoted: votedIds.has(p.id) })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// POST /api/feedback — create post (auth required)
router.post("/feedback", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { title, description, category } = req.body as { title: string; description: string; category?: string };
  if (!title?.trim() || !description?.trim()) { res.status(400).json({ error: "title and description required" }); return; }
  const safeCategory = VALID_CATEGORIES.find((c) => c === category) ?? null;
  try {
    const rows = await db.insert(feedbackPostsTable).values({
      userId,
      title:       title.trim(),
      description: description.trim(),
      category:    safeCategory,
      status:      "under_review",
    }).returning();
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// POST /api/feedback/:id/vote — toggle vote (auth OR voter_email)
router.post("/feedback/:id/vote", async (req, res) => {
  const userId     = getUserId(req);
  const voterEmail = (req.body as { voter_email?: string }).voter_email?.trim().toLowerCase() || null;
  const { id }     = req.params;

  if (!userId && !voterEmail) {
    res.status(401).json({ error: "login or provide email to vote" });
    return;
  }

  try {
    let existing: { id: string }[];

    if (userId) {
      existing = await db
        .select({ id: feedbackVotesTable.id })
        .from(feedbackVotesTable)
        .where(and(eq(feedbackVotesTable.feedbackPostId, id), eq(feedbackVotesTable.userId, userId)));
    } else {
      existing = await db
        .select({ id: feedbackVotesTable.id })
        .from(feedbackVotesTable)
        .where(and(
          eq(feedbackVotesTable.feedbackPostId, id),
          eq(feedbackVotesTable.voterEmail, voterEmail!),
        ));
    }

    if (existing.length > 0) {
      if (userId) {
        await db.delete(feedbackVotesTable)
          .where(and(eq(feedbackVotesTable.feedbackPostId, id), eq(feedbackVotesTable.userId, userId)));
      } else {
        await db.delete(feedbackVotesTable)
          .where(and(
            eq(feedbackVotesTable.feedbackPostId, id),
            eq(feedbackVotesTable.voterEmail, voterEmail!),
          ));
      }
      await db.update(feedbackPostsTable)
        .set({ upvoteCount: sql`${feedbackPostsTable.upvoteCount} - 1`, updatedAt: new Date() })
        .where(eq(feedbackPostsTable.id, id));
      res.json({ voted: false });
    } else {
      await db.insert(feedbackVotesTable).values(
        userId
          ? { feedbackPostId: id, userId }
          : { feedbackPostId: id, userId: null, voterEmail: voterEmail! },
      );
      await db.update(feedbackPostsTable)
        .set({ upvoteCount: sql`${feedbackPostsTable.upvoteCount} + 1`, updatedAt: new Date() })
        .where(eq(feedbackPostsTable.id, id));
      res.json({ voted: true });
    }
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// PATCH /api/feedback/:id — admin update
router.patch("/feedback/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!await isAdmin(userId)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { id } = req.params;
  const body = req.body as Partial<{
    status:              FeedbackStatus;
    adminNote:           string | null;
    adminPriorityNote:   string | null;
    isHidden:            boolean;
    isRoadmapCandidate:  boolean;
    roadmapPriority:     FeedbackPost["roadmapPriority"];
  }>;
  try {
    const rows = await db.update(feedbackPostsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(feedbackPostsTable.id, id))
      .returning();
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

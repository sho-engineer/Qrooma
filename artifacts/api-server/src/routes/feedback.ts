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

// ── Timezone → country/region mapping ──────────────────────────────────────

const TZ_COUNTRY: Record<string, string> = {
  "Asia/Tokyo": "JP", "Asia/Osaka": "JP",
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY", "Asia/Kuching": "MY",
  "Asia/Bangkok": "TH",
  "Asia/Seoul": "KR",
  "Asia/Shanghai": "CN", "Asia/Chongqing": "CN", "Asia/Harbin": "CN", "Asia/Urumqi": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW",
  "Asia/Jakarta": "ID", "Asia/Makassar": "ID", "Asia/Jayapura": "ID",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Dubai": "AE",
  "Asia/Dhaka": "BD",
  "Asia/Karachi": "PK",
  "Asia/Manila": "PH",
  "Asia/Ho_Chi_Minh": "VN", "Asia/Saigon": "VN",
  "Asia/Yangon": "MM",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Tashkent": "UZ",
  "Asia/Almaty": "KZ",
  "Asia/Tehran": "IR",
  "Asia/Riyadh": "SA",
  "Asia/Baghdad": "IQ",
  "Asia/Beirut": "LB",
  "Asia/Jerusalem": "IL",
  "Asia/Yekaterinburg": "RU",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Phoenix": "US", "America/Anchorage": "US",
  "America/Honolulu": "US", "America/Detroit": "US", "America/Indiana/Indianapolis": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Winnipeg": "CA",
  "America/Halifax": "CA", "America/St_Johns": "CA",
  "America/Sao_Paulo": "BR", "America/Manaus": "BR", "America/Belem": "BR",
  "America/Mexico_City": "MX", "America/Monterrey": "MX",
  "America/Buenos_Aires": "AR", "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Bogota": "CO",
  "America/Lima": "PE",
  "America/Caracas": "VE",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Amsterdam": "NL",
  "Europe/Stockholm": "SE",
  "Europe/Helsinki": "FI",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Zurich": "CH",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Warsaw": "PL",
  "Europe/Kyiv": "UA",
  "Europe/Moscow": "RU", "Europe/Samara": "RU",
  "Europe/Istanbul": "TR",
  "Europe/Lisbon": "PT",
  "Europe/Brussels": "BE",
  "Europe/Vienna": "AT",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Bucharest": "RO",
  "Europe/Athens": "GR",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU", "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ",
  "Pacific/Honolulu": "US",
  "Africa/Cairo": "EG",
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Accra": "GH",
};

function deriveTzRegion(timezone: string): string {
  const slash = timezone.indexOf("/");
  if (slash < 0) return "Unknown";
  const continent = timezone.slice(0, slash);
  const MAP: Record<string, string> = {
    Asia:       "Asia",
    America:    "Americas",
    Europe:     "Europe",
    Australia:  "Oceania",
    Pacific:    "Oceania",
    Africa:     "Africa",
    Atlantic:   "Atlantic",
    Indian:     "Indian Ocean",
    Arctic:     "Arctic",
    Antarctica: "Antarctica",
  };
  return MAP[continent] ?? "Unknown";
}

function deriveGeo(timezone?: string | null): { country: string; region: string } {
  if (!timezone) return { country: "Unknown", region: "Unknown" };
  return {
    country: TZ_COUNTRY[timezone] ?? "Unknown",
    region:  deriveTzRegion(timezone),
  };
}

// ── Route constants ────────────────────────────────────────────────────────

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
  const body       = req.body as { voter_email?: string; locale?: string; timezone?: string };
  const voterEmail = body.voter_email?.trim().toLowerCase() || null;
  const locale     = body.locale?.slice(0, 20) || null;
  const timezone   = body.timezone?.slice(0, 60) || null;
  const { id }     = req.params;

  if (!userId && !voterEmail) {
    res.status(401).json({ error: "login or provide email to vote" });
    return;
  }

  const { country, region } = deriveGeo(timezone);

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
          ? { feedbackPostId: id, userId, country, region, locale, timezone }
          : { feedbackPostId: id, userId: null, voterEmail: voterEmail!, country, region, locale, timezone },
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

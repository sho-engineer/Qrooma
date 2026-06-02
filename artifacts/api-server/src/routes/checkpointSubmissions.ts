import { Router } from "express";
import { db, checkpointSubmissionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

async function requireAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const rows = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId));
  return rows[0]?.role === "admin";
}

// POST /api/checkpoint-submissions — public, no auth required
router.post("/checkpoint-submissions", async (req, res) => {
  const body = req.body as {
    name_or_handle?:          string;
    email?:                   string;
    what_are_you_building?:   string;
    decision_to_make?:        string;
    options_considered?:      string;
    what_happens_if_wrong?:   string;
    messy_notes?:             string;
    website_url?:             string;
    already_tried?:           string;
    source?:                  string;
    where_did_you_find?:      string;
    preferred_contact_method?: string;
    consent_accepted?:        boolean;
    honeypot?:                string;
  };

  if (body.honeypot?.trim()) {
    res.json({ status: "ok" });
    return;
  }

  const {
    name_or_handle, email, what_are_you_building,
    decision_to_make, options_considered,
    what_happens_if_wrong, messy_notes, consent_accepted,
  } = body;

  if (
    !name_or_handle?.trim() ||
    !email?.trim() ||
    !what_are_you_building?.trim() ||
    !decision_to_make?.trim() ||
    !options_considered?.trim() ||
    !what_happens_if_wrong?.trim() ||
    !messy_notes?.trim()
  ) {
    res.status(400).json({ error: "Required fields missing" });
    return;
  }

  if (!consent_accepted) {
    res.status(400).json({ error: "Consent required" });
    return;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.trim())) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  try {
    const rows = await db.insert(checkpointSubmissionsTable).values({
      nameOrHandle:           name_or_handle.trim(),
      email:                  email.trim().toLowerCase(),
      whatAreYouBuilding:     what_are_you_building.trim(),
      decisionToMake:         decision_to_make.trim(),
      optionsConsidered:      options_considered.trim(),
      whatHappensIfWrong:     what_happens_if_wrong.trim(),
      messyNotes:             messy_notes.trim(),
      websiteUrl:             body.website_url?.trim()             || null,
      alreadyTried:           body.already_tried?.trim()           || null,
      source:                 body.source?.trim()                  || null,
      whereDidYouFind:        body.where_did_you_find?.trim()      || null,
      preferredContactMethod: body.preferred_contact_method?.trim() || null,
      consentAccepted:        true,
    }).returning({ id: checkpointSubmissionsTable.id });

    res.json({ status: "ok", id: rows[0]?.id });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/admin/checkpoint-submissions — admin only
router.get("/admin/checkpoint-submissions", async (req, res) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!await requireAdmin(userId)) { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    const submissions = await db
      .select()
      .from(checkpointSubmissionsTable)
      .orderBy(desc(checkpointSubmissionsTable.createdAt));
    res.json(submissions);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// PATCH /api/admin/checkpoint-submissions/:id — admin only
router.patch("/admin/checkpoint-submissions/:id", async (req, res) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!await requireAdmin(userId)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { id } = req.params;
  const body = req.body as Partial<{
    status:            string;
    paymentStatus:     string;
    adminNotes:        string;
    goodFit:           boolean;
    paymentLinkSentAt: string | null;
    deliveredAt:       string | null;
    secondUse:         boolean;
  }>;
  const { paymentLinkSentAt, deliveredAt, ...rest } = body;
  const patch: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
    ...(paymentLinkSentAt !== undefined ? { paymentLinkSentAt: paymentLinkSentAt ? new Date(paymentLinkSentAt) : null } : {}),
    ...(deliveredAt        !== undefined ? { deliveredAt:        deliveredAt        ? new Date(deliveredAt)        : null } : {}),
  };
  try {
    const updated = await db
      .update(checkpointSubmissionsTable)
      .set(patch)
      .where(eq(checkpointSubmissionsTable.id, id))
      .returning();
    res.json(updated[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

import { Router } from "express";
import { db, waitlistEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/waitlist — join waitlist
router.post("/waitlist", async (req, res) => {
  const { email, name, role, use_case, source } = req.body as {
    email:    string;
    name?:    string;
    role?:    string;
    use_case?: string;
    source?:  string;
  };

  if (!email?.trim()) {
    res.status(400).json({ error: "email required" });
    return;
  }

  const emailLower = email.trim().toLowerCase();

  try {
    const existing = await db
      .select({ id: waitlistEntriesTable.id })
      .from(waitlistEntriesTable)
      .where(eq(waitlistEntriesTable.email, emailLower));

    if (existing.length > 0) {
      res.json({ status: "already_joined" });
      return;
    }

    await db.insert(waitlistEntriesTable).values({
      email:   emailLower,
      name:    name?.trim() || null,
      role:    role?.trim() || null,
      useCase: use_case?.trim() || null,
      source:  source?.trim() || "waitlist",
    });

    res.json({ status: "joined" });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

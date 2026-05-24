import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Emails that always receive the admin role.
 * Set ADMIN_EMAILS env var (comma-separated) to configure.
 * Example: ADMIN_EMAILS=alice@example.com,bob@example.com
 */
const ADMIN_EMAILS: Set<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

router.post("/users/upsert", async (req, res) => {
  const { id, email, name } = req.body as { id: string; email: string; name: string };
  if (!id || !email || !name) {
    res.status(400).json({ error: "id, email, name required" });
    return;
  }
  try {
    const existing = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (existing.length === 0) {
      const role = isAdminEmail(email) ? ("admin" as const) : ("user" as const);
      await db.insert(usersTable).values({ id, email, name, role });
      res.json({ role });
    } else {
      const currentRole = existing[0].role;
      const newRole = isAdminEmail(email) ? ("admin" as const) : currentRole;
      await db
        .update(usersTable)
        .set({ lastActiveAt: new Date(), email, name, role: newRole })
        .where(eq(usersTable.id, id));
      res.json({ role: newRole });
    }
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

router.get("/users/me", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

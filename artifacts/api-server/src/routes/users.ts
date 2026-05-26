import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const ADMIN_EMAILS: Set<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

const TESTER_EMAILS: Set<string> = new Set(
  (process.env.TESTER_EMAILS ?? "dev@adjudo.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

function resolvedRole(email: string): "user" | "tester" | "admin" {
  const e = email.trim().toLowerCase();
  if (ADMIN_EMAILS.has(e))  return "admin";
  if (TESTER_EMAILS.has(e)) return "tester";
  return "user";
}

router.post("/users/upsert", async (req, res) => {
  const { id, email, name } = req.body as { id: string; email: string; name: string };
  if (!id || !email || !name) {
    res.status(400).json({ error: "id, email, name required" });
    return;
  }
  try {
    const existing = await db
      .select({ role: usersTable.role, status: usersTable.status })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (existing.length === 0) {
      const role = resolvedRole(email);

      // Check for a seed/migrated record with the same email but different UID
      const byEmail = await db
        .select({ id: usersTable.id, role: usersTable.role, status: usersTable.status })
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (byEmail.length > 0) {
        const migratedRole   = resolvedRole(email) !== "user" ? resolvedRole(email) : byEmail[0].role;
        const migratedStatus = byEmail[0].status ?? "active";
        await db.execute(
          sql`UPDATE users SET id = ${id}, name = ${name}, last_active_at = NOW(), role = ${migratedRole}::user_role WHERE email = ${email}`
        );
        res.json({ role: migratedRole, status: migratedStatus });
      } else {
        await db.insert(usersTable).values({ id, email, name, role });
        res.json({ role, status: "active" });
      }
    } else {
      const currentRole   = existing[0].role;
      const currentStatus = existing[0].status ?? "active";
      const forcedRole    = resolvedRole(email);
      const newRole       = forcedRole !== "user" ? forcedRole : currentRole;
      await db
        .update(usersTable)
        .set({ lastActiveAt: new Date(), email, name, role: newRole })
        .where(eq(usersTable.id, id));
      res.json({ role: newRole, status: currentStatus });
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

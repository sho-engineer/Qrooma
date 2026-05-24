import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/users/upsert", async (req, res) => {
  const { id, email, name } = req.body as { id: string; email: string; name: string };
  if (!id || !email || !name) { res.status(400).json({ error: "id, email, name required" }); return; }
  try {
    const existing = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id));
    if (existing.length === 0) {
      const totalUsers = await db.select({ id: usersTable.id }).from(usersTable);
      const role = totalUsers.length === 0 ? "admin" as const : "user" as const;
      await db.insert(usersTable).values({ id, email, name, role });
      res.json({ role });
    } else {
      await db.update(usersTable).set({ lastActiveAt: new Date(), email, name }).where(eq(usersTable.id, id));
      res.json({ role: existing[0].role });
    }
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

router.get("/users/me", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

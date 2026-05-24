import { Router } from "express";
import { db, analyticsEventsTable } from "@workspace/db";

const router = Router();

router.post("/analytics/event", async (req, res) => {
  const { userId, eventName, path, metadata } = req.body as {
    userId?: string; eventName: string; path?: string; metadata?: Record<string, unknown>;
  };
  if (!eventName) { res.status(400).json({ error: "eventName required" }); return; }
  try {
    await db.insert(analyticsEventsTable).values({ userId: userId ?? null, eventName, path: path ?? null, metadata: metadata ?? null });
    res.json({ ok: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "db error" });
  }
});

export default router;

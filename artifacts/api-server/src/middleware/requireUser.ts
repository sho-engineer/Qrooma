import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Middleware that requires a valid authenticated user.
 * Reads the Firebase UID from the `x-user-id` header and verifies
 * it exists in our database. Returns 401 if missing or unknown.
 */
export async function requireUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId?.trim()) {
    res.status(401).json({ error: "Unauthorized: missing x-user-id header" });
    return;
  }

  try {
    const rows = await db
      .select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!rows[0]) {
      res.status(401).json({ error: "Unauthorized: unknown user" });
      return;
    }

    next();
  } catch {
    res.status(500).json({ error: "Auth check failed" });
  }
}

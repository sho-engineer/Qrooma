import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyFirebaseToken } from "../lib/verifyToken";

/**
 * Middleware that requires a real, server-verified Firebase ID token.
 *
 * Reads `Authorization: Bearer <firebase-id-token>` from the request,
 * verifies it using Firebase's public JWKS (cryptographic verification —
 * not header trust), derives the UID server-side, and confirms the user
 * exists in our database.
 *
 * On success the verified UID is attached to `req.headers["x-verified-uid"]`
 * for downstream handlers.
 *
 * Returns 401 on any auth failure, 500 on unexpected DB errors.
 */
export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Unauthorized: missing Bearer token" });
    return;
  }

  let uid: string;
  try {
    uid = await verifyFirebaseToken(token);
  } catch {
    res.status(401).json({ error: "Unauthorized: invalid or expired token" });
    return;
  }

  try {
    const rows = await db
      .select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, uid))
      .limit(1);

    if (!rows[0]) {
      res.status(401).json({ error: "Unauthorized: user not registered" });
      return;
    }

    req.headers["x-verified-uid"] = uid;
    next();
  } catch {
    res.status(500).json({ error: "Auth check failed" });
  }
}

import { Router } from "express";

const router = Router();

/**
 * Parse EARLY_ACCESS_CODES env var.
 * Format (comma-separated): CODE:accessType:days
 * Example: ADJUDO-2W-BETA-7KQ9:early_access:14,TESTER2026:tester:365
 */
function parseCodes(): Map<string, { accessType: string; days: number }> {
  const raw   = process.env.EARLY_ACCESS_CODES ?? "";
  const map   = new Map<string, { accessType: string; days: number }>();

  for (const entry of raw.split(",")) {
    const parts      = entry.trim().split(":");
    if (!parts[0]) continue;
    const code       = parts[0].toUpperCase();
    const accessType = parts[1] ?? "early_access";
    const days       = parseInt(parts[2] ?? "14", 10);
    map.set(code, { accessType, days });
  }
  return map;
}

/**
 * POST /api/early-access/validate
 * Body: { code: string }
 * Returns: { valid: boolean, accessType?: string, days?: number }
 */
router.post("/early-access/validate", (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code || typeof code !== "string") {
    res.status(400).json({ valid: false });
    return;
  }

  const codes  = parseCodes();
  const entry  = codes.get(code.trim().toUpperCase());

  if (entry) {
    res.json({ valid: true, accessType: entry.accessType, days: entry.days });
  } else {
    res.json({ valid: false });
  }
});

export default router;

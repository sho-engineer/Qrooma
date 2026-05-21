import { Router } from "express";

export type AccessType = "tester" | "early_access" | "special";

interface InviteCodeDef {
  accessType: AccessType;
  isUnlimitedUser: boolean;
  dailyRunLimit: number | null;
  monthlyRunLimit: number | null;
}

const BUILT_IN_CODES: Record<string, InviteCodeDef> = {
  QRTESTER: {
    accessType: "tester",
    isUnlimitedUser: true,
    dailyRunLimit: null,
    monthlyRunLimit: null,
  },
  EARLYBIRD: {
    accessType: "early_access",
    isUnlimitedUser: true,
    dailyRunLimit: null,
    monthlyRunLimit: null,
  },
  QRSPECIAL: {
    accessType: "special",
    isUnlimitedUser: true,
    dailyRunLimit: null,
    monthlyRunLimit: null,
  },
};

function loadEnvCodes(): Record<string, InviteCodeDef> {
  const raw = process.env["INVITE_CODES"];
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, InviteCodeDef>;
  } catch {
    return {};
  }
}

const router = Router();

router.post("/invite-code/apply", (req, res) => {
  const body = req.body as { code?: unknown };
  if (!body.code || typeof body.code !== "string") {
    res.status(400).json({ valid: false, reason: "invalid_request" });
    return;
  }

  const normalized = body.code.trim().toUpperCase();
  const allCodes = { ...BUILT_IN_CODES, ...loadEnvCodes() };
  const match = allCodes[normalized];

  if (!match) {
    res.status(200).json({ valid: false, reason: "not_found" });
    return;
  }

  res.status(200).json({
    valid: true,
    accessType: match.accessType,
    isUnlimitedUser: match.isUnlimitedUser,
    dailyRunLimit: match.dailyRunLimit,
    monthlyRunLimit: match.monthlyRunLimit,
  });
});

export default router;

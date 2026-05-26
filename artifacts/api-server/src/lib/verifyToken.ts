/**
 * Verify a Firebase ID token using Firebase's public JWKS endpoint.
 * This approach does not require firebase-admin or a service-account key —
 * Firebase publishes its signing certificates publicly.
 *
 * Returns the verified Firebase UID (payload.sub) on success.
 * Throws on any verification failure (expired, wrong audience, bad sig, etc.)
 */

import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env["VITE_FIREBASE_PROJECT_ID"];

if (!PROJECT_ID) {
  throw new Error(
    "VITE_FIREBASE_PROJECT_ID env var is required for token verification"
  );
}

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export async function verifyFirebaseToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer:   `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  if (!payload.sub) throw new Error("Token missing sub claim");
  return payload.sub;
}

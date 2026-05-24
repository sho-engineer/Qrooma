/**
 * Firebase App / Auth / Firestore initialization
 *
 * Required secrets (Replit Secrets):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string | undefined,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string | undefined,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string | undefined,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string | undefined,
};

export const IS_CONFIGURED = !!(cfg.apiKey && cfg.authDomain && cfg.projectId);

let app:  FirebaseApp | null = null;
let auth: Auth        | null = null;
let db:   Firestore   | null = null;

if (IS_CONFIGURED) {
  app  = initializeApp(cfg as Required<typeof cfg>);
  auth = getAuth(app);
  db   = getFirestore(app);
  console.info("[Adjudo] Firebase connected:", cfg.projectId);
} else {
  console.warn("[Adjudo] Firebase env vars missing — auth unavailable.");
}

export { app, auth, db };

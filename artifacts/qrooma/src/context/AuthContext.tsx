/**
 * Auth Context — Firebase Authentication (Google OAuth)
 *
 * Swap signInWithGoogle for real Firebase signInWithPopup.
 * After sign-in, syncs user profile to the Express API / PostgreSQL.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getEarlyAccess, clearEarlyAccess } from "../services/earlyAccess";

const ADMIN_EMAILS = new Set(["shoengineer5@gmail.com"]);

export interface User {
  id:    string;
  email: string;
  name:  string;
  role:  "user" | "admin";
}

interface AuthContextValue {
  user:             User | null;
  isLoading:        boolean;
  isAdmin:          boolean;
  signInWithGoogle: () => Promise<void>;
  signOut:          () => Promise<void>;
  /** @deprecated kept for callers that still reference these — noops */
  signIn:           (email: string, password: string) => Promise<void>;
  signUp:           (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext   = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

async function upsertUserInDb(u: { id: string; email: string; name: string }): Promise<"user" | "admin"> {
  try {
    const res = await fetch("/api/users/upsert", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-user-id": u.id },
      body:    JSON.stringify(u),
    });
    if (!res.ok) return isAdminEmail(u.email) ? "admin" : "user";
    const data = await res.json() as { role: "user" | "admin" };
    return data.role ?? "user";
  } catch {
    return isAdminEmail(u.email) ? "admin" : "user";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setLoad]  = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoad(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const email = fbUser.email ?? "";
        const name  = fbUser.displayName ?? email.split("@")[0];
        const role  = await upsertUserInDb({ id: fbUser.uid, email, name });
        setUser({ id: fbUser.uid, email, name, role });
      } else {
        setUser(null);
      }
      setLoad(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle(): Promise<void> {
    if (!auth) throw new Error("Firebase not configured");
    await signInWithPopup(auth, googleProvider);
  }

  async function signOut(): Promise<void> {
    if (auth) await fbSignOut(auth);
    clearEarlyAccess();
    setUser(null);
  }

  const signIn  = async (_e: string, _p: string) => { /* noop */ };
  const signUp  = async (_e: string, _p: string, _n: string) => { /* noop */ };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === "admin",
      signInWithGoogle,
      signOut,
      signIn,
      signUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

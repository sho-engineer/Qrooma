/**
 * Auth Context — Supabase Auth (Google OAuth + email/password)
 *
 * Production connection points:
 *   signInWithGoogle  → supabase.auth.signInWithOAuth({ provider: 'google' })
 *   signIn            → supabase.auth.signInWithPassword()
 *   signUp            → supabase.auth.signUp()
 *   signOut           → supabase.auth.signOut()
 *   onAuthStateChange → supabase.auth.onAuthStateChange()
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../services/client";

export interface User {
  id:    string;
  email: string;
  name:  string;
  role:  "user" | "admin";
}

interface AuthContextValue {
  user:            User | null;
  isLoading:       boolean;
  isAdmin:         boolean;
  signInWithGoogle: () => Promise<void>;
  signIn:          (email: string, password: string) => Promise<void>;
  signUp:          (email: string, password: string, name: string) => Promise<void>;
  signOut:         () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function upsertUserInDb(u: { id: string; email: string; name: string }): Promise<"user" | "admin"> {
  try {
    const res = await fetch("/api/users/upsert", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-user-id": u.id },
      body:    JSON.stringify(u),
    });
    if (!res.ok) return "user";
    const data = await res.json() as { role: "user" | "admin" };
    return data.role ?? "user";
  } catch {
    return "user";
  }
}

function extractName(meta: Record<string, unknown> | undefined, email: string): string {
  const full = meta?.full_name ?? meta?.name;
  return typeof full === "string" && full.trim() ? full.trim() : email.split("@")[0];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const sb   = session.user;
        const email = sb.email ?? "";
        const name  = extractName(sb.user_metadata, email);
        const role  = await upsertUserInDb({ id: sb.id, email, name });
        setUser({ id: sb.id, email, name, role });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const sb   = session.user;
        const email = sb.email ?? "";
        const name  = extractName(sb.user_metadata, email);
        const role  = await upsertUserInDb({ id: sb.id, email, name });
        setUser({ id: sb.id, email, name, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle(): Promise<void> {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async function signIn(email: string, password: string): Promise<void> {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, _name: string): Promise<void> {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signOut(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === "admin",
      signInWithGoogle,
      signIn,
      signUp,
      signOut,
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

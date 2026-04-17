/**
 * Auth Context
 *
 * SUPABASE AUTH CONNECTION POINT
 * ──────────────────────────────
 * Install: pnpm add @supabase/supabase-js
 * Then replace this entire file with:
 *
 *   import { supabase } from "../services/client"
 *
 *   export function AuthProvider({ children }) {
 *     const [user, setUser] = useState(null)
 *     const [isLoading, setIsLoading] = useState(true)
 *
 *     useEffect(() => {
 *       supabase.auth.getSession().then(({ data: { session } }) => {
 *         setUser(session?.user ?? null)
 *         setIsLoading(false)
 *       })
 *       const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
 *         setUser(session?.user ?? null)
 *       })
 *       return () => subscription.unsubscribe()
 *     }, [])
 *
 *     const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password })
 *     const signUp  = (email, password) => supabase.auth.signUp({ email, password })
 *     const signOut = () => supabase.auth.signOut()
 *
 *     return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
 *       {children}
 *     </AuthContext.Provider>
 *   }
 *
 * The `User` type should align with Supabase's `auth.users`:
 *   id:    uuid
 *   email: text
 *   name:  text  (stored in user_metadata.name)
 *
 * Current mode: localStorage mock (no real auth)
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  id:    string;
  email: string;
  name:  string;
}

interface AuthContextValue {
  user:      User | null;
  isLoading: boolean;
  signIn:    (email: string, password: string) => Promise<void>;
  signUp:    (email: string, password: string, name: string) => Promise<void>;
  signOut:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "qrooma_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // SUPABASE: replace with supabase.auth.getSession()
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem(STORAGE_KEY); }
    }
    setIsLoading(false);
  }, []);

  // SUPABASE: supabase.auth.signInWithPassword({ email, password })
  async function signIn(email: string, _password: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 600));
    const u: User = { id: "user-1", email, name: email.split("@")[0] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  // SUPABASE: supabase.auth.signUp({ email, password, options: { data: { name } } })
  async function signUp(email: string, _password: string, name: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 600));
    const u: User = { id: "user-1", email, name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  // SUPABASE: supabase.auth.signOut()
  function signOut(): void {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

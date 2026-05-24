/**
 * Auth Context (localStorage mock — swap signIn/signUp for Supabase Auth)
 *
 * Updated: stable UUIDs per email, role fetched from API on sign-in.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  id:    string;
  email: string;
  name:  string;
  role:  "user" | "admin";
}

interface AuthContextValue {
  user:      User | null;
  isLoading: boolean;
  isAdmin:   boolean;
  signIn:    (email: string, password: string) => Promise<void>;
  signUp:    (email: string, password: string, name: string) => Promise<void>;
  signOut:   () => void;
}

const AuthContext  = createContext<AuthContextValue | null>(null);
const STORAGE_KEY  = "qrooma_user";
const UUID_MAP_KEY = "qrooma_uuid_map";

function getOrCreateUuid(email: string): string {
  const raw  = localStorage.getItem(UUID_MAP_KEY);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};
  if (!map[email]) {
    map[email] = crypto.randomUUID();
    localStorage.setItem(UUID_MAP_KEY, JSON.stringify(map));
  }
  return map[email];
}

async function upsertUserInDb(u: { id: string; email: string; name: string }): Promise<"user" | "admin"> {
  try {
    const res  = await fetch("/api/users/upsert", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(u),
    });
    if (!res.ok) return "user";
    const data = await res.json() as { role: "user" | "admin" };
    return data.role ?? "user";
  } catch {
    return "user";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const u = JSON.parse(stored) as User;
        setUser(u);
        upsertUserInDb(u).then((role) => {
          if (role !== u.role) {
            const updated = { ...u, role };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setUser(updated);
          }
        });
      } catch { localStorage.removeItem(STORAGE_KEY); }
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, _password: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 500));
    const id   = getOrCreateUuid(email);
    const name = email.split("@")[0];
    const role = await upsertUserInDb({ id, email, name });
    const u: User = { id, email, name, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  async function signUp(email: string, _password: string, name: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 500));
    const id   = getOrCreateUuid(email);
    const role = await upsertUserInDb({ id, email, name });
    const u: User = { id, email, name, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  function signOut(): void {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin: user?.role === "admin", signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

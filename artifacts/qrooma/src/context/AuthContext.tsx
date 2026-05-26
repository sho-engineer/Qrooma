import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  signInWithEmailAndPassword as fbSignInEmail,
  createUserWithEmailAndPassword as fbCreateUser,
  sendPasswordResetEmail as fbSendReset,
  updateProfile,
  GoogleAuthProvider,
  type FirebaseError,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { clearEarlyAccess } from "../services/earlyAccess";

const ADMIN_EMAILS  = new Set(["admin@adjudo.com"]);
const TESTER_EMAILS = new Set(["dev@adjudo.com"]);

export type UserRole   = "user" | "tester" | "admin";
export type UserStatus = "active" | "waitlist" | "blocked" | "deleted";

export interface User {
  id:     string;
  email:  string;
  name:   string;
  role:   UserRole;
  status: UserStatus;
}

interface AuthContextValue {
  user:                User | null;
  isLoading:           boolean;
  isAdmin:             boolean;
  signInWithGoogle:    () => Promise<void>;
  signInWithEmail:     (email: string, password: string) => Promise<void>;
  signUp:              (email: string, password: string, name: string) => Promise<void>;
  sendPasswordReset:   (email: string) => Promise<void>;
  signOut:             () => Promise<void>;
  /** @deprecated kept for legacy callers */
  signIn:              (email: string, password: string) => Promise<void>;
}

const AuthContext    = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function isTesterEmail(email: string): boolean {
  return TESTER_EMAILS.has(email.trim().toLowerCase());
}

async function upsertUserInDb(u: { id: string; email: string; name: string }): Promise<{ role: UserRole; status: UserStatus }> {
  try {
    const res = await fetch("/api/users/upsert", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-user-id": u.id },
      body:    JSON.stringify(u),
    });
    if (!res.ok) {
      const role: UserRole   = isAdminEmail(u.email) ? "admin" : isTesterEmail(u.email) ? "tester" : "user";
      return { role, status: "active" };
    }
    const data = await res.json() as { role?: UserRole; status?: UserStatus };
    return {
      role:   data.role   ?? (isAdminEmail(u.email) ? "admin" : isTesterEmail(u.email) ? "tester" : "user"),
      status: data.status ?? "active",
    };
  } catch {
    const role: UserRole = isAdminEmail(u.email) ? "admin" : isTesterEmail(u.email) ? "tester" : "user";
    return { role, status: "active" };
  }
}

export function mapFirebaseError(err: unknown): string {
  const code = (err as FirebaseError)?.code ?? "";
  console.error("[Adjudo] Firebase auth error code:", code, err);
  if (code === "auth/unauthorized-domain")
    return "このドメインはGoogleログインに許可されていません。管理者に設定確認を依頼してください。";
  if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user")
    return "ポップアップがブロックされました。ブラウザ設定を確認するか、もう一度お試しください。";
  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
    return "メールアドレスまたはパスワードが正しくありません。";
  if (code === "auth/email-already-in-use")
    return "このメールアドレスはすでに登録されています。";
  if (code === "auth/weak-password")
    return "パスワードは6文字以上で入力してください。";
  if (code === "auth/invalid-email")
    return "メールアドレスの形式が正しくありません。";
  if (code === "auth/too-many-requests")
    return "試行回数が多すぎます。時間を置いてもう一度お試しください。";
  if (code === "auth/operation-not-allowed")
    return "メール認証が無効です。Firebase ConsoleでEmail/Passwordログインを有効にしてください。";
  if (code === "auth/network-request-failed")
    return "ネットワークエラーです。接続を確認して再度お試しください。";
  return "ログインに失敗しました。時間を置いてもう一度お試しください。";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]      = useState<User | null>(null);
  const [isLoading, setLoad] = useState(true);

  useEffect(() => {
    if (!auth) { setLoad(false); return; }

    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const fbUser = result.user;
        const email  = fbUser.email ?? "";
        const name   = fbUser.displayName ?? email.split("@")[0];
        const { role, status } = await upsertUserInDb({ id: fbUser.uid, email, name });
        setUser({ id: fbUser.uid, email, name, role, status });
      }
    }).catch((err) => {
      console.error("[Adjudo] getRedirectResult error:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const email = fbUser.email ?? "";
        const name  = fbUser.displayName ?? email.split("@")[0];
        const { role, status } = await upsertUserInDb({ id: fbUser.uid, email, name });
        setUser({ id: fbUser.uid, email, name, role, status });
      } else {
        setUser(null);
      }
      setLoad(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle(): Promise<void> {
    if (!auth) throw new Error("Firebase not configured");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as FirebaseError)?.code ?? "";
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw err;
    }
  }

  async function signInWithEmail(email: string, password: string): Promise<void> {
    if (!auth) throw new Error("Firebase not configured");
    await fbSignInEmail(auth, email.trim(), password);
  }

  async function signUp(email: string, password: string, name: string): Promise<void> {
    if (!auth) throw new Error("Firebase not configured");
    const cred = await fbCreateUser(auth, email.trim(), password);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
  }

  async function sendPasswordReset(email: string): Promise<void> {
    if (!auth) throw new Error("Firebase not configured");
    await fbSendReset(auth, email.trim());
  }

  async function signOut(): Promise<void> {
    if (auth) await fbSignOut(auth);
    clearEarlyAccess();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === "admin",
      signInWithGoogle,
      signInWithEmail,
      signUp,
      sendPasswordReset,
      signOut,
      signIn: signInWithEmail,
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

/**
 * Admin-only login bypass — no coupon required.
 *
 * Security model:
 *  1. Firebase auth is completed entirely client-side (Google OAuth or email/password).
 *  2. After Firebase auth resolves, the client gets a short-lived ID token (RS256 JWT).
 *  3. The token is sent to POST /api/admin/verify which:
 *       a. Verifies the JWT cryptographically using Firebase's public JWKS.
 *       b. Derives the UID server-side (never trusts caller-supplied UID).
 *       c. Looks up the UID in the DB and confirms role="admin".
 *  4. Only on HTTP 200 does the frontend navigate to /rooms.
 *  5. On 401/403 the Firebase session is immediately signed out.
 *
 * This page is intentionally NOT wrapped in LoginGuard or AuthGuard so that
 * admins can reach it without a coupon in localStorage.
 */

import { useState, useEffect } from "react";
import { useLocation }         from "wouter";
import { ShieldIcon }          from "lucide-react";
import { GoogleIcon }          from "../components/GoogleIcon";
import { useAuth, mapFirebaseError } from "../context/AuthContext";
import { auth as firebaseAuth, IS_CONFIGURED } from "../lib/firebase";

type Phase = "idle" | "signing-in" | "verifying" | "done" | "error";

export default function AdminLoginPage() {
  const [, navigate]   = useLocation();
  const { user, isLoading, signInWithGoogle, signInWithEmail, signOut } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [phase,    setPhase]    = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // After Firebase auth + upsert complete, run the server-side admin check.
  useEffect(() => {
    if (isLoading || phase === "done") return;

    if (user) {
      // Already confirmed admin from a previous session — go straight in.
      if (phase === "idle" && user.role === "admin") {
        setPhase("done");
        navigate("/rooms");
        return;
      }

      // If the phase is "signing-in", the user just authenticated — verify with server.
      if (phase === "signing-in") {
        void verifyAdmin();
      }

      // If non-admin ends up here (e.g. navigated manually while logged in as user)
      if (phase === "idle" && user.role !== "admin") {
        setPhase("error");
        setErrorMsg("このアカウントには管理者権限がありません。");
        void signOut();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  async function verifyAdmin() {
    setPhase("verifying");
    try {
      const token = await firebaseAuth?.currentUser?.getIdToken();
      if (!token) throw new Error("No token");

      const res = await fetch("/api/admin/verify", {
        method:  "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        setPhase("done");
        navigate("/rooms");
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string };
        await signOut();
        setPhase("error");
        setErrorMsg(
          res.status === 403
            ? "このアカウントには管理者権限がありません。"
            : (data.error ?? "認証に失敗しました。"),
        );
      }
    } catch {
      await signOut();
      setPhase("error");
      setErrorMsg("サーバーへの接続に失敗しました。");
    }
  }

  async function handleGoogle() {
    setErrorMsg("");
    setPhase("signing-in");
    try {
      await signInWithGoogle();
      // verifyAdmin() is called by the useEffect when `user` is set.
    } catch (err) {
      setPhase("error");
      setErrorMsg(mapFirebaseError(err));
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setPhase("signing-in");
    try {
      await signInWithEmail(email, password);
      // verifyAdmin() is called by the useEffect when `user` is set.
    } catch (err) {
      setPhase("error");
      setErrorMsg(mapFirebaseError(err));
    }
  }

  const isBusy = phase === "signing-in" || phase === "verifying" || isLoading;

  if (!IS_CONFIGURED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Firebase が設定されていません。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-1">
            <ShieldIcon size={18} className="text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">管理者ログイン</h1>
          <p className="text-sm text-muted-foreground">
            管理者アカウントでサインインしてください
          </p>
        </div>

        {/* Error */}
        {phase === "error" && errorMsg && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Verifying indicator */}
        {phase === "verifying" && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span>管理者権限を確認中...</span>
          </div>
        )}

        {/* Login form — hide while verifying or done */}
        {phase !== "verifying" && phase !== "done" && (
          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={() => { void handleGoogle(); }}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent text-sm font-medium text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy && phase === "signing-in"
                ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                : <GoogleIcon size={16} />
              }
              Google でサインイン
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">または</span>
              </div>
            </div>

            {/* Email / password */}
            <form onSubmit={(e) => { void handleEmailSignIn(e); }} className="space-y-3">
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isBusy}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isBusy}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isBusy}
                className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBusy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    確認中...
                  </span>
                ) : "サインイン"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

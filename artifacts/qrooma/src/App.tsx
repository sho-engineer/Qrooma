import { useState, useEffect, useCallback } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, Link, useLocation } from "wouter";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import { AuthProvider, useAuth, isTesterEmail } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { RoomsProvider } from "./context/RoomsContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { LocaleProvider } from "./context/LocaleContext";
import { PlanProvider } from "./context/PlanContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import LandingPage from "./pages/LandingPage";
import LandingJpPage from "./pages/LandingJpPage";
import AuthPage from "./pages/AuthPage";
import EarlyAccessPage from "./pages/EarlyAccessPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import SampleDecisionCheckpointPage from "./pages/SampleDecisionCheckpointPage";
import SubmitDecisionPage           from "./pages/SubmitDecisionPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import SettingsPage from "./pages/SettingsPage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminPage from "./pages/AdminPage";
import WaitlistPage from "./pages/WaitlistPage";
import NotFoundPage from "./pages/NotFoundPage";
import Sidebar from "./components/Sidebar";
import { isEarlyAccessValid } from "./services/earlyAccess";

const queryClient = new QueryClient();

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Protects app routes.
 * - Not logged in → /login (if early access valid) or /early-access
 * - Logged in but early access expired (non-admin) → /early-access?expired=true
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const [, navigate] = useLocation();

  const handleTimeout = useCallback(async () => {
    await signOut();
    navigate("/login?reason=inactivity");
  }, [signOut, navigate]);

  const { warningSecondsLeft } = useIdleTimeout(handleTimeout, !!user && !isLoading);

  if (isLoading) return <Spinner />;

  if (!user) {
    return <Redirect to={isEarlyAccessValid() ? "/login" : "/early-access"} />;
  }

  if (user.status === "blocked" || user.status === "deleted") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8 max-w-sm">
          <p className="text-lg font-semibold text-foreground">
            {user.status === "blocked" ? "アカウントがブロックされています" : "アカウントが削除されています"}
          </p>
          <p className="text-sm text-muted-foreground">ご不明な点は hello@adjudo.com までお問い合わせください。</p>
          <button
            onClick={() => { void signOut(); }}
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-80 transition-opacity"
          >
            サインアウト
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && !isTesterEmail(user.email) && !isEarlyAccessValid()) {
    return <Redirect to="/early-access?expired=true" />;
  }

  return (
    <>
      {warningSecondsLeft !== null && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-white text-[13px] text-center py-2 px-4 shadow-md">
          非アクティブのため{warningSecondsLeft}秒後に自動ログアウトします。操作を続けるにはクリックまたはキー入力してください。
        </div>
      )}
      {children}
    </>
  );
}

/**
 * Protects /login.
 * - Already logged in → /rooms
 * - No valid early access → /early-access (coupon gate)
 */
function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (user) return <Redirect to="/rooms" />;
  if (!isEarlyAccessValid()) return <Redirect to="/early-access" />;

  return <>{children}</>;
}

// ─── App Shell ───────────────────────────────────────────────────────────────

function AppShell() {
  const [isMobile, setIsMobile]       = useState(() => window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeSidebar() {
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onToggle={() => setSidebarOpen((o) => !o)}
        onClose={closeSidebar}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden shrink-0 flex items-center gap-3 px-4 h-12 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 -ml-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <MenuIcon size={20} />
          </button>
          <Link href="/projects">
            <img src="/brand/adjudo-wordmark.png" alt="Adjudo" className="h-5 w-auto dark:invert hover:opacity-70 transition-opacity cursor-pointer" />
          </Link>
        </div>

        <Switch>
          <Route path="/projects"             component={RoomsPage} />
          <Route path="/projects/:projectId"  component={ProjectDetailPage} />
          <Route path="/rooms"                component={RoomsPage} />
          <Route path="/rooms/:id"            component={RoomDetailPage} />
          <Route path="/settings"  component={SettingsPage} />
          <Route path="/admin"     component={AdminPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/"         component={LandingPage} />
      <Route path="/jp"       component={LandingJpPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/waitlist">
        <WaitlistPage locale="en" />
      </Route>
      <Route path="/waitlist/jp">
        <WaitlistPage locale="ja" />
      </Route>

      {/* Early access coupon entry */}
      <Route path="/early-access" component={EarlyAccessPage} />

      {/* Admin bypass — no coupon required; server verifies admin role via Firebase token */}
      <Route path="/admin-login" component={AdminLoginPage} />

      {/* Public sample page — no login required */}
      <Route path="/sample-decision-checkpoint" component={SampleDecisionCheckpointPage} />

      {/* Public intake form — paid beta, no login required */}
      <Route path="/submit-decision" component={SubmitDecisionPage} />

      {/* Login — requires valid early access */}
      <Route path="/login">
        <LoginGuard>
          <AuthPage />
        </LoginGuard>
      </Route>
      {/* Redirect legacy /signup to early-access */}
      <Route path="/signup">
        <Redirect to="/early-access" />
      </Route>

      {/* Protected app */}
      <Route>
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function Root() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocaleProvider>
          <PlanProvider>
            <UserProfileProvider>
              <SettingsProvider>
                <RoomsProvider>
                  <ProjectsProvider>
                    <Root />
                  </ProjectsProvider>
                </RoomsProvider>
              </SettingsProvider>
            </UserProfileProvider>
          </PlanProvider>
        </LocaleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { RoomsProvider } from "./context/RoomsContext";
import { LocaleProvider } from "./context/LocaleContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

/** Routes that require authentication — redirect to /login if not signed in */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to={`/login`} />;
  return <>{children}</>;
}

/** Routes that should redirect away if already signed in */
function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user) return <Redirect to="/rooms" />;
  return <>{children}</>;
}

function AppShell() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
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
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
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
        {/* Mobile-only top nav bar */}
        <div className="md:hidden shrink-0 flex items-center gap-3 px-4 h-12 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 -ml-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <MenuIcon size={20} />
          </button>
          <span className="text-sm font-semibold text-foreground">Qrooma</span>
        </div>

        <Switch>
          <Route path="/rooms" component={RoomsPage} />
          <Route path="/rooms/:id" component={RoomDetailPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public: landing page */}
      <Route path="/" component={LandingPage} />

      {/* Guest-only: redirect to /rooms if already signed in */}
      <Route path="/login">
        <GuestGuard>
          <AuthPage initialMode="login" />
        </GuestGuard>
      </Route>
      <Route path="/signup">
        <GuestGuard>
          <AuthPage initialMode="signup" />
        </GuestGuard>
      </Route>

      {/* Auth-required: app shell */}
      <Route>
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocaleProvider>
          <SettingsProvider>
            <RoomsProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </RoomsProvider>
          </SettingsProvider>
        </LocaleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { RoomsProvider } from "./context/RoomsContext";
import { LocaleProvider } from "./context/LocaleContext";
import AuthPage from "./pages/AuthPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

function AppShell() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location !== "/") return <Redirect to="/" />;
    return <AuthPage />;
  }

  if (location === "/") return <Redirect to="/rooms" />;

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocaleProvider>
          <SettingsProvider>
            <RoomsProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppShell />
              </WouterRouter>
            </RoomsProvider>
          </SettingsProvider>
        </LocaleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

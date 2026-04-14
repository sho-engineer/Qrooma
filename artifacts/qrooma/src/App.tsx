import { useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import AuthPage from "./pages/AuthPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import Sidebar from "./components/Sidebar";
import { DUMMY_ROOMS } from "./data/dummy";
import type { Room } from "./types";

const queryClient = new QueryClient();

function AppShell() {
  const { user, isLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(DUMMY_ROOMS);
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!user) {
    if (location !== "/") {
      return <Redirect to="/" />;
    }
    return <AuthPage />;
  }

  if (location === "/") {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar rooms={rooms} onRoomsChange={setRooms} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Switch>
          <Route path="/rooms" component={() => <RoomsPage rooms={rooms} />} />
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
        <SettingsProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppShell />
          </WouterRouter>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

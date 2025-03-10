import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { FloatingAnxietyMeter } from "./FloatingAnxietyMeter";
import { useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();
  const showFloatingMeter = location.pathname !== '/ai-chat'; // Don't show on AI Chat page

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      {showFloatingMeter && <FloatingAnxietyMeter />}
      <Footer />
    </div>
  );
}
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

/**
 * Top-level application frame shared by every authenticated section.
 * Desktop/tablet: Topbar + persistent Sidebar + main content.
 * Mobile: Topbar + main content + fixed bottom MobileNav.
 */
export default function AppShell({ children }) {
  return (
    <div className="flex h-dvh flex-col bg-bg">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

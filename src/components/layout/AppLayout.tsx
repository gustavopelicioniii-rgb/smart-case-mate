import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Pular para o conteúdo
      </a>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile header — hidden on desktop */}
      <MobileHeader />

      {/* Main content */}
      <main id="main-content" className="lg:pl-64" tabIndex={-1}>
        <div className="p-4 pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;

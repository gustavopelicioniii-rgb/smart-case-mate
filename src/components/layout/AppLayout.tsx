import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile header — hidden on desktop */}
      <MobileHeader />

      {/* Main content */}
      <main className="lg:pl-64">
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

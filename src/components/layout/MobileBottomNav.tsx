import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Scale, Calendar, Users, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Processos", href: "/processos", icon: Scale },
    { name: "Agenda", href: "/agenda", icon: Calendar },
    { name: "CRM", href: "/crm", icon: Users },
    { name: "Menu", href: "/menu", icon: Menu },
];

const MobileBottomNav = () => {
    const location = useLocation();
    const isActive = (href: string) =>
        href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

    return (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur border-t border-border lg:hidden">
            <div className="flex items-center justify-around h-[72px] px-2 safe-area-pb">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        to={tab.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1.5 flex-1 py-2 text-[11px] font-medium transition-colors",
                            isActive(tab.href)
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <tab.icon className={cn("h-6 w-6 shrink-0", isActive(tab.href) && "text-primary")} />
                        <span>{tab.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default MobileBottomNav;

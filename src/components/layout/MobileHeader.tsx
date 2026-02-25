import { Link } from "react-router-dom";
import { Scale, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const MobileHeader = () => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-sidebar border-b border-sidebar-border lg:hidden">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                    <Scale className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <h1 className="font-display text-base font-bold text-sidebar-accent-foreground">
                    Advogado<span className="text-sidebar-primary">10X</span>
                </h1>
            </div>
            <div className="flex items-center gap-1">
                <ThemeToggle />
                <Link
                    to="/configuracoes"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent/50 text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors"
                >
                    <User className="h-5 w-5" />
                </Link>
            </div>
        </header>
    );
};

export default MobileHeader;

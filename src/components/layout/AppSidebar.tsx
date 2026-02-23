import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Scale,
  FileText,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Sparkles,
  Calendar,
  FolderOpen,
  Newspaper,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Processos", href: "/processos", icon: Scale },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Gerador de Peças", href: "/pecas", icon: FileText, badge: true },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
];

const secondaryNav = [
  { name: "Documentos", href: "/documentos", icon: FolderOpen },
  { name: "Publicações", href: "/publicacoes", icon: Newspaper },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

const NavItem = ({ item, isActive }: { item: { name: string; href: string; icon: React.ElementType; badge?: boolean }; isActive: boolean }) => (
  <Link
    to={item.href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
  >
    <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
    {item.name}
    {item.badge && (
      <Sparkles className="ml-auto h-3.5 w-3.5 text-sidebar-primary" />
    )}
  </Link>
);

const AppSidebar = () => {
  const location = useLocation();
  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Scale className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-accent-foreground">
            Advogado<span className="text-sidebar-primary">10X</span>
          </h1>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2">
            Principal
          </p>
          {mainNav.map((item) => (
            <NavItem key={item.name} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2">
            Ferramentas
          </p>
          {secondaryNav.map((item) => (
            <NavItem key={item.name} item={item} isActive={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              Dr. Advogado
            </p>
            <p className="text-xs text-sidebar-foreground truncate">
              Plano Profissional
            </p>
          </div>
          <button className="text-sidebar-foreground hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;

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
  Video,
  UsersRound,
  MessageCircle,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMemo } from "react";
import { format } from "date-fns";

const mainNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, iconSrc: "/icons/dashboard.svg" },
  { name: "Processos", href: "/processos", icon: Scale, iconSrc: "/icons/scale.svg" },
  { name: "Agenda", href: "/agenda", icon: Calendar, useCount: true },
  { name: "Gerador de Peças", href: "/pecas", icon: FileText, badge: true },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle, iconSrc: "/icons/whatsapp.svg" },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
];

const secondaryNav = [
  { name: "Calculadora Jurídica", href: "/calculadora", icon: Calculator, iconSrc: "/icons/calculator.svg" },
  { name: "Documentos", href: "/documentos", icon: FolderOpen },
  { name: "Publicações", href: "/publicacoes", icon: Newspaper },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Equipe", href: "/equipe", icon: UsersRound },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

function getMainNav(todayCount: number) {
  return mainNavItems.map((item) => {
    if ("useCount" in item && item.useCount) {
      const { useCount, ...rest } = item;
      return { ...rest, count: todayCount };
    }
    return item;
  });
}

type NavItemType = {
  name: string;
  href: string;
  icon: React.ElementType;
  iconSrc?: string;
  badge?: boolean;
  count?: number;
};

const NavItem = ({ item, isActive }: { item: NavItemType; isActive: boolean }) => (
  <Link
    to={item.href}
    className={cn(
      "flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
  >
    {item.iconSrc ? (
      <img
        src={item.iconSrc}
        alt=""
        className={cn(
          "h-5 w-5 shrink-0 object-contain",
          isActive ? "opacity-100" : "opacity-80"
        )}
        aria-hidden
      />
    ) : (
      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
    )}
    <span className="truncate">{item.name}</span>
    {item.badge && (
      <Sparkles className="ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
    )}
    {item.count != null && item.count > 0 && (
      <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground px-1">
        {item.count}
      </span>
    )}
  </Link>
);

const AppSidebar = () => {
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { events: gcalEvents } = useGoogleCalendar();
  const todayCount = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return (gcalEvents ?? []).filter((e) => {
      const start = e.start?.dateTime || e.start?.date;
      if (!start) return false;
      const d = new Date(start);
      return format(d, "yyyy-MM-dd") === todayStr;
    }).length;
  }, [gcalEvents]);
  const mainNav = getMainNav(todayCount);
  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const initials = displayName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo do escritório ou padrão */}
      <div className="flex h-[72px] items-center gap-3 px-5 border-b border-sidebar-border">
        {profile?.firm_logo_url ? (
          <img
            src={profile.firm_logo_url}
            alt="Logo do escritório"
            className="h-10 w-auto max-w-[160px] object-contain"
          />
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
              <Scale className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-sidebar-accent-foreground">
                Advogado<span className="text-sidebar-primary">10X</span>
              </h1>
            </div>
          </>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-7">
        <div className="space-y-1">
          <p className="px-3.5 mb-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/55">
            Principal
          </p>
          {mainNav.map((item) => (
            <NavItem key={item.name} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3.5 mb-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/55">
            Ferramentas
          </p>
          {secondaryNav.map((item) => (
            <NavItem key={item.name} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        <div className="px-3.5 pt-3">
          <ThemeToggle />
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-sidebar-foreground/80 truncate">
              {role === "admin" ? "Administrador" : "Advogado"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;


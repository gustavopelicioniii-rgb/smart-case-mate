import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FileText, DollarSign, FolderOpen, Newspaper, BarChart3, Settings,
    Sparkles, LogOut, ChevronRight, UsersRound, MessageCircle, Calculator,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const menuItems = [
    { name: "Gerador de Peças", href: "/pecas", icon: FileText, badge: "IA" },
    { name: "Calculadora Jurídica", href: "/calculadora", icon: Calculator, iconSrc: "/icons/calculator.svg" },
    { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle, iconSrc: "/icons/whatsapp.svg" },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
    { name: "Documentos", href: "/documentos", icon: FolderOpen },
    { name: "Publicações", href: "/publicacoes", icon: Newspaper },
    { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
    { name: "Equipe", href: "/equipe", icon: UsersRound },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
];

const MobileMenu = () => {
    const { user, role, signOut } = useAuth();
    const { data: profile } = useProfile();

    const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
    const initials = displayName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-28 px-1">
            {/* Profile Card */}
            <Card className="rounded-xl border-border/80">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold truncate">{displayName}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{role === "admin" ? "Administrador" : "Advogado"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Menu Items */}
            <Card className="rounded-xl border-border/80">
                <CardContent className="p-2">
                    {menuItems.map((item, idx) => (
                        <div key={item.name}>
                            <Link
                                to={item.href}
                                className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 hover:bg-muted transition-colors"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
                                    {item.iconSrc ? (
                                        <img src={item.iconSrc} alt="" className="h-5 w-5 object-contain" aria-hidden />
                                    ) : (
                                        <item.icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span className="flex-1 text-sm font-medium">{item.name}</span>
                                {item.badge && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        <Sparkles className="h-3 w-3" />
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            {idx < menuItems.length - 1 && <Separator className="mx-3" />}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Logout */}
            <Card className="rounded-xl border-destructive/30">
                <CardContent className="p-2">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 w-full hover:bg-destructive/5 transition-colors text-destructive"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Sair da Conta</span>
                    </button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MobileMenu;

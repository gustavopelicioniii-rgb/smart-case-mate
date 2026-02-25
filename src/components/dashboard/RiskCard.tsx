import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, DollarSign, TrendingDown, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDeadlinesStats } from "@/hooks/useDeadlines";
import { useFees } from "@/hooks/useFees";
import { useProcessos } from "@/hooks/useProcessos";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RiskItem {
  icon: React.ElementType;
  title: string;
  detail: string;
  process: string;
  deadline: string;
  severity: "critical" | "warning" | "info";
  actionLabel: string;
  link?: string;
}

const severityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const RiskCard = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const navigate = useNavigate();
  const { criticalList } = useDeadlinesStats();
  const { data: fees } = useFees();
  const { data: processos } = useProcessos();

  const risks: RiskItem[] = useMemo(() => {
    const list: RiskItem[] = [];
    const today = new Date();
    const in5Days = new Date(today);
    in5Days.setDate(today.getDate() + 5);

    if (criticalList.length > 0) {
      const first = criticalList[0];
      const proc = first.process;
      list.push({
        icon: Clock,
        title: `${criticalList.length} processo(s) com alto risco de perda de prazo`,
        detail: `${first.titulo} — ação imediata necessária`,
        process: proc?.number ? `Proc. ${proc.number}` : first.titulo,
        deadline: first.data_fim ? format(parseISO(first.data_fim), "dd MMM yyyy", { locale: ptBR }) : "Prazo próximo",
        severity: "critical",
        actionLabel: "Ver prazos",
        link: "/processos",
      });
    }

    const atrasados = (fees ?? []).filter((f) => f.status === "Atrasado");
    const vencendo = (fees ?? []).filter((f) => {
      if (f.status !== "Pendente" || !f.due_date) return false;
      const d = new Date(f.due_date);
      return d >= today && d <= in5Days;
    });
    if (atrasados.length > 0) {
      const total = atrasados.reduce((s, f) => s + Number(f.value), 0);
      const clientes = [...new Set(atrasados.map((f) => f.client))].slice(0, 3).join(", ");
      list.push({
        icon: DollarSign,
        title: `${atrasados.length} honorário(s) em atraso`,
        detail: `Total: ${formatCurrency(total)} — ${clientes}${atrasados.length > 3 ? "..." : ""}`,
        process: clientes || "—",
        deadline: "Vencidos",
        severity: "warning",
        actionLabel: "Enviar cobrança",
        link: "/financeiro",
      });
    }
    if (vencendo.length > 0 && atrasados.length === 0) {
      const total = vencendo.reduce((s, f) => s + Number(f.value), 0);
      list.push({
        icon: DollarSign,
        title: `${vencendo.length} honorário(s) vencendo nos próximos 5 dias`,
        detail: `Total: ${formatCurrency(total)}`,
        process: vencendo.map((f) => f.client).slice(0, 3).join(", "),
        deadline: "Próximos dias",
        severity: "info",
        actionLabel: "Ver financeiro",
        link: "/financeiro",
      });
    }

    const semMovimento = (processos ?? []).filter((p) => {
      if (p.status !== "Em andamento") return false;
      const up = new Date(p.updated_at);
      const diff = (today.getTime() - up.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 30;
    });
    if (semMovimento.length > 0) {
      list.push({
        icon: TrendingDown,
        title: `${semMovimento.length} processo(s) sem movimentação há mais de 30 dias`,
        detail: "Verifique pendências ou oportunidades de acordo",
        process: semMovimento.slice(0, 2).map((p) => p.number).join(", "),
        deadline: "Sem prazo urgente",
        severity: "warning",
        actionLabel: "Ver processos",
        link: "/processos",
      });
    }

    if (list.length === 0) {
      list.push({
        icon: AlertTriangle,
        title: "Nenhum risco crítico no momento",
        detail: "Continue monitorando prazos e honorários.",
        process: "—",
        deadline: "—",
        severity: "info",
        actionLabel: "Ver dashboard",
      });
    }
    return list;
  }, [criticalList, fees, processos]);

  const handleAction = (risk: RiskItem) => {
    if (risk.link) navigate(risk.link);
  };

  return (
    <Card className="border-destructive/30 bg-destructive/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          Risco da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {risks.map((risk, i) => (
          <div key={i} className="space-y-0">
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-all hover:scale-[1.01] cursor-pointer ${severityStyles[risk.severity]} ${expanded === i ? "rounded-b-none" : ""}`}
            >
              <risk.icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium flex-1">{risk.title}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded === i ? "rotate-180" : ""}`} />
            </div>
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`border border-t-0 rounded-b-lg p-3 space-y-2.5 ${severityStyles[risk.severity].replace("bg-", "bg-").replace("/10", "/5")}`}>
                    <p className="text-xs opacity-90">{risk.detail}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">Processo / Cliente</span>
                      <span className="opacity-80">{risk.process}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">Prazo</span>
                      <span className="opacity-80">{risk.deadline}</span>
                    </div>
                    {risk.link && (
                      <div className="pt-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleAction(risk); }}>
                          {risk.actionLabel}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RiskCard;

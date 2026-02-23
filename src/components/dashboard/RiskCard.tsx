import { useState } from "react";
import { AlertTriangle, Clock, DollarSign, TrendingDown, ExternalLink, FileText, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface RiskItem {
  icon: React.ElementType;
  title: string;
  detail: string;
  process: string;
  deadline: string;
  severity: "critical" | "warning" | "info";
  action: string;
  actionLabel: string;
}

const risks: RiskItem[] = [
  {
    icon: Clock,
    title: "2 processos com alto risco de perda de prazo",
    detail: "Contestação em 2 dias e Recurso em 3 dias — ação imediata necessária",
    process: "Proc. 0012345-67.2024.8.26.0100",
    deadline: "23 Fev 2026",
    severity: "critical",
    action: "open",
    actionLabel: "Abrir Processo",
  },
  {
    icon: TrendingDown,
    title: "1 processo com baixa probabilidade de êxito",
    detail: "Análise de jurisprudência indica 28% de chance — considerar acordo",
    process: "Proc. 0098765-43.2024.5.02.0001",
    deadline: "Sem prazo urgente",
    severity: "warning",
    action: "analyze",
    actionLabel: "Ver Análise",
  },
  {
    icon: DollarSign,
    title: "3 honorários vencendo nos próximos 5 dias",
    detail: "Total em risco: R$ 14.500 — 2 clientes sem retorno há 10+ dias",
    process: "João Santos, Carlos Oliveira, Ana Pereira",
    deadline: "Vencimento: 25-28 Fev",
    severity: "info",
    action: "charge",
    actionLabel: "Enviar Cobrança",
  },
];

const severityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

const RiskCard = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleAction = (risk: RiskItem) => {
    toast.success(`Ação: ${risk.actionLabel}`, { description: risk.process });
  };

  return (
    <Card className="border-destructive/30 bg-destructive/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          🧠 Risco da Semana
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
                      <span className="font-semibold">📋</span>
                      <span className="opacity-80">{risk.process}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">📅</span>
                      <span className="opacity-80">{risk.deadline}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => { e.stopPropagation(); handleAction(risk); }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {risk.actionLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => { e.stopPropagation(); toast.success("Gerando peça..."); }}
                      >
                        <FileText className="h-3 w-3" />
                        Gerar Peça
                      </Button>
                    </div>
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

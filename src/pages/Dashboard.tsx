import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, DollarSign, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HealthScore from "@/components/dashboard/HealthScore";
import type { BreakdownItem } from "@/components/dashboard/HealthScore";
import RiskCard from "@/components/dashboard/RiskCard";
import TodayActions from "@/components/dashboard/TodayActions";
import CriticalDeadlines from "@/components/dashboard/CriticalDeadlines";
import SmartActivity from "@/components/dashboard/SmartActivity";
import RevenueStats from "@/components/dashboard/RevenueStats";
import AiAssistantButton from "@/components/dashboard/AiAssistantButton";
import AiRecommendation from "@/components/dashboard/AiRecommendation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useDeadlinesStats } from "@/hooks/useDeadlines";
import { useFeeStats } from "@/hooks/useFees";
import { useProcessos } from "@/hooks/useProcessos";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { urgentes, pendentes, total: totalPrazos } = useDeadlinesStats();
  const feeStats = useFeeStats();
  const { data: processos } = useProcessos();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Advogado";

  const { score, label, breakdownItems } = useMemo(() => {
    const now = new Date();
    const prazosScore = totalPrazos === 0 ? 100 : Math.max(0, 100 - (urgentes / Math.max(1, pendentes)) * 40);
    const totalFee = feeStats.pago + feeStats.pendente + feeStats.atrasado;
    const feeScore = totalFee === 0 ? 100 : Math.max(0, 100 - (feeStats.atrasado / totalFee) * 100);
    const ativos = (processos ?? []).filter((p) => p.status === "Em andamento" || p.status === "Aguardando prazo");
    const comMovimento = ativos.filter((p) => {
      const up = new Date(p.updated_at);
      const diff = (now.getTime() - up.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });
    const processScore = ativos.length === 0 ? 100 : Math.round((comMovimento.length / ativos.length) * 100);
    const receitaScore = totalFee === 0 ? 100 : feeStats.pago > 0 ? Math.min(100, 50 + (feeStats.pago / totalFee) * 50) : 50;

    const score = Math.round(0.3 * prazosScore + 0.25 * feeScore + 0.25 * processScore + 0.2 * receitaScore);
    const label = score >= 80 ? "Escritório saudável" : score >= 60 ? "Atenção a prazos e cobranças" : "Requer atenção";

    const breakdown: BreakdownItem[] = [
      {
        icon: CheckCircle2,
        label: "Prazos organizados",
        value: totalPrazos === 0 ? "Nenhum prazo" : `${pendentes - urgentes}/${pendentes} em dia`,
        percent: Math.round(prazosScore),
        status: prazosScore >= 80 ? "good" : prazosScore >= 60 ? "warning" : "bad",
        suggestion: urgentes > 0 ? `${urgentes} prazo(s) urgente(s). Acompanhe em Processos.` : "Excelente! Continue monitorando diariamente.",
      },
      {
        icon: AlertTriangle,
        label: "Honorários",
        value: feeStats.atrasado > 0 ? `R$ ${Math.round(feeStats.atrasado)} em atraso` : "Em dia",
        percent: Math.round(feeScore),
        status: feeScore >= 80 ? "good" : feeScore >= 60 ? "warning" : "bad",
        suggestion: feeStats.atrasado > 0 ? "Automatize cobranças para reduzir inadimplência." : "Honorários sob controle.",
      },
      {
        icon: TrendingDown,
        label: "Processos ativos",
        value: ativos.length === 0 ? "—" : `${comMovimento.length}/${ativos.length} com movimentação recente`,
        percent: processScore,
        status: processScore >= 80 ? "good" : processScore >= 60 ? "warning" : "bad",
        suggestion: ativos.length - comMovimento.length > 0 ? "Alguns processos sem movimentação há 30+ dias. Verifique pendências." : "Processos em movimento.",
      },
      {
        icon: DollarSign,
        label: "Receita",
        value: feeStats.pago > 0 ? "Positiva" : "Aguardando recebimentos",
        percent: Math.round(receitaScore),
        status: receitaScore >= 70 ? "good" : receitaScore >= 50 ? "warning" : "bad",
        suggestion: "Acompanhe o módulo Financeiro e pipeline de cobranças.",
      },
    ];

    return { score: Math.min(100, Math.max(0, score)), label, breakdownItems: breakdown };
  }, [urgentes, pendentes, totalPrazos, feeStats, processos]);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Alerta antes do vencimento — destaque no topo */}
        {urgentes > 0 && (
          <motion.div variants={item}>
            <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerta de prazo processual</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-2">
                <span>{urgentes} prazo(s) vence(m) nos próximos dias. Contagem em dias úteis.</span>
                <Button variant="outline" size="sm" asChild className="border-amber-600 text-amber-700 dark:text-amber-400">
                  <Link to="/processos">Ver prazos</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Header + Health Score */}
        <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {getGreeting()}, {displayName}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Sua central de decisão — tudo sob controle.
            </p>
            <p className="mt-1 text-xs text-primary font-medium">✓ Prazos em dias úteis • Atualizações hoje na Inbox</p>
            {urgentes > 0 || (feeStats.countPendenteOuAtrasado ?? 0) > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Resumo do dia: {urgentes > 0 && `${urgentes} prazo(s) urgente(s)`}
                {urgentes > 0 && (feeStats.countPendenteOuAtrasado ?? 0) > 0 && " • "}
                {(feeStats.countPendenteOuAtrasado ?? 0) > 0 && `${feeStats.countPendenteOuAtrasado} honorário(s) pendente(s)`}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <HealthScore score={score} label={label} breakdownItems={breakdownItems} />
          </div>
        </motion.div>

        {/* 🔴 ALERTA REAL DE PRAZO — Destaque no topo */}
        <motion.div variants={item}>
          <CriticalDeadlines />
        </motion.div>

        {/* Zona Crítica: Risco + Ações */}
        <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
          <RiskCard />
          <TodayActions />
        </motion.div>

        {/* 🟢 Stats de Receita */}
        <motion.div variants={item}>
          <RevenueStats />
        </motion.div>

        {/* 🧠 Recomendação Estratégica da IA */}
        <motion.div variants={item}>
          <AiRecommendation />
        </motion.div>

        {/* Atividade Inteligente */}
        <motion.div variants={item}>
          <SmartActivity />
        </motion.div>
      </motion.div>

      {/* Botão IA flutuante */}
      <AiAssistantButton />
    </>
  );
};

export default Dashboard;

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import HealthScore from "@/components/dashboard/HealthScore";
import RiskCard from "@/components/dashboard/RiskCard";
import TodayActions from "@/components/dashboard/TodayActions";
import CriticalDeadlines from "@/components/dashboard/CriticalDeadlines";
import SmartActivity from "@/components/dashboard/SmartActivity";
import RevenueStats from "@/components/dashboard/RevenueStats";
import AiAssistantButton from "@/components/dashboard/AiAssistantButton";
import AiRecommendation from "@/components/dashboard/AiRecommendation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

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
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Advogado";

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header + Health Score */}
        <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {getGreeting()}, {displayName}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Sua central de decisão — tudo sob controle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HealthScore score={82} label="Escritório Saudável" />
          </div>
        </motion.div>

        {/* 🔴 Zona Crítica: Risco + Ações */}
        <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
          <RiskCard />
          <TodayActions />
        </motion.div>

        {/* 🔴 Prazos Críticos */}
        <motion.div variants={item}>
          <CriticalDeadlines />
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

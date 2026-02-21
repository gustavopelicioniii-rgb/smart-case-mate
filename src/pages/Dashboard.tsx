import { motion } from "framer-motion";
import {
  Scale,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Processos Ativos",
    value: "24",
    change: "+3 este mês",
    icon: Scale,
    trend: "up" as const,
  },
  {
    title: "Clientes",
    value: "48",
    change: "+5 este mês",
    icon: Users,
    trend: "up" as const,
  },
  {
    title: "Receita Mensal",
    value: "R$ 32.450",
    change: "+12% vs mês anterior",
    icon: DollarSign,
    trend: "up" as const,
  },
  {
    title: "Prazos Urgentes",
    value: "3",
    change: "Próximos 5 dias",
    icon: AlertTriangle,
    trend: "warning" as const,
  },
];

const deadlines = [
  {
    process: "Proc. 0012345-67.2024.8.26.0100",
    client: "Maria Silva",
    deadline: "23 Fev 2026",
    type: "Contestação",
    urgent: true,
  },
  {
    process: "Proc. 0098765-43.2024.5.02.0001",
    client: "João Santos",
    deadline: "25 Fev 2026",
    type: "Recurso Ordinário",
    urgent: true,
  },
  {
    process: "Proc. 1234567-89.2025.8.26.0100",
    client: "Empresa ABC Ltda",
    deadline: "28 Fev 2026",
    type: "Réplica",
    urgent: false,
  },
  {
    process: "Proc. 0054321-12.2025.8.26.0100",
    client: "Carlos Oliveira",
    deadline: "05 Mar 2026",
    type: "Petição Inicial",
    urgent: false,
  },
];

const recentActivities = [
  { text: "Contestação gerada para Proc. 0012345", time: "Há 2h", icon: FileText },
  { text: "Novo cliente cadastrado: Pedro Almeida", time: "Há 4h", icon: Users },
  { text: "Honorário recebido: R$ 3.500", time: "Há 6h", icon: DollarSign },
  { text: "Decisão resumida por IA: Proc. 0098765", time: "Há 1d", icon: Scale },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Bom dia, Dr. Advogado
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está o resumo do seu escritório hoje.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            21 Fev 2026
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    stat.trend === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-success" />
                )}
                {stat.trend === "warning" && (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deadlines */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-display text-xl">Próximos Prazos</CardTitle>
              <Button variant="ghost" size="sm">
                Ver todos <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        d.urgent ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {d.client}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{d.process}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={d.urgent ? "destructive" : "secondary"}>
                      {d.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {d.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-xl">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <a.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

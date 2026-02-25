import { useMemo } from "react";
import { DollarSign, TrendingUp, Scale, Users, Lock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFees, useFeeStats } from "@/hooks/useFees";
import { useProcessos, useProcessoStats } from "@/hooks/useProcessos";
import { useCrmClients, useCrmStages } from "@/hooks/useCrm";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const RevenueStats = () => {
  const { data: fees } = useFees();
  const stats = useFeeStats();
  const processoStats = useProcessoStats();
  const { data: crmClients } = useCrmClients();
  const { data: stages } = useCrmStages();

  const { receitaMensal, receitaProjetada, receitaTravada, emRisco, percentTravada, percentRisco, pipelineConversion } = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    let receitaMensal = 0;
    let receitaProjetada = 0;
    (fees ?? []).forEach((f) => {
      if (f.status === "Pago" && f.paid_date) {
        const d = new Date(f.paid_date);
        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) receitaMensal += Number(f.value);
      }
      if (f.status === "Pendente" && f.due_date) {
        const due = new Date(f.due_date);
        const in30 = due.getTime() - now.getTime() <= 30 * 24 * 60 * 60 * 1000 && due >= now;
        if (in30) receitaProjetada += Number(f.value);
      }
    });
    const receitaTravada = stats.pago;
    const emRisco = stats.atrasado;
    const totalReceita = receitaTravada + stats.pendente + emRisco;
    const percentTravada = totalReceita > 0 ? Math.round((receitaTravada / totalReceita) * 100) : 0;
    const percentRisco = totalReceita > 0 ? Math.round((emRisco / totalReceita) * 100) : 0;

    const totalClients = crmClients?.length ?? 0;
    const lastStageId = stages?.length ? stages[stages.length - 1]?.id : null;
    const converted = lastStageId ? (crmClients?.filter((c) => c.stage_id === lastStageId).length ?? 0) : 0;
    const pipelineConversion = totalClients > 0 ? { percent: Math.round((converted / totalClients) * 100), total: totalClients, converted } : { percent: 0, total: 0, converted: 0 };

    return {
      receitaMensal,
      receitaProjetada,
      receitaTravada,
      emRisco,
      percentTravada,
      percentRisco,
      pipelineConversion,
    };
  }, [fees, stats, crmClients, stages]);

  const statsCards = useMemo(
    () => [
      { title: "Receita Mensal", value: formatCurrency(receitaMensal), change: "Mês atual", icon: DollarSign, color: "bg-success/10 text-success" },
      { title: "Processos Ativos", value: String(processoStats.emAndamento + processoStats.aguardandoPrazo), change: `${processoStats.total} no total`, icon: Scale, color: "bg-primary/10 text-primary" },
      { title: "Clientes", value: String(crmClients?.length ?? 0), change: "CRM", icon: Users, color: "bg-info/10 text-info" },
      { title: "Receita Projetada", value: formatCurrency(receitaProjetada), change: "Próximos 30 dias", icon: TrendingUp, color: "bg-accent/10 text-accent" },
    ],
    [receitaMensal, processoStats, crmClients?.length, receitaProjetada]
  );

  const revenueBreakdown = useMemo(
    () => [
      { label: "Receita Travada", value: formatCurrency(receitaTravada), percent: percentTravada, icon: Lock, color: "text-success" },
      { label: "Em Risco (Inadimplentes)", value: formatCurrency(emRisco), percent: percentRisco, icon: AlertTriangle, color: "text-warning" },
    ],
    [receitaTravada, emRisco, percentTravada, percentRisco]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-success opacity-60" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {revenueBreakdown.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              </div>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <div className="mt-3">
                <Progress value={item.percent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{item.percent}% do total</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Conversão Pipeline</span>
            </div>
            <p className="text-xl font-bold text-primary">{pipelineConversion.percent}%</p>
            <div className="mt-3">
              <Progress value={pipelineConversion.percent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {pipelineConversion.converted} de {pipelineConversion.total} clientes na última etapa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueStats;

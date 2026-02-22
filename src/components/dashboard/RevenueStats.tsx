import { DollarSign, TrendingUp, Scale, Users, Lock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  { title: "Receita Mensal", value: "R$ 32.450", change: "+12% vs mês anterior", icon: DollarSign, color: "bg-success/10 text-success" },
  { title: "Processos Ativos", value: "24", change: "+3 este mês", icon: Scale, color: "bg-primary/10 text-primary" },
  { title: "Clientes", value: "48", change: "+5 este mês", icon: Users, color: "bg-info/10 text-info" },
  { title: "Receita Projetada", value: "R$ 45.800", change: "Próximos 30 dias", icon: TrendingUp, color: "bg-accent/10 text-accent" },
];

const revenueBreakdown = [
  { label: "Receita Travada", value: "R$ 22.300", percent: 69, icon: Lock, color: "text-success" },
  { label: "Em Risco (Inadimplentes)", value: "R$ 10.150", percent: 31, icon: AlertTriangle, color: "text-warning" },
];

const pipelineConversion = { label: "Conversão Pipeline", value: "68%", leads: 12, converted: 8 };

const RevenueStats = () => (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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

    {/* Revenue Breakdown */}
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

      {/* Pipeline Conversion */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{pipelineConversion.label}</span>
          </div>
          <p className="text-xl font-bold text-primary">{pipelineConversion.value}</p>
          <div className="mt-3">
            <Progress value={68} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {pipelineConversion.converted} de {pipelineConversion.leads} leads convertidos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default RevenueStats;

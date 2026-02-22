import { AlertTriangle, Clock, DollarSign, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskItem {
  icon: React.ElementType;
  text: string;
  severity: "critical" | "warning" | "info";
}

const risks: RiskItem[] = [
  { icon: Clock, text: "2 processos com alto risco de perda de prazo", severity: "critical" },
  { icon: TrendingDown, text: "1 processo com baixa probabilidade de êxito", severity: "warning" },
  { icon: DollarSign, text: "3 honorários vencendo nos próximos 5 dias", severity: "info" },
];

const severityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

const RiskCard = () => (
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
        <div
          key={i}
          className={`flex items-center gap-3 rounded-lg border p-3 transition-all hover:scale-[1.01] cursor-pointer ${severityStyles[risk.severity]}`}
        >
          <risk.icon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{risk.text}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default RiskCard;

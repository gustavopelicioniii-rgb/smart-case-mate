import { Clock, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Deadline {
  process: string;
  client: string;
  deadline: string;
  type: string;
  daysLeft: number;
  urgent: boolean;
}

const deadlines: Deadline[] = [
  { process: "Proc. 0012345-67.2024.8.26.0100", client: "Maria Silva", deadline: "23 Fev 2026", type: "Contestação", daysLeft: 1, urgent: true },
  { process: "Proc. 0098765-43.2024.5.02.0001", client: "João Santos", deadline: "25 Fev 2026", type: "Recurso Ordinário", daysLeft: 3, urgent: true },
  { process: "Proc. 1234567-89.2025.8.26.0100", client: "Empresa ABC Ltda", deadline: "28 Fev 2026", type: "Réplica", daysLeft: 6, urgent: false },
  { process: "Proc. 0054321-12.2025.8.26.0100", client: "Carlos Oliveira", deadline: "05 Mar 2026", type: "Petição Inicial", daysLeft: 11, urgent: false },
];

const getDaysLeftColor = (days: number) => {
  if (days <= 2) return "text-destructive font-bold";
  if (days <= 5) return "text-warning font-semibold";
  return "text-muted-foreground";
};

const getDaysLeftBg = (days: number) => {
  if (days <= 2) return "bg-destructive/10 border-destructive/30 animate-pulse";
  if (days <= 5) return "bg-warning/5 border-warning/20";
  return "bg-card border-border";
};

const CriticalDeadlines = () => (
  <TooltipProvider>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          🔴 Prazos Críticos
        </CardTitle>
        <Button variant="ghost" size="sm">
          Ver todos <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {deadlines.map((d, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:scale-[1.005] cursor-pointer ${getDaysLeftBg(d.daysLeft)}`}
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
                    <p className="text-sm font-semibold text-foreground truncate">{d.client}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.process}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={d.urgent ? "destructive" : "secondary"}>{d.type}</Badge>
                  <div className="text-right">
                    <p className={`text-sm ${getDaysLeftColor(d.daysLeft)}`}>
                      {d.daysLeft === 1 ? "AMANHÃ" : `${d.daysLeft} dias`}
                    </p>
                    <p className="text-xs text-muted-foreground">{d.deadline}</p>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-semibold">{d.client} – {d.type}</p>
              <p className="text-xs mt-1">{d.process}</p>
              <p className="text-xs mt-1">Prazo: {d.deadline} ({d.daysLeft} dias restantes)</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </CardContent>
    </Card>
  </TooltipProvider>
);

export default CriticalDeadlines;

import { CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActionItem {
  text: string;
  detail: string;
  priority: "alta" | "média" | "normal";
}

const actions: ActionItem[] = [
  { text: "Contestação – Maria Silva", detail: "Prazo em 2 dias", priority: "alta" },
  { text: "Cobrar honorário – João Santos", detail: "R$ 3.500 vencido há 5 dias", priority: "alta" },
  { text: "Revisar decisão recém publicada", detail: "Proc. 0098765 – nova sentença", priority: "média" },
  { text: "Atualizar cliente sobre andamento", detail: "Carlos Oliveira aguarda retorno", priority: "normal" },
];

const priorityStyles = {
  alta: "destructive" as const,
  média: "default" as const,
  normal: "secondary" as const,
};

const priorityLabels = {
  alta: "Urgente",
  média: "Importante",
  normal: "Normal",
};

const TodayActions = () => (
  <Card className="border-accent/30 bg-accent/[0.02]">
    <CardHeader className="pb-3">
      <CardTitle className="font-display text-lg flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
        </div>
        🎯 O que fazer hoje
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {actions.map((action, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-muted/50 hover:scale-[1.01] cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{action.text}</p>
              <p className="text-xs text-muted-foreground">{action.detail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={priorityStyles[action.priority]}>
              {priorityLabels[action.priority]}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default TodayActions;

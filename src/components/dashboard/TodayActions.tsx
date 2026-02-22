import { CheckCircle2, ChevronRight, FileText, Send, Eye, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActionItem {
  text: string;
  detail: string;
  priority: "alta" | "média" | "normal";
  actionLabel: string;
  actionIcon: React.ElementType;
}

const actions: ActionItem[] = [
  { text: "Contestação – Maria Silva", detail: "Prazo em 2 dias", priority: "alta", actionLabel: "Gerar Contestação", actionIcon: FileText },
  { text: "Cobrar honorário – João Santos", detail: "R$ 3.500 vencido há 5 dias", priority: "alta", actionLabel: "Enviar Cobrança", actionIcon: Send },
  { text: "Revisar decisão recém publicada", detail: "Proc. 0098765 – nova sentença", priority: "média", actionLabel: "Ver Resumo IA", actionIcon: Eye },
  { text: "Atualizar cliente sobre andamento", detail: "Carlos Oliveira aguarda retorno", priority: "normal", actionLabel: "Notificar", actionIcon: Bell },
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

const TodayActions = () => {
  const handleAction = (action: ActionItem) => {
    toast.success(`Ação iniciada: ${action.actionLabel}`, {
      description: action.text,
    });
  };

  return (
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
            className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-muted/50 group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{action.text}</p>
                <p className="text-xs text-muted-foreground">{action.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={priorityStyles[action.priority]} className="hidden sm:inline-flex">
                {priorityLabels[action.priority]}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action);
                }}
              >
                <action.actionIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{action.actionLabel}</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TodayActions;

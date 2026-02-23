import { useState } from "react";
import { CheckCircle2, FileText, Send, Eye, Bell, Filter, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActionItem {
  id: string;
  text: string;
  detail: string;
  priority: "alta" | "média" | "normal";
  actionLabel: string;
  actionIcon: React.ElementType;
  responsible: string;
  processLink?: string;
}

const allActions: ActionItem[] = [
  { id: "1", text: "Contestação – Maria Silva", detail: "Prazo em 2 dias • Proc. 0012345", priority: "alta", actionLabel: "Gerar Contestação", actionIcon: FileText, responsible: "Dr. Advogado", processLink: "/processos" },
  { id: "2", text: "Cobrar honorário – João Santos", detail: "R$ 3.500 vencido há 5 dias", priority: "alta", actionLabel: "Enviar Cobrança", actionIcon: Send, responsible: "Dr. Advogado" },
  { id: "3", text: "Revisar decisão recém publicada", detail: "Proc. 0098765 – nova sentença", priority: "média", actionLabel: "Ver Resumo IA", actionIcon: Eye, responsible: "Dr. Advogado", processLink: "/processos" },
  { id: "4", text: "Atualizar cliente sobre andamento", detail: "Carlos Oliveira aguarda retorno", priority: "normal", actionLabel: "Notificar", actionIcon: Bell, responsible: "Dr. Advogado" },
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

const filterOptions = ["Todas", "Urgente", "Importante", "Normal"] as const;

const TodayActions = () => {
  const [filter, setFilter] = useState<string>("Todas");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const filtered = allActions.filter((a) => {
    if (filter === "Todas") return true;
    return priorityLabels[a.priority] === filter;
  });

  const handleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast.success("Tarefa marcada como concluída");
  };

  const handleAction = (action: ActionItem) => {
    toast.success(`Ação iniciada: ${action.actionLabel}`, { description: action.text });
  };

  return (
    <Card className="border-accent/30 bg-accent/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            🎯 O que fazer hoje
          </CardTitle>
          <div className="flex gap-1">
            {filterOptions.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                className="h-7 text-xs px-2"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.map((action, i) => {
          const isDone = completed.has(action.id);
          return (
            <div
              key={action.id}
              className={`flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-muted/50 group ${isDone ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => handleComplete(action.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isDone ? "bg-success border-success text-success-foreground" : "border-muted-foreground/30 hover:border-success"}`}
                >
                  {isDone && <Check className="h-3 w-3" />}
                </button>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold text-foreground truncate ${isDone ? "line-through" : ""}`}>{action.text}</p>
                  <p className="text-xs text-muted-foreground">{action.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={priorityStyles[action.priority]} className="hidden sm:inline-flex">
                  {priorityLabels[action.priority]}
                </Badge>
                {action.processLink && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => { e.stopPropagation(); handleAction(action); }}
                  disabled={isDone}
                >
                  <action.actionIcon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{action.actionLabel}</span>
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação com esse filtro.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayActions;

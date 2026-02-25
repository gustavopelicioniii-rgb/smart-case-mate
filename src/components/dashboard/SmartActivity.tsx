import { useMemo } from "react";
import { Brain, Users, DollarSign, Scale, RefreshCw, Eye, FileText, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInbox } from "@/hooks/useInbox";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeStyles: Record<string, string> = {
  ai: "bg-info/10 text-info",
  process: "bg-warning/10 text-warning",
  client: "bg-success/10 text-success",
  financial: "bg-accent/10 text-accent",
  crm: "bg-primary/10 text-primary",
  document: "bg-muted",
  task: "bg-success/10 text-success",
  system: "bg-muted",
};

function relativeTime(date: string): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  } catch {
    return "—";
  }
}

const SmartActivity = () => {
  const { data: inboxItems } = useInbox();

  const activities = useMemo(() => {
    const list = (inboxItems ?? []).slice(0, 15).map((item) => {
      let type = "process";
      let Icon = RefreshCw;
      if (item.tipo === "Publicação") {
        type = "process";
        Icon = Scale;
      } else if (item.tipo === "Andamento") {
        type = "process";
        Icon = RefreshCw;
      } else if (item.tipo === "Documento") {
        type = "document";
        Icon = FileText;
      } else if (item.tipo === "Tarefa") {
        type = "task";
        Icon = CheckCircle2;
      } else if (item.tipo === "Sistema") {
        type = "system";
        Icon = Info;
      }
      const text = item.descricao ? `${item.titulo}: ${item.descricao.slice(0, 60)}${item.descricao.length > 60 ? "…" : ""}` : item.titulo;
      return {
        text,
        time: relativeTime(item.created_at),
        icon: Icon,
        type,
      };
    });
    return list;
  }, [inboxItems]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-xl">Atividade Inteligente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade recente. Itens da caixa de entrada aparecem aqui.</p>
          ) : (
            activities.map((a, i) => (
              <div
                key={i}
                className="flex gap-3 group cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-all"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeStyles[a.type] || typeStyles.process}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartActivity;

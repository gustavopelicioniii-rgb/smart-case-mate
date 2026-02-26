import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useProcessMonitorLogs } from "@/hooks/useProcessMonitorLogs";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ProcessMonitorLog, ProcessMonitorLogType } from "@/hooks/useProcessMonitorLogs";

function formatLogTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return "—";
  }
}

const typeConfig: Record<ProcessMonitorLogType, { label: string; icon: typeof Scale; className: string }> = {
  consulta_realizada: {
    label: "Consulta realizada",
    icon: RefreshCw,
    className: "text-muted-foreground",
  },
  atualizacao_encontrada: {
    label: "Atualização encontrada",
    icon: CheckCircle2,
    className: "text-success",
  },
  erro_api: {
    label: "Erro na API",
    icon: AlertCircle,
    className: "text-destructive",
  },
};

const ProcessMonitorResults = () => {
  const { data: logs, isLoading } = useProcessMonitorLogs(8);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Consultas de processos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const list = logs ?? [];
  const hasAny = list.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Consultas de processos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Resultado do monitoramento diário (API Escavador). Novas movimentações relevantes geram notificação na Inbox.
        </p>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma consulta registrada ainda. O cron diário irá consultar cada processo até 1x por dia.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((log: ProcessMonitorLog) => {
              const config = typeConfig[log.log_type];
              const Icon = config.icon;
              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 text-sm"
                >
                  <div className={`shrink-0 mt-0.5 ${config.className}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {log.process_number ?? "Processo"}
                      <span className="text-muted-foreground font-normal ml-1">— {config.label}</span>
                    </p>
                    <p className="text-muted-foreground mt-0.5">{log.message ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatLogTime(log.created_at)}</p>
                  </div>
                  {log.process_id && (
                    <Link
                      to={`/processos/${log.process_id}`}
                      className="shrink-0 text-xs text-primary hover:underline"
                    >
                      Ver processo
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessMonitorResults;

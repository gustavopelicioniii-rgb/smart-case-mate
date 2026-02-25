import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2, FileText, Send, Eye, Bell, Check, ExternalLink, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import JoinMeetingModal from "@/components/agenda/JoinMeetingModal";
import type { AgendaEvent } from "@/types/agenda";
import { useInbox } from "@/hooks/useInbox";
import { useDeadlinesStats } from "@/hooks/useDeadlines";
import { useFees } from "@/hooks/useFees";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useAgendaEvents } from "@/hooks/useAgendaEvents";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface ActionItem {
  id: string;
  text: string;
  detail: string;
  priority: "alta" | "média" | "normal";
  actionLabel: string;
  actionIcon: React.ElementType;
  responsible: string;
  processLink?: string;
  meetingEvent?: AgendaEvent;
}

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

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const TodayActions = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("Todas");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [joinEvent, setJoinEvent] = useState<AgendaEvent | null>(null);

  const { data: inboxItems } = useInbox();
  const { criticalList } = useDeadlinesStats();
  const { data: fees } = useFees();
  const { events: gcalEvents, isConnected } = useGoogleCalendar();
  const { data: agendaEvents = [] } = useAgendaEvents();

  const allActions = useMemo(() => {
    const list: ActionItem[] = [];
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    agendaEvents.forEach((e) => {
      const eventDayStr = format(e.data, "yyyy-MM-dd");
      if (eventDayStr !== todayStr) return;
      const agendaEvent: AgendaEvent = {
        id: e.id,
        titulo: e.titulo,
        tipo: e.tipo,
        data: e.data,
        hora: e.hora,
        horaFim: e.horaFim,
        link: e.link,
        cliente: e.cliente,
        processo: e.processo,
      };
      list.push({
        id: `agenda-${e.id}`,
        text: e.titulo,
        detail: `${e.hora}${e.horaFim ? ` – ${e.horaFim}` : ""}`,
        priority: "alta",
        actionLabel: e.link ? "Entrar" : "Ver",
        actionIcon: e.link ? Video : Eye,
        responsible: "",
        meetingEvent: agendaEvent,
      });
    });

    if (isConnected && gcalEvents?.length) {
      gcalEvents.forEach((e) => {
        const start = e.start?.dateTime || e.start?.date;
        if (!start) return;
        const startDate = new Date(start);
        const eventDayStr = format(startDate, "yyyy-MM-dd");
        if (eventDayStr !== todayStr) return;
        const hora = startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const end = e.end?.dateTime || e.end?.date;
        const horaFim = end ? format(new Date(end), "HH:mm") : undefined;
        const agendaEvent: AgendaEvent = {
          id: e.id,
          titulo: e.summary || "Reunião",
          tipo: e.hangoutLink ? "reuniao-meet" : "reuniao",
          data: startDate,
          hora,
          horaFim,
          link: e.hangoutLink,
        };
        list.push({
          id: `gcal-${e.id}`,
          text: agendaEvent.titulo,
          detail: `${hora}${horaFim ? ` – ${horaFim}` : ""}`,
          priority: "alta",
          actionLabel: e.hangoutLink ? "Entrar" : "Ver",
          actionIcon: e.hangoutLink ? Video : Eye,
          responsible: "",
          meetingEvent: agendaEvent,
        });
      });
    }

    (criticalList ?? []).forEach((d) => {
      const proc = (d as { process?: { number?: string } }).process;
      const procNum = proc?.number ?? d.process_id?.slice(0, 8) ?? "—";
      const dataFim = d.data_fim ? parseISO(d.data_fim) : null;
      const dias = dataFim ? differenceInCalendarDays(dataFim, today) : 0;
      const detail = dataFim ? `Prazo em ${dias} dia(s) • Proc. ${procNum}` : `Proc. ${procNum}`;
      list.push({
        id: `deadline-${d.id}`,
        text: d.titulo,
        detail,
        priority: "alta",
        actionLabel: "Ver prazos",
        actionIcon: FileText,
        responsible: "",
        processLink: "/processos",
      });
    });

    (fees ?? []).filter((f) => f.status === "Atrasado").forEach((f) => {
      const due = f.due_date ? new Date(f.due_date) : null;
      const diasAtraso = due ? differenceInCalendarDays(today, due) : 0;
      list.push({
        id: `fee-${f.id}`,
        text: `Cobrar honorário – ${f.client || "Cliente"}`,
        detail: `${formatCurrency(Number(f.value))} vencido há ${diasAtraso} dia(s)`,
        priority: "alta",
        actionLabel: "Enviar Cobrança",
        actionIcon: Send,
        responsible: "",
        processLink: "/financeiro",
      });
    });

    (inboxItems ?? []).slice(0, 20).forEach((item) => {
      const priority =
        item.prioridade === "Urgente" || item.prioridade === "Alta"
          ? "alta"
          : item.prioridade === "Normal"
            ? "média"
            : "normal";
      list.push({
        id: `inbox-${item.id}`,
        text: item.titulo,
        detail: item.descricao?.slice(0, 80) || "",
        priority,
        actionLabel: "Ver",
        actionIcon: item.tipo === "Documento" ? FileText : Bell,
        responsible: "",
        processLink: "/inbox",
      });
    });

    return list;
  }, [inboxItems, criticalList, fees, gcalEvents, isConnected, agendaEvents]);

  const filtered = useMemo(
    () =>
      allActions.filter((a) => {
        if (filter === "Todas") return true;
        return priorityLabels[a.priority] === filter;
      }),
    [allActions, filter]
  );

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
    if (action.meetingEvent && (action.meetingEvent.tipo === "reuniao-meet" || action.meetingEvent.tipo === "reuniao-zoom")) {
      setJoinEvent(action.meetingEvent);
      return;
    }
    if (action.processLink) {
      navigate(action.processLink);
      return;
    }
    toast.success(`Ação iniciada: ${action.actionLabel}`, { description: action.text });
  };

  const handleProcessLink = (action: ActionItem) => {
    if (action.processLink) navigate(action.processLink);
  };

  return (
    <>
      <Card className="border-accent/30 bg-accent/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle2 className="h-4 w-4 text-accent" />
              </div>
              O que fazer hoje
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
          {filtered.map((action) => {
            const isDone = completed.has(action.id);
            const isMeeting = !!action.meetingEvent;
            return (
              <div
                key={action.id}
                className={`flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-muted/50 group ${isDone ? "opacity-50" : ""} ${isMeeting ? "border-l-2 border-l-success" : ""}`}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessLink(action);
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={isMeeting ? "default" : "outline"}
                    className={`h-8 text-xs gap-1.5 ${isMeeting ? "bg-success text-success-foreground hover:bg-success/90" : "border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(action);
                    }}
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
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">Nenhuma ação com esse filtro.</p>
              <p className="text-xs text-muted-foreground">Aqui aparecem automaticamente: prazos (Processos), honorários em atraso (Financeiro), eventos de hoje (Agenda) e itens da Inbox. Para adicionar tarefas do dia, use a <Button variant="link" className="h-auto p-0 text-xs" asChild><Link to="/inbox">Inbox</Link></Button>.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <JoinMeetingModal open={!!joinEvent} onOpenChange={(open) => !open && setJoinEvent(null)} event={joinEvent} />
    </>
  );
};

export default TodayActions;

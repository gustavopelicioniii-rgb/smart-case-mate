import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Calendar as CalendarIcon, RefreshCw, ExternalLink,
  Video, Loader2, Unplug, Link2, MapPin, Clock, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarView from "@/components/agenda/CalendarView";
import AgendaSubNav from "@/components/agenda/AgendaSubNav";
import MeetingCard from "@/components/agenda/MeetingCard";
import NewMeetingModal from "@/components/agenda/NewMeetingModal";
import { useGoogleCalendar, type GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const GoogleEventCard = ({ event }: { event: GoogleCalendarEvent }) => {
  const startStr = event.start.dateTime || event.start.date || "";
  const endStr = event.end.dateTime || event.end.date || "";
  const startDate = startStr ? parseISO(startStr) : null;
  const hasMeet = !!event.hangoutLink;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Google Calendar
              </Badge>
              {hasMeet && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Video className="mr-1 h-3 w-3" /> Meet
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{event.summary || "Sem título"}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {startDate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(startDate, "dd/MM HH:mm", { locale: ptBR })}
                  {endStr && event.end.dateTime && ` – ${format(parseISO(endStr), "HH:mm")}`}
                </span>
              )}
              {event.attendees && event.attendees.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.attendees.length} participante(s)
                </span>
              )}
            </div>
            {event.location && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {event.location}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {hasMeet && (
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700 gap-1.5 h-8 text-xs"
                onClick={() => window.open(event.hangoutLink, '_blank')}
              >
                <Video className="h-3.5 w-3.5" /> Entrar
              </Button>
            )}
            {event.htmlLink && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(event.htmlLink, '_blank')}>
                <ExternalLink className="h-3 w-3" /> Abrir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Agenda = () => {
  const [tab, setTab] = useState("hoje");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [mainTab, setMainTab] = useState("local");

  const gcal = useGoogleCalendar();
  const localEvents = useMemo(() => [], []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      : today;

    switch (tab) {
      case "hoje": {
        return localEvents.filter((e: { data: Date }) => {
          const d = new Date(e.data);
          const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          return eventDay.getTime() === targetDate.getTime();
        });
      }
      case "semana": {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return localEvents.filter((e: { data: Date }) => {
          const d = new Date(e.data);
          return d >= today && d <= weekEnd;
        });
      }
      case "audiencias":
        return localEvents.filter((e: { tipo: string }) => e.tipo === "audiencia");
      case "reunioes":
        return localEvents.filter(
          (e: { tipo: string }) => e.tipo === "reuniao" || e.tipo === "reuniao-meet" || e.tipo === "reuniao-zoom"
        );
      default:
        return localEvents;
    }
  }, [tab, selectedDate, localEvents]);

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Hoje";

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Agenda</h1>
            <p className="mt-1 text-muted-foreground capitalize">{formattedDate}</p>
          </div>
          <div className="flex gap-2">
            {gcal.isConnected ? (
              <>
                <Button variant="outline" size="sm" onClick={gcal.refresh} disabled={gcal.isLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${gcal.isLoading ? "animate-spin" : ""}`} />
                  Sincronizar
                </Button>
                <Button variant="ghost" size="sm" onClick={gcal.disconnect}>
                  <Unplug className="mr-2 h-4 w-4" /> Desconectar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={gcal.connect}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Conectar Google Calendar
              </Button>
            )}
            <Button onClick={() => setNewMeetingOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Reunião
            </Button>
          </div>
        </div>

        {/* Google Calendar status */}
        {gcal.isConnected && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-800 dark:text-green-300 font-medium">
              Google Calendar conectado
            </span>
            <span className="text-xs text-green-600 dark:text-green-400">
              — {gcal.events.length} evento(s) sincronizado(s) dos próximos 30 dias
            </span>
          </div>
        )}

        {/* Tabs: Agenda Local vs Google Calendar */}
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" /> Agenda Local
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10z" fill="#4285F4"/><path d="M12 2v10l8.66 5A10 10 0 0012 2z" fill="#34A853"/><path d="M12 12l8.66 5A10 10 0 0122 12H12z" fill="#FBBC05"/><path d="M2 12a10 10 0 0010 10V12H2z" fill="#EA4335"/></svg>
              Google Calendar
              {gcal.isConnected && gcal.events.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{gcal.events.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="mt-4 space-y-6">
            {/* Sub-nav */}
            <AgendaSubNav value={tab} onChange={setTab} />

            {/* Layout 2 colunas */}
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
              <div className="order-2 lg:order-1">
                <CalendarView
                  events={localEvents}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    setSelectedDate(d);
                    setTab("hoje");
                  }}
                />
              </div>

              <div className="order-1 lg:order-2 space-y-3">
                {filteredEvents.length > 0 ? (
                  [...filteredEvents]
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((event) => <MeetingCard key={event.id} event={event} />)
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum evento para este período.</p>
                    <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setNewMeetingOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Agendar reunião
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="google" className="mt-4">
            {!gcal.isConnected ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Conecte seu Google Calendar</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-6">
                    Sincronize sua agenda do Google com o sistema. Seus eventos, reuniões Meet e compromissos
                    aparecerão aqui automaticamente. A sincronização é bidirecional.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={gcal.connect} size="lg" className="gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Conectar Google Calendar
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Configure o Client ID nas <strong>Configurações</strong> primeiro.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : gcal.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Sincronizando eventos...</span>
              </div>
            ) : gcal.events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhum evento encontrado nos próximos 30 dias.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={gcal.refresh}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{gcal.events.length} evento(s) dos próximos 30 dias</p>
                  <Button variant="ghost" size="sm" onClick={gcal.refresh}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
                  </Button>
                </div>
                {gcal.events.map((event) => (
                  <GoogleEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <NewMeetingModal open={newMeetingOpen} onOpenChange={setNewMeetingOpen} />
    </>
  );
};

export default Agenda;

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/agenda/CalendarView";
import AgendaSubNav from "@/components/agenda/AgendaSubNav";
import MeetingCard from "@/components/agenda/MeetingCard";
import NewMeetingModal from "@/components/agenda/NewMeetingModal";
import { mockEvents } from "@/data/mockMeetings";

const Agenda = () => {
  const [tab, setTab] = useState("hoje");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // If a specific date is selected and tab is "hoje", show that date's events
    const targetDate = selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      : today;

    switch (tab) {
      case "hoje": {
        return mockEvents.filter((e) => {
          const d = new Date(e.data);
          const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          return eventDay.getTime() === targetDate.getTime();
        });
      }
      case "semana": {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return mockEvents.filter((e) => {
          const d = new Date(e.data);
          return d >= today && d <= weekEnd;
        });
      }
      case "audiencias":
        return mockEvents.filter((e) => e.tipo === "audiencia");
      case "reunioes":
        return mockEvents.filter(
          (e) => e.tipo === "reuniao" || e.tipo === "reuniao-meet" || e.tipo === "reuniao-zoom"
        );
      default:
        return mockEvents;
    }
  }, [tab, selectedDate]);

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
          <Button onClick={() => setNewMeetingOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Reunião
          </Button>
        </div>

        {/* Sub-nav */}
        <AgendaSubNav value={tab} onChange={setTab} />

        {/* Layout 2 colunas */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Calendário */}
          <div className="order-2 lg:order-1">
            <CalendarView
              events={mockEvents}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setTab("hoje");
              }}
            />
          </div>

          {/* Lista de eventos */}
          <div className="order-1 lg:order-2 space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents
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
      </motion.div>

      <NewMeetingModal open={newMeetingOpen} onOpenChange={setNewMeetingOpen} />
    </>
  );
};

export default Agenda;

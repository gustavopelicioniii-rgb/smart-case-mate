import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { AgendaEvent, eventTypeConfig, EventType } from "@/types/agenda";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: AgendaEvent[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const dotColorMap: Record<EventType, string> = {
  audiencia: "bg-destructive",
  reuniao: "bg-info",
  prazo: "bg-warning",
  "reuniao-meet": "bg-success",
  "reuniao-zoom": "bg-info",
};

const CalendarView = ({ events, selectedDate, onSelectDate }: CalendarViewProps) => {
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventType[]>();
    events.forEach((e) => {
      const key = new Date(e.data).toDateString();
      if (!map.has(key)) map.set(key, []);
      const types = map.get(key)!;
      if (!types.includes(e.tipo)) types.push(e.tipo);
    });
    return map;
  }, [events]);

  const modifiers = useMemo(() => {
    const dates = Array.from(eventsByDate.keys()).map((d) => new Date(d));
    return { hasEvent: dates };
  }, [eventsByDate]);

  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        className="p-3 pointer-events-auto w-full"
        modifiers={modifiers}
        components={{
          DayContent: ({ date, ...props }) => {
            const key = date.toDateString();
            const types = eventsByDate.get(key);
            return (
              <div className="relative flex flex-col items-center">
                <span>{date.getDate()}</span>
                {types && types.length > 0 && (
                  <div className="flex gap-0.5 absolute -bottom-1">
                    {types.slice(0, 3).map((t, i) => (
                      <span key={i} className={cn("h-1 w-1 rounded-full", dotColorMap[t])} />
                    ))}
                  </div>
                )}
              </div>
            );
          },
        }}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-3 pb-2 pt-1">
        {[
          { type: "audiencia" as EventType, label: "Audiência" },
          { type: "reuniao-meet" as EventType, label: "Meet/Zoom" },
          { type: "prazo" as EventType, label: "Prazo" },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", dotColorMap[type])} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;

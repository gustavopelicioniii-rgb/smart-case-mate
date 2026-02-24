import { useState } from "react";
import { Video, MapPin, Clock, Edit, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgendaEvent, eventTypeConfig } from "@/types/agenda";
import JoinMeetingModal from "./JoinMeetingModal";

interface MeetingCardProps {
  event: AgendaEvent;
  compact?: boolean;
}

const getUrgencyBadge = (event: AgendaEvent) => {
  const now = new Date();
  const eventDate = new Date(event.data);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const diffDays = Math.ceil((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays === 0) {
    const [h, m] = event.hora.split(":").map(Number);
    const eventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (eventTime.getTime() - now.getTime() < 60 * 60 * 1000 && eventTime > now) {
      return { label: "Urgente", variant: "destructive" as const };
    }
    return { label: "Hoje", variant: "default" as const };
  }
  if (diffDays <= 3) return { label: "Em breve", variant: "secondary" as const };
  return null;
};

const isOnlineMeeting = (tipo: string) => tipo === "reuniao-meet" || tipo === "reuniao-zoom";

const MeetingCard = ({ event, compact }: MeetingCardProps) => {
  const [joinOpen, setJoinOpen] = useState(false);
  const config = eventTypeConfig[event.tipo];
  const urgency = getUrgencyBadge(event);
  const online = isOnlineMeeting(event.tipo);

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                {urgency && (
                  <Badge variant={urgency.variant} className="text-xs">
                    {urgency.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{event.titulo}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.hora}{event.horaFim && ` – ${event.horaFim}`}
                </span>
                {event.cliente && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.cliente}
                  </span>
                )}
              </div>
              {event.local && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {event.local}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              {online && (
                <Button
                  size="sm"
                  className="bg-success text-success-foreground hover:bg-success/90 gap-1.5 h-8 text-xs"
                  onClick={() => setJoinOpen(true)}
                >
                  <Video className="h-3.5 w-3.5" />
                  Entrar
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Edit className="h-3 w-3" />
                {!compact && "Editar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <JoinMeetingModal open={joinOpen} onOpenChange={setJoinOpen} event={event} />
    </>
  );
};

export default MeetingCard;

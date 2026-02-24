export type MeetingType = "presencial" | "google-meet" | "zoom";
export type MeetingStatus = "agendada" | "em-andamento" | "concluida" | "cancelada";
export type EventType = "audiencia" | "reuniao" | "prazo" | "reuniao-meet" | "reuniao-zoom";

export interface Meeting {
  id: string;
  titulo: string;
  cliente: string;
  clienteId?: string;
  processo?: string;
  processoId?: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  participantes: string[];
  tipo: MeetingType;
  link?: string;
  status: MeetingStatus;
  descricao?: string;
}

export interface AgendaEvent {
  id: string;
  titulo: string;
  tipo: EventType;
  data: Date;
  hora: string;
  horaFim?: string;
  cliente?: string;
  clienteId?: string;
  processo?: string;
  processoId?: string;
  local?: string;
  link?: string;
  status?: MeetingStatus;
  participantes?: string[];
}

export const eventTypeConfig: Record<EventType, { label: string; color: string; bgColor: string }> = {
  audiencia: { label: "Audiência", color: "text-destructive", bgColor: "bg-destructive/10" },
  reuniao: { label: "Reunião", color: "text-info", bgColor: "bg-info/10" },
  prazo: { label: "Prazo", color: "text-warning", bgColor: "bg-warning/10" },
  "reuniao-meet": { label: "Google Meet", color: "text-success", bgColor: "bg-success/10" },
  "reuniao-zoom": { label: "Zoom", color: "text-info", bgColor: "bg-info/10" },
};

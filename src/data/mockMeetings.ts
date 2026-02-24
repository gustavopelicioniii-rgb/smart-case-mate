import { AgendaEvent } from "@/types/agenda";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(today.getDate() + 2);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 5);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

export const mockEvents: AgendaEvent[] = [
  {
    id: "evt-1",
    titulo: "Audiência – Maria Silva",
    tipo: "audiencia",
    data: today,
    hora: "09:00",
    horaFim: "10:30",
    cliente: "Maria Silva",
    clienteId: "7",
    processo: "0012345-67.2024.8.26.0100",
    processoId: "1",
    local: "TRT-2, Sala 5",
    status: "agendada",
  },
  {
    id: "evt-2",
    titulo: "Reunião inicial – Roberto Lima",
    tipo: "reuniao-meet",
    data: today,
    hora: "11:00",
    horaFim: "11:45",
    cliente: "Roberto Lima",
    clienteId: "1",
    link: "https://meet.google.com/abc-defg-hij",
    status: "agendada",
    participantes: ["Dr. Advogado", "Roberto Lima"],
  },
  {
    id: "evt-3",
    titulo: "Prazo: Contestação Proc. 0012345",
    tipo: "prazo",
    data: tomorrow,
    hora: "23:59",
    cliente: "Maria Silva",
    clienteId: "7",
    processo: "0012345-67.2024.8.26.0100",
    processoId: "1",
    status: "agendada",
  },
  {
    id: "evt-4",
    titulo: "Reunião estratégia – Empresa ABC",
    tipo: "reuniao-zoom",
    data: today,
    hora: "14:30",
    horaFim: "15:30",
    cliente: "Empresa ABC Ltda",
    clienteId: "6",
    processo: "1234567-89.2025.8.26.0100",
    processoId: "3",
    link: "https://zoom.us/j/1234567890",
    status: "agendada",
    participantes: ["Dr. Advogado", "Juliana Alves", "Empresa ABC Ltda"],
  },
  {
    id: "evt-5",
    titulo: "Despacho – Carlos Oliveira",
    tipo: "audiencia",
    data: tomorrow,
    hora: "16:00",
    horaFim: "16:30",
    cliente: "Carlos Oliveira",
    clienteId: "4",
    processo: "0054321-12.2025.8.26.0100",
    processoId: "4",
    local: "TJ-SP, 5ª Vara",
    status: "agendada",
  },
  {
    id: "evt-6",
    titulo: "Consulta inicial – Fernanda Costa",
    tipo: "reuniao-meet",
    data: dayAfter,
    hora: "10:00",
    horaFim: "10:30",
    cliente: "Fernanda Costa",
    clienteId: "2",
    link: "https://meet.google.com/xyz-uvwx-rst",
    status: "agendada",
    participantes: ["Dr. Advogado", "Fernanda Costa"],
  },
  {
    id: "evt-7",
    titulo: "Prazo: Recurso Proc. 0098765",
    tipo: "prazo",
    data: nextWeek,
    hora: "23:59",
    cliente: "João Santos",
    clienteId: "8",
    processo: "0098765-43.2024.5.02.0001",
    processoId: "2",
    status: "agendada",
  },
  {
    id: "evt-8",
    titulo: "Reunião presencial – Patricia Souza",
    tipo: "reuniao",
    data: dayAfter,
    hora: "15:00",
    horaFim: "16:00",
    cliente: "Patricia Souza",
    clienteId: "4",
    local: "Escritório – Sala de Reuniões",
    status: "agendada",
    participantes: ["Dr. Advogado", "Patricia Souza"],
  },
];

export const mockClients = [
  { id: "1", name: "Roberto Lima" },
  { id: "2", name: "Fernanda Costa" },
  { id: "3", name: "Lucas Mendes" },
  { id: "4", name: "Patricia Souza" },
  { id: "5", name: "Marcos Dias" },
  { id: "6", name: "Juliana Alves" },
  { id: "7", name: "Maria Silva" },
  { id: "8", name: "João Santos" },
];

export const mockProcessos = [
  { id: "1", number: "0012345-67.2024.8.26.0100", client: "Maria Silva" },
  { id: "2", number: "0098765-43.2024.5.02.0001", client: "João Santos" },
  { id: "3", number: "1234567-89.2025.8.26.0100", client: "Empresa ABC Ltda" },
  { id: "4", number: "0054321-12.2025.8.26.0100", client: "Carlos Oliveira" },
  { id: "5", number: "0011223-44.2025.5.15.0001", client: "Ana Pereira" },
];

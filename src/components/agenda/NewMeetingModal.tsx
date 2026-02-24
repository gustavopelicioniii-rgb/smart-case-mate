import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Video, MapPin, Link as LinkIcon, Users, Clock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mockClients, mockProcessos } from "@/data/mockMeetings";
import type { MeetingType } from "@/types/agenda";

interface NewMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewMeetingModal = ({ open, onOpenChange }: NewMeetingModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [processoId, setProcessoId] = useState("");
  const [data, setData] = useState<Date>();
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("10:00");
  const [participantes, setParticipantes] = useState("");
  const [tipo, setTipo] = useState<MeetingType>("presencial");
  const [link, setLink] = useState("");

  const handleGenerateLink = () => {
    const fakeLink =
      tipo === "google-meet"
        ? `https://meet.google.com/${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`
        : `https://zoom.us/j/${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    setLink(fakeLink);
    toast.success("Link gerado automaticamente");
  };

  const handleCreate = () => {
    if (!titulo || !data) {
      toast.error("Preencha ao menos o título e a data.");
      return;
    }
    toast.success("Reunião criada com sucesso!", { description: `${titulo} – ${format(data, "dd/MM/yyyy")} às ${horaInicio}` });
    onOpenChange(false);
    // Reset
    setTitulo(""); setClienteId(""); setProcessoId(""); setData(undefined);
    setHoraInicio("09:00"); setHoraFim("10:00"); setParticipantes(""); setTipo("presencial"); setLink("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Reunião</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Titulo */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título da reunião</Label>
            <Input id="titulo" placeholder="Ex: Consulta inicial" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          {/* Cliente + Processo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {mockClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Processo (opcional)</Label>
              <Select value={processoId} onValueChange={setProcessoId}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  {mockProcessos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.number.slice(0, 20)}…</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data + Horários */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !data && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "dd/MM/yy") : "Escolher"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={data} onSelect={setData} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-1.5">
            <Label>Participantes</Label>
            <Input placeholder="Ex: Dr. João, Maria (separar por vírgula)" value={participantes} onChange={(e) => setParticipantes(e.target.value)} />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo da reunião</Label>
            <RadioGroup value={tipo} onValueChange={(v) => { setTipo(v as MeetingType); setLink(""); }} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="presencial" id="presencial" />
                <Label htmlFor="presencial" className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <MapPin className="h-3.5 w-3.5" /> Presencial
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="google-meet" id="google-meet" />
                <Label htmlFor="google-meet" className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Video className="h-3.5 w-3.5 text-success" /> Google Meet
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="zoom" id="zoom" />
                <Label htmlFor="zoom" className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Video className="h-3.5 w-3.5 text-info" /> Zoom
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Link field for online meetings */}
          {(tipo === "google-meet" || tipo === "zoom") && (
            <div className="space-y-1.5">
              <Label>Link da reunião</Label>
              <div className="flex gap-2">
                <Input placeholder={`Link do ${tipo === "google-meet" ? "Google Meet" : "Zoom"}`} value={link} onChange={(e) => setLink(e.target.value)} className="flex-1" />
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleGenerateLink}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar link
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate}>Criar reunião</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewMeetingModal;

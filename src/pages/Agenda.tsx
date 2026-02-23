import { motion } from "framer-motion";
import { Calendar, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const events = [
  { time: "09:00", title: "Audiência – Maria Silva", type: "Trabalhista", location: "TRT-2, Sala 5" },
  { time: "11:00", title: "Reunião com cliente – Empresa ABC", type: "Consulta", location: "Escritório" },
  { time: "14:30", title: "Prazo: Contestação Proc. 0012345", type: "Prazo", location: "—" },
  { time: "16:00", title: "Despacho – Carlos Oliveira", type: "Cível", location: "TJ-SP, 5ª Vara" },
];

const typeColor: Record<string, string> = {
  Trabalhista: "bg-info/10 text-info",
  Consulta: "bg-accent/10 text-accent",
  Prazo: "bg-destructive/10 text-destructive",
  Cível: "bg-primary/10 text-primary",
};

const Agenda = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Agenda</h1>
        <p className="mt-1 text-muted-foreground">Compromissos e prazos do dia.</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Novo Evento
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Hoje — 23 Fev 2026
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-all cursor-pointer">
            <div className="flex flex-col items-center shrink-0 w-14">
              <Clock className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-bold text-foreground">{e.time}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.location}</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold h-fit ${typeColor[e.type] || "bg-muted text-muted-foreground"}`}>
              {e.type}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  </motion.div>
);

export default Agenda;

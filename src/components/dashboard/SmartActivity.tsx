import { Brain, Users, DollarSign, Scale, RefreshCw, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  { text: "IA sugeriu tese alternativa para Proc. 0012345", time: "Há 30min", icon: Brain, type: "ai" },
  { text: "Processo 0098765 mudou de fase: Instrução → Sentença", time: "Há 1h", icon: RefreshCw, type: "process" },
  { text: "Cliente Pedro Almeida visualizou atualização", time: "Há 2h", icon: Eye, type: "client" },
  { text: "Honorário recebido: R$ 3.500 – João Santos", time: "Há 4h", icon: DollarSign, type: "financial" },
  { text: "Novo lead captado: Ana Costa (Trabalhista)", time: "Há 6h", icon: Users, type: "crm" },
  { text: "Decisão resumida por IA: Proc. 0054321", time: "Há 1d", icon: Scale, type: "ai" },
];

const typeStyles = {
  ai: "bg-info/10 text-info",
  process: "bg-warning/10 text-warning",
  client: "bg-success/10 text-success",
  financial: "bg-accent/10 text-accent",
  crm: "bg-primary/10 text-primary",
};

const SmartActivity = () => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="font-display text-xl">⚡ Atividade Inteligente</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div
            key={i}
            className="flex gap-3 group cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-all"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeStyles[a.type as keyof typeof typeStyles]}`}>
              <a.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground group-hover:text-primary transition-colors">{a.text}</p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SmartActivity;

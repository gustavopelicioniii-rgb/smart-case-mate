import { motion } from "framer-motion";
import { Plus, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
}

type Stage = "Lead" | "Consulta" | "Contrato" | "Processo";

const pipeline: Record<Stage, Client[]> = {
  Lead: [
    { id: "1", name: "Roberto Lima", email: "roberto@email.com", phone: "(11) 99999-0001", source: "Instagram" },
    { id: "2", name: "Fernanda Costa", email: "fernanda@email.com", phone: "(11) 99999-0002", source: "Indicação" },
    { id: "3", name: "Lucas Mendes", email: "lucas@email.com", phone: "(11) 99999-0003", source: "Site" },
  ],
  Consulta: [
    { id: "4", name: "Patricia Souza", email: "patricia@email.com", phone: "(11) 99999-0004", source: "Indicação" },
    { id: "5", name: "Marcos Dias", email: "marcos@email.com", phone: "(11) 99999-0005", source: "Google" },
  ],
  Contrato: [
    { id: "6", name: "Juliana Alves", email: "juliana@email.com", phone: "(11) 99999-0006", source: "Indicação" },
  ],
  Processo: [
    { id: "7", name: "Maria Silva", email: "maria@email.com", phone: "(11) 99999-0007", source: "Indicação" },
    { id: "8", name: "João Santos", email: "joao@email.com", phone: "(11) 99999-0008", source: "Site" },
  ],
};

const stageColors: Record<Stage, string> = {
  Lead: "bg-info/10 text-info",
  Consulta: "bg-warning/10 text-warning",
  Contrato: "bg-accent/10 text-accent",
  Processo: "bg-success/10 text-success",
};

const CRM = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">CRM Jurídico</h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe seus clientes do primeiro contato ao processo.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Pipeline */}
      <div className="grid gap-4 lg:grid-cols-4">
        {(Object.entries(pipeline) as [Stage, Client[]][]).map(([stage, clients]) => (
          <div key={stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{stage}</h3>
                <Badge variant="secondary" className="text-xs">
                  {clients.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {clients.map((client) => (
                <Card
                  key={client.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${stageColors[stage]}`}
                        >
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{client.source}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CRM;

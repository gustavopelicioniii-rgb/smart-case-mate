import { motion } from "framer-motion";
import { BarChart3, Download, TrendingUp, Scale, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reports = [
  { title: "Processos por Fase", description: "Distribuição de processos ativos por fase processual", icon: Scale, color: "bg-primary/10 text-primary" },
  { title: "Receita Mensal", description: "Evolução de receita nos últimos 12 meses", icon: DollarSign, color: "bg-success/10 text-success" },
  { title: "Performance do Pipeline", description: "Taxa de conversão de leads em clientes", icon: TrendingUp, color: "bg-info/10 text-info" },
  { title: "Clientes por Área", description: "Distribuição de clientes por área do direito", icon: Users, color: "bg-accent/10 text-accent" },
];

const Relatorios = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="mt-1 text-muted-foreground">Análises e métricas do seu escritório.</p>
      </div>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {reports.map((r, i) => (
        <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${r.color} group-hover:scale-110 transition-transform`}>
                <r.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{r.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                <Button variant="link" className="px-0 mt-2 text-primary">
                  Ver relatório →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </motion.div>
);

export default Relatorios;

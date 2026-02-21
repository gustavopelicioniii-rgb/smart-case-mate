import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fees = [
  { id: "1", client: "Maria Silva", process: "0012345-67.2024", description: "Honorários advocatícios", value: "R$ 5.000", status: "Pago" as const, date: "10 Fev 2026" },
  { id: "2", client: "João Santos", process: "0098765-43.2024", description: "Honorários de êxito", value: "R$ 12.000", status: "Pendente" as const, date: "15 Fev 2026" },
  { id: "3", client: "Empresa ABC Ltda", process: "1234567-89.2025", description: "Honorários contratuais", value: "R$ 8.500", status: "Pago" as const, date: "01 Fev 2026" },
  { id: "4", client: "Carlos Oliveira", process: "0054321-12.2025", description: "Consulta jurídica", value: "R$ 1.500", status: "Pendente" as const, date: "20 Fev 2026" },
  { id: "5", client: "Ana Pereira", process: "0011223-44.2025", description: "Honorários iniciais", value: "R$ 5.450", status: "Pago" as const, date: "05 Fev 2026" },
];

const Financeiro = () => {
  const totalPago = 18950;
  const totalPendente = 13500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="mt-1 text-muted-foreground">
            Controle de honorários e receita do escritório.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Honorário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Total (Fev)</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {(totalPago + totalPendente).toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalPago.toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalPendente.toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display text-xl">Honorários</CardTitle>
          <Button variant="ghost" size="sm">
            Ver relatório <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.client}</TableCell>
                  <TableCell className="font-mono text-xs">{f.process}</TableCell>
                  <TableCell>{f.description}</TableCell>
                  <TableCell className="font-semibold">{f.value}</TableCell>
                  <TableCell>
                    <Badge variant={f.status === "Pago" ? "default" : "secondary"}>
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Financeiro;

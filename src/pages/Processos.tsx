import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Plus,
  Search,
  Filter,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProcessStatus = "Em andamento" | "Aguardando prazo" | "Concluído" | "Suspenso";

interface Process {
  id: string;
  number: string;
  client: string;
  court: string;
  phase: string;
  status: ProcessStatus;
  nextDeadline: string;
  value: string;
}

const mockProcesses: Process[] = [
  {
    id: "1",
    number: "0012345-67.2024.8.26.0100",
    client: "Maria Silva",
    court: "TJ-SP",
    phase: "Instrução",
    status: "Aguardando prazo",
    nextDeadline: "23 Fev 2026",
    value: "R$ 50.000",
  },
  {
    id: "2",
    number: "0098765-43.2024.5.02.0001",
    client: "João Santos",
    court: "TRT-2",
    phase: "Recurso",
    status: "Em andamento",
    nextDeadline: "25 Fev 2026",
    value: "R$ 120.000",
  },
  {
    id: "3",
    number: "1234567-89.2025.8.26.0100",
    client: "Empresa ABC Ltda",
    court: "TJ-SP",
    phase: "Conhecimento",
    status: "Em andamento",
    nextDeadline: "28 Fev 2026",
    value: "R$ 85.000",
  },
  {
    id: "4",
    number: "0054321-12.2025.8.26.0100",
    client: "Carlos Oliveira",
    court: "TJ-SP",
    phase: "Execução",
    status: "Concluído",
    nextDeadline: "—",
    value: "R$ 35.000",
  },
  {
    id: "5",
    number: "0011223-44.2025.5.15.0001",
    client: "Ana Pereira",
    court: "TRT-15",
    phase: "Petição Inicial",
    status: "Em andamento",
    nextDeadline: "05 Mar 2026",
    value: "R$ 200.000",
  },
];

const statusColor: Record<ProcessStatus, string> = {
  "Em andamento": "bg-info/10 text-info border-info/20",
  "Aguardando prazo": "bg-warning/10 text-warning border-warning/20",
  "Concluído": "bg-success/10 text-success border-success/20",
  "Suspenso": "bg-muted text-muted-foreground border-border",
};

const Processos = () => {
  const [search, setSearch] = useState("");

  const filtered = mockProcesses.filter(
    (p) =>
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.number.includes(search)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Processos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie e acompanhe todos os seus processos.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: "24", icon: Scale },
          { label: "Em andamento", value: "15", icon: ArrowUpRight },
          { label: "Aguardando prazo", value: "6", icon: Clock },
          { label: "Concluídos", value: "3", icon: Scale },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display text-xl">Todos os Processos</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou número..."
                className="pl-9 w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tribunal</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próximo Prazo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell className="font-mono text-xs">{p.number}</TableCell>
                  <TableCell className="font-medium">{p.client}</TableCell>
                  <TableCell>{p.court}</TableCell>
                  <TableCell>{p.phase}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{p.nextDeadline}</TableCell>
                  <TableCell className="font-medium">{p.value}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Processos;

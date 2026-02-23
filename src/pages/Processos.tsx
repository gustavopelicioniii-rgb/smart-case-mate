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
  User,
  Building,
  FileText,
  Calendar,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ProcessStatus = "Em andamento" | "Aguardando prazo" | "Concluído" | "Suspenso";

interface Process {
  id: string;
  number: string;
  client: string;
  court: string;
  class: string;
  subject: string;
  activeParty: string;
  passiveParty: string;
  responsible: string;
  phase: string;
  status: ProcessStatus;
  nextDeadline: string;
  lastMovement: string;
  value: string;
  docsCount: number;
}

const mockProcesses: Process[] = [
  {
    id: "1", number: "0012345-67.2024.8.26.0100", client: "Maria Silva", court: "TJ-SP",
    class: "Procedimento Comum Cível", subject: "Indenização por Danos Morais",
    activeParty: "Maria Silva", passiveParty: "Empresa XYZ S.A.",
    responsible: "Dr. Advogado", phase: "Instrução", status: "Aguardando prazo",
    nextDeadline: "23 Fev 2026", lastMovement: "Intimação para contestação",
    value: "R$ 50.000", docsCount: 4,
  },
  {
    id: "2", number: "0098765-43.2024.5.02.0001", client: "João Santos", court: "TRT-2",
    class: "Reclamação Trabalhista", subject: "Verbas Rescisórias",
    activeParty: "João Santos", passiveParty: "Comércio Beta Ltda",
    responsible: "Dr. Advogado", phase: "Recurso", status: "Em andamento",
    nextDeadline: "25 Fev 2026", lastMovement: "Sentença proferida",
    value: "R$ 120.000", docsCount: 8,
  },
  {
    id: "3", number: "1234567-89.2025.8.26.0100", client: "Empresa ABC Ltda", court: "TJ-SP",
    class: "Procedimento Comum Cível", subject: "Cobrança",
    activeParty: "Empresa ABC Ltda", passiveParty: "Fornecedor Gama ME",
    responsible: "Dr. Advogado", phase: "Conhecimento", status: "Em andamento",
    nextDeadline: "28 Fev 2026", lastMovement: "Despacho para perícia",
    value: "R$ 85.000", docsCount: 3,
  },
  {
    id: "4", number: "0054321-12.2025.8.26.0100", client: "Carlos Oliveira", court: "TJ-SP",
    class: "Execução de Título", subject: "Execução de Sentença",
    activeParty: "Carlos Oliveira", passiveParty: "Delta Seguros S.A.",
    responsible: "Dr. Advogado", phase: "Execução", status: "Concluído",
    nextDeadline: "—", lastMovement: "Trânsito em julgado",
    value: "R$ 35.000", docsCount: 12,
  },
  {
    id: "5", number: "0011223-44.2025.5.15.0001", client: "Ana Pereira", court: "TRT-15",
    class: "Reclamação Trabalhista", subject: "Horas Extras",
    activeParty: "Ana Pereira", passiveParty: "Indústria Omega Ltda",
    responsible: "Dr. Advogado", phase: "Petição Inicial", status: "Em andamento",
    nextDeadline: "05 Mar 2026", lastMovement: "Distribuição",
    value: "R$ 200.000", docsCount: 2,
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
      p.number.includes(search) ||
      p.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TooltipProvider>
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
                  placeholder="Buscar por cliente, número ou assunto..."
                  className="pl-9 w-80"
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
                  <TableHead>Cliente / Partes</TableHead>
                  <TableHead>Tribunal</TableHead>
                  <TableHead>Classe / Assunto</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Próx. Prazo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <Tooltip key={p.id}>
                    <TooltipTrigger asChild>
                      <TableRow className="cursor-pointer">
                        <TableCell className="font-mono text-xs">{p.number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{p.client}</p>
                            <p className="text-xs text-muted-foreground">{p.activeParty} vs {p.passiveParty}</p>
                          </div>
                        </TableCell>
                        <TableCell>{p.court}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{p.class}</p>
                            <p className="text-xs text-muted-foreground">{p.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell>{p.phase}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor[p.status]}`}>
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
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm">
                      <div className="space-y-1.5">
                        <p className="font-semibold">{p.client}</p>
                        <p className="text-xs">📋 {p.class} — {p.subject}</p>
                        <p className="text-xs">👤 Responsável: {p.responsible}</p>
                        <p className="text-xs">📄 Última mov.: {p.lastMovement}</p>
                        <p className="text-xs">📎 {p.docsCount} documentos vinculados</p>
                        <p className="text-xs font-semibold">💰 Valor: {p.value}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default Processos;

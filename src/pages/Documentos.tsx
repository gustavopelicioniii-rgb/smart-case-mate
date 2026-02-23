import { motion } from "framer-motion";
import { FolderOpen, Upload, Search, FileText, Image, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const docs = [
  { name: "Contestação_Maria_Silva_v2.docx", process: "Proc. 0012345", date: "22 Fev 2026", type: "docx", size: "245 KB" },
  { name: "Decisão_Sentença_0098765.pdf", process: "Proc. 0098765", date: "20 Fev 2026", type: "pdf", size: "1.2 MB" },
  { name: "Contrato_Empresa_ABC.pdf", process: "Proc. 1234567", date: "18 Fev 2026", type: "pdf", size: "890 KB" },
  { name: "Procuração_Carlos_Oliveira.pdf", process: "Proc. 0054321", date: "15 Fev 2026", type: "pdf", size: "120 KB" },
  { name: "Comprovante_Pagamento.jpg", process: "Proc. 0012345", date: "14 Fev 2026", type: "img", size: "340 KB" },
];

const typeIcon: Record<string, React.ElementType> = { docx: FileText, pdf: File, img: Image };

const Documentos = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Documentos</h1>
        <p className="mt-1 text-muted-foreground">Gestão documental vinculada aos processos.</p>
      </div>
      <Button>
        <Upload className="mr-2 h-4 w-4" />
        Upload
      </Button>
    </div>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-xl">Todos os Documentos</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar documento..." className="pl-9 w-72" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {docs.map((d, i) => {
          const Icon = typeIcon[d.type] || File;
          return (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/50 transition-all cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.process} • {d.size}</p>
              </div>
              <span className="text-xs text-muted-foreground">{d.date}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </motion.div>
);

export default Documentos;

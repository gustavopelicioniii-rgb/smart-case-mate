import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  Upload,
  PenTool,
  Scale,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const pieceTypes = [
  {
    title: "Petição Inicial",
    description: "Gere a peça inaugural com base na decisão e no contexto fornecidos.",
    icon: FileText,
  },
  {
    title: "Contestação",
    description: "Crie uma contestação completa respondendo aos argumentos da parte adversa.",
    icon: MessageSquare,
  },
  {
    title: "Recurso",
    description: "Elabore um recurso com fundamentação jurídica e pedidos adequados.",
    icon: Scale,
  },
];

const Pecas = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Gerador de Peças
          <Sparkles className="ml-2 inline h-6 w-6 text-accent" />
        </h1>
        <p className="mt-1 text-muted-foreground">
          Use inteligência artificial para gerar minutas de peças jurídicas.
        </p>
      </div>

      {/* Upload section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">1. Envie a Decisão</CardTitle>
          <CardDescription>
            Faça upload do PDF da decisão judicial para que a IA analise o conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 transition-colors hover:border-accent/50 hover:bg-muted/50 cursor-pointer">
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Clique para enviar ou arraste o arquivo
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF até 10MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">2. Adicione Contexto</CardTitle>
          <CardDescription>
            Forneça informações adicionais para personalizar a peça gerada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: O cliente é trabalhador rural, contratado em 2018, demitido sem justa causa. Pretende-se reclamar verbas rescisórias, FGTS e seguro-desemprego..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Piece type selection */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">3. Escolha o Tipo de Peça</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {pieceTypes.map((type) => (
              <button
                key={type.title}
                className="group rounded-lg border border-border p-6 text-left transition-all hover:border-accent hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <type.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{type.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar Peça com IA
        </Button>
      </div>
    </motion.div>
  );
};

export default Pecas;

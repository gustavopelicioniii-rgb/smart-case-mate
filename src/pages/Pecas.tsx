import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Loader2, Sparkles, Save, Copy, Trash2, Clock,
  ChevronDown, Settings2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePecas, useSavePeca, useDeletePeca, generateWithGemini } from "@/hooks/usePecas";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIPOS_PECA = [
  "Petição Inicial",
  "Contestação",
  "Réplica",
  "Recurso de Apelação",
  "Agravo de Instrumento",
  "Embargos de Declaração",
  "Habeas Corpus",
  "Mandado de Segurança",
  "Parecer Jurídico",
  "Contrato",
  "Outro",
];

const Pecas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: pecas, isLoading } = usePecas();
  const saveMutation = useSavePeca();
  const deleteMutation = useDeletePeca();

  // Form state
  const [tipo, setTipo] = useState("Petição Inicial");
  const [processNumber, setProcessNumber] = useState("");
  const [context, setContext] = useState("");
  const [title, setTitle] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({ title: "Chave de API necessária", description: "Configure sua chave da API Gemini nas configurações.", variant: "destructive" });
      setShowSettings(true);
      return;
    }
    if (!context.trim()) {
      toast({ title: "Contexto necessário", description: "Descreva o caso e os detalhes para gerar a peça.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Você é um advogado brasileiro sênior especializado.
Gere uma peça jurídica do tipo: "${tipo}".
${processNumber ? `Número do processo: ${processNumber}` : ""}

CONTEXTO DO CASO:
${context}

INSTRUÇÕES:
1. Gere a peça completa, pronta para uso, em formato profissional.
2. Use a linguagem jurídica formal do direito brasileiro.
3. Inclua todos os elementos obrigatórios deste tipo de peça (partes, fatos, fundamentos, pedidos etc).
4. Use artigos de lei quando aplicável (CF, CPC, CC, CP, CLT etc).
5. NÃO inclua instruções ou comentários — apenas o texto final da peça.`;

      const result = await generateWithGemini(apiKey, prompt);
      setGeneratedText(result);
      setTitle(`${tipo} — ${new Date().toLocaleDateString("pt-BR")}`);
      toast({ title: "Peça gerada com sucesso!" });
    } catch (e: any) {
      toast({ title: "Erro ao gerar", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedText) return;
    await saveMutation.mutateAsync({
      title: title || `${tipo} — ${new Date().toLocaleDateString("pt-BR")}`,
      tipo,
      context,
      generated_text: generatedText,
      process_number: processNumber,
      owner_id: user?.id ?? null,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast({ title: "Copiado para a área de transferência!" });
  };

  const loadPeca = (peca: typeof pecas extends (infer T)[] | undefined ? T : never) => {
    setTitle(peca.title);
    setTipo(peca.tipo);
    setContext(peca.context);
    setGeneratedText(peca.generated_text);
    setProcessNumber(peca.process_number);
    setHistoryOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Gerador de Peças</h1>
          <p className="mt-1 text-muted-foreground">
            Gere peças jurídicas com inteligência artificial (Google Gemini).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="mr-2 h-4 w-4" />API
          </Button>
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(!historyOpen)}>
            <Clock className="mr-2 h-4 w-4" />Histórico
          </Button>
        </div>
      </div>

      {/* API Key Settings */}
      {showSettings && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="apiKey">Chave da API Google Gemini</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">aistudio.google.com/apikey</a>. Sua chave fica salva apenas no seu navegador.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>Fechar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />Configurar Peça
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo da Peça</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_PECA.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processNum">Nº do Processo</Label>
                  <Input
                    id="processNum"
                    placeholder="0012345-67.2024"
                    value={processNumber}
                    onChange={(e) => setProcessNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Contexto do Caso *</Label>
                <Textarea
                  id="context"
                  placeholder="Descreva os fatos, a situação do cliente, as partes envolvidas e o resultado esperado. Quanto mais detalhes, melhor será a peça gerada..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={8}
                  className="resize-y"
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Gerando com IA...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" />Gerar Peça</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />Peça Gerada
              </CardTitle>
              {generatedText && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="mr-1 h-3.5 w-3.5" />Copiar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                    <Save className="mr-1 h-3.5 w-3.5" />Salvar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-accent" />
                  <p className="mt-4 text-sm text-muted-foreground">A IA está redigindo sua peça...</p>
                  <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos.</p>
                </div>
              ) : generatedText ? (
                <Textarea
                  className="min-h-[400px] font-mono text-sm resize-y whitespace-pre-wrap"
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm">Preencha o contexto e clique em "Gerar Peça".</p>
                  <p className="text-xs mt-1">A peça aparecerá aqui e poderá ser editada antes de salvar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History (bottom) */}
      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />Peças Salvas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (pecas ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma peça salva ainda.</p>
              ) : (
                (pecas ?? []).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-all cursor-pointer group" onClick={() => loadPeca(p)}>
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.tipo} {p.process_number && `• ${p.process_number}`} • {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{p.tipo}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Peça</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget); setDeleteTarget(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Pecas;

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, ExternalLink, Save } from "lucide-react";
import { getDocumentUrl, getEditedDraftUrl, useSaveEditedDraft } from "@/hooks/useDocuments";
import type { Document } from "@/hooks/useDocuments";
import mammoth from "mammoth";

interface DocumentEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export function DocumentEditorModal({
  open,
  onOpenChange,
  document: doc,
}: DocumentEditorModalProps) {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const initialSetRef = useRef(false);
  const saveDraft = useSaveEditedDraft();

  const isPdf = doc?.mime_type?.toLowerCase().includes("pdf") ?? false;
  const docNameLower = (doc?.name ?? "").toLowerCase();
  const isWord =
    doc?.mime_type?.toLowerCase().includes("word") ||
    doc?.mime_type?.toLowerCase().includes("document") ||
    docNameLower.endsWith(".docx") ||
    docNameLower.endsWith(".doc") ||
    docNameLower.endsWith(".docs");

  const loadWord = useCallback(async () => {
    if (!doc?.file_path) return;
    setLoading(true);
    setError(null);
    initialSetRef.current = false;
    try {
      const draftUrl = getEditedDraftUrl(doc.file_path);
      const draftRes = await fetch(draftUrl);
      if (draftRes.ok) {
        const draftHtml = await draftRes.text();
        setHtml(draftHtml || "");
        setLoading(false);
        return;
      }
      const url = getDocumentUrl(doc.file_path);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao carregar o arquivo.");
      const buf = await res.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      setHtml(result?.value ?? "");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar documento.";
      setError(msg);
      setHtml("");
    } finally {
      setLoading(false);
    }
  }, [doc]);

  useEffect(() => {
    if (open && doc) {
      if (isWord) {
        loadWord().catch(() => {
          setError("Não foi possível abrir o documento para edição.");
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    } else {
      initialSetRef.current = false;
    }
  }, [open, doc, isWord, loadWord]);

  useEffect(() => {
    if (!isWord || loading || !html) return;
    if (editorRef.current && !initialSetRef.current) {
      editorRef.current.innerHTML = html;
      initialSetRef.current = true;
    }
  }, [isWord, loading, html]);

  useEffect(() => {
    if (!isWord || !doc) return;
    let t: ReturnType<typeof setTimeout>;
    const el = editorRef.current;
    if (!el) return;
    const scheduleSave = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const content = editorRef.current?.innerHTML ?? "";
        if (content) saveDraft.mutate({ filePath: doc.file_path, html: content });
      }, 2000);
    };
    el.addEventListener("input", scheduleSave);
    return () => {
      clearTimeout(t);
      el.removeEventListener("input", scheduleSave);
    };
  }, [isWord, doc, saveDraft]);

  if (!doc || typeof doc.id !== "string") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isPdf ? "Visualizar PDF" : isWord ? "Editar documento" : "Documento"}
            — {doc.name ?? "Documento"}
          </DialogTitle>
        </DialogHeader>

        {isPdf && (
          <>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-4 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-medium">Apenas visualização</p>
              <p className="mt-1 text-amber-800 dark:text-amber-200/90">
                PDFs não podem ser editados aqui. Para alterar o conteúdo, use um documento Word (.docx) ou abra este PDF em uma nova aba e use um editor externo.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
                onClick={() => window.open(getDocumentUrl(doc.file_path), "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba (editar fora)
              </Button>
            </div>
            <div className="flex-1 min-h-[50vh] rounded-lg border border-border overflow-hidden bg-muted/30">
              <iframe
                title={doc.name}
                src={getDocumentUrl(doc.file_path)}
                className="w-full h-full min-h-[50vh]"
              />
            </div>
          </>
        )}

        {isWord && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Carregando documento...</span>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-destructive">{error}</div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-muted-foreground">
                    Edite o texto abaixo. As alterações são salvas automaticamente após 2 segundos.
                    {!docNameLower.endsWith(".docx") && !docNameLower.endsWith(".doc") && (
                      <span className="block mt-1"> Para melhor compatibilidade, use arquivos .docx.</span>
                    )}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 flex-shrink-0"
                    disabled={saveDraft.isPending}
                    onClick={() => {
                      const content = editorRef.current?.innerHTML ?? "";
                      if (content && doc) saveDraft.mutate({ filePath: doc.file_path, html: content });
                    }}
                  >
                    {saveDraft.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar agora
                  </Button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-label="Conteúdo do documento editável"
                  className="flex-1 min-h-[50vh] rounded-lg border border-border p-4 bg-background text-foreground overflow-auto prose prose-sm dark:prose-invert max-w-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
          </>
        )}

        {!isPdf && !isWord && (
          <p className="text-sm text-muted-foreground py-4">
            Visualização/edição disponível para PDF e Word (.doc/.docx). Para outros formatos, use &quot;Abrir em nova aba&quot; ou baixe.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

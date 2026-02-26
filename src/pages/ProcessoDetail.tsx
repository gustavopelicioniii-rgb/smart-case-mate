import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft, Clock, Calendar, FileText,
    MessageSquare, Loader2, Plus, Hash, User, MapPin, ExternalLink,
    MoreHorizontal, Pencil, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPOS_ANDAMENTO = ["Movimentação", "Despacho", "Decisão", "Petição", "Outro"];
const TIPOS_AUDIENCIA = ["Conciliação", "Instrução", "Julgamento", "Outra"];
const STATUS_PROCESSO = ["Em andamento", "Aguardando prazo", "Concluído", "Suspenso"] as const;
const PROCESS_DOCS_BUCKET = "documents";

const ProcessoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("timeline");
    const [andamentoOpen, setAndamentoOpen] = useState(false);
    const [audienciaOpen, setAudienciaOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [novoStatus, setNovoStatus] = useState<string>("");
    const [andamentoData, setAndamentoData] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [andamentoTipo, setAndamentoTipo] = useState("Movimentação");
    const [andamentoDescricao, setAndamentoDescricao] = useState("");
    const [audienciaData, setAudienciaData] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [audienciaTipo, setAudienciaTipo] = useState("Conciliação");
    const [audienciaLocal, setAudienciaLocal] = useState("");
    const [audienciaLink, setAudienciaLink] = useState("");
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [noteEditingId, setNoteEditingId] = useState<string | null>(null);
    const [docOpen, setDocOpen] = useState(false);
    const [docTitle, setDocTitle] = useState("");
    const [docUrl, setDocUrl] = useState("");
    const [docDescription, setDocDescription] = useState("");
    const [docFile, setDocFile] = useState<File | null>(null);

    const { data: processo, isLoading } = useQuery({
        queryKey: ['processo', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('processos')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
    });

    const { data: timeline } = useQuery({
        queryKey: ['timeline', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('andamentos')
                .select('*')
                .eq('process_id', id)
                .order('data', { ascending: false });
            if (error) return [];
            return data ?? [];
        },
        enabled: !!id,
    });

    const { data: audiencias } = useQuery({
        queryKey: ['audiencias', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('audiencias')
                .select('*')
                .eq('process_id', id)
                .order('data', { ascending: true });
            if (error) return [];
            return data ?? [];
        },
        enabled: !!id,
    });

    const { data: notes = [] } = useQuery({
        queryKey: ['process_notes', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('process_notes')
                .select('*')
                .eq('process_id', id)
                .order('updated_at', { ascending: false });
            if (error) return [];
            return data ?? [];
        },
        enabled: !!id,
    });

    const { data: documents = [] } = useQuery({
        queryKey: ['process_documents', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('process_documents')
                .select('*')
                .eq('process_id', id)
                .order('created_at', { ascending: false });
            if (error) return [];
            return data ?? [];
        },
        enabled: !!id,
    });

    const createAndamento = useMutation({
        mutationFn: async (payload: { data: string; tipo: string; descricao: string }) => {
            const { error } = await supabase.from('andamentos').insert({
                process_id: id,
                data: payload.data,
                tipo: payload.tipo,
                descricao: payload.descricao,
                owner_id: user?.id ?? null,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', id] });
            toast.success('Andamento adicionado.');
            setAndamentoOpen(false);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const createAudiencia = useMutation({
        mutationFn: async (payload: { data: string; tipo: string; local?: string; link_meet?: string }) => {
            const { error } = await supabase.from('audiencias').insert({
                process_id: id,
                data: payload.data,
                tipo: payload.tipo,
                local: payload.local || null,
                link_meet: payload.link_meet || null,
                status: 'Agendada',
                owner_id: user?.id ?? null,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audiencias', id] });
            toast.success('Audiência agendada.');
            setAudienciaOpen(false);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const updateStatus = useMutation({
        mutationFn: async (status: typeof STATUS_PROCESSO[number]) => {
            const { error } = await supabase.from('processos').update({ status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processo', id] });
            queryClient.invalidateQueries({ queryKey: ['processos'] });
            toast.success('Status atualizado.');
            setStatusOpen(false);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const createNote = useMutation({
        mutationFn: async (content: string) => {
            const { error } = await supabase.from('process_notes').insert({
                process_id: id,
                content,
                owner_id: user?.id ?? null,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['process_notes', id] });
            toast.success('Nota adicionada.');
            setNoteOpen(false);
            setNoteContent('');
            setNoteEditingId(null);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const updateNote = useMutation({
        mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
            const { error } = await supabase.from('process_notes').update({ content }).eq('id', noteId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['process_notes', id] });
            toast.success('Nota atualizada.');
            setNoteOpen(false);
            setNoteContent('');
            setNoteEditingId(null);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const deleteNote = useMutation({
        mutationFn: async (noteId: string) => {
            const { error } = await supabase.from('process_notes').delete().eq('id', noteId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['process_notes', id] });
            toast.success('Nota removida.');
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const createDoc = useMutation({
        mutationFn: async (payload: { title: string; url?: string; file_path?: string; description?: string; file?: File }) => {
            let file_path: string | null = payload.file_path ?? null;
            if (payload.file && id) {
                const timestamp = Date.now();
                const safeName = payload.file.name
                    .normalize('NFD')
                    .replace(/\p{Diacritic}/gu, '')
                    .replace(/[^\w.\-]/g, '_');
                const storagePath = `process/${id}/${timestamp}_${safeName || 'document'}`;
                const { error: uploadError } = await supabase.storage
                    .from(PROCESS_DOCS_BUCKET)
                    .upload(storagePath, payload.file, { upsert: false });
                if (uploadError) throw uploadError;
                file_path = storagePath;
            }
            const { error } = await supabase.from('process_documents').insert({
                process_id: id,
                title: payload.title,
                url: payload.url || null,
                file_path,
                description: payload.description || null,
                owner_id: user?.id ?? null,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['process_documents', id] });
            toast.success('Documento adicionado.');
            setDocOpen(false);
            setDocTitle('');
            setDocUrl('');
            setDocDescription('');
            setDocFile(null);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const deleteDoc = useMutation({
        mutationFn: async ({ docId, filePath }: { docId: string; filePath?: string | null }) => {
            if (filePath) {
                await supabase.storage.from(PROCESS_DOCS_BUCKET).remove([filePath]);
            }
            const { error } = await supabase.from('process_documents').delete().eq('id', docId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['process_documents', id] });
            toast.success('Documento removido.');
        },
        onError: (e: Error) => toast.error(e.message),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!processo) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Processo não encontrado.</p>
                <Button variant="link" onClick={() => navigate("/processos")}>Voltar para a lista</Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/processos")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="font-display text-2xl font-bold">{processo.number}</h1>
                        <Badge variant={processo.status === "Concluído" ? "secondary" : "default"}>
                            {processo.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{processo.client} • {processo.court}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAndamentoOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Andamento
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">Ações do Processo</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setNovoStatus(processo.status); setStatusOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Alterar status
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Lado Esquerdo: Info Resumida */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                <Hash className="h-4 w-4" /> Detalhes do Caso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Assunto</Label>
                                <p className="text-sm font-medium">{processo.subject || "Não informado"}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Classe</Label>
                                <p className="text-sm font-medium">{processo.class || "Não informado"}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Valor da Causa</Label>
                                <p className="text-sm font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.value)}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Fase Atual</Label>
                                <p className="text-sm font-medium">{processo.phase || "Não informada"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                <User className="h-4 w-4" /> Partes Envolvidas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-[10px] text-info uppercase">Polo Ativo</Label>
                                <p className="text-sm font-medium">{processo.active_party || processo.client}</p>
                            </div>
                            <div className="flex justify-center py-1">
                                <div className="h-px w-full bg-border relative">
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[8px] font-bold text-muted-foreground uppercase">vs</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-destructive uppercase">Polo Passivo</Label>
                                <p className="text-sm font-medium">{processo.passive_party || "Não informado"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lado Direito: Abas de Conteúdo */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="timeline" className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" /> Timeline
                            </TabsTrigger>
                            <TabsTrigger value="audiencias" className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" /> Audiências
                            </TabsTrigger>
                            <TabsTrigger value="documentos" className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" /> Docs
                            </TabsTrigger>
                            <TabsTrigger value="notas" className="flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5" /> Notas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="mt-6">
                            <div className="mb-4">
                                <h3 className="font-display font-semibold text-foreground">Linha do tempo do processo</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Andamentos, documentos, audiências e notas em ordem cronológica.</p>
                            </div>
                            <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border">
                                {!timeline || timeline.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <p className="mb-4">Nenhum andamento registrado. Adicione andamentos para construir a timeline.</p>
                                        <Button size="sm" variant="outline" onClick={() => setAndamentoOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" /> Novo Andamento
                                        </Button>
                                    </div>
                                ) : (
                                    timeline.map((item) => (
                                        <div key={item.id} className="relative">
                                            <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-[0_0_0_2px_theme(colors.border)]" />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-primary uppercase">{item.tipo}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(parseISO(item.data), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-foreground">{item.descricao}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="audiencias" className="mt-6 space-y-4">
                            {!audiencias || audiencias.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">Nenhuma audiência agendada.</p>
                                    <Button size="sm" variant="outline" className="mt-4" onClick={() => setAudienciaOpen(true)}>
                                        Agendar Audiência
                                    </Button>
                                </div>
                            ) : (
                                audiencias.map((aud) => (
                                    <Card key={aud.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{aud.tipo}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(parseISO(aud.data), "p")}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {aud.local || "Virtual"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={aud.status === 'Agendada' ? 'default' : 'secondary'}>{aud.status}</Badge>
                                                {aud.link_meet && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={aud.link_meet} target="_blank" rel="noopener noreferrer">
                                                            Entrar <ExternalLink className="ml-2 h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="documentos" className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-semibold text-foreground">Documentos e links</h3>
                                <Button size="sm" variant="outline" onClick={() => setDocOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Adicionar doc/link
                                </Button>
                            </div>
                            {documents.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <FileText className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">Nenhum documento ou link. Adicione referências (petições, decisões, URLs).</p>
                                    <Button size="sm" variant="outline" className="mt-4" onClick={() => setDocOpen(true)}>
                                        Adicionar doc/link
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <Card key={doc.id}>
                                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold truncate">{doc.title}</p>
                                                    {doc.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{doc.description}</p>
                                                    )}
                                                    {(doc.url || doc.file_path) && (
                                                        <a
                                                            href={doc.file_path
                                                                ? supabase.storage.from(PROCESS_DOCS_BUCKET).getPublicUrl(doc.file_path).data.publicUrl
                                                                : doc.url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                                                        >
                                                            {doc.url && !doc.file_path ? 'Abrir link' : 'Abrir arquivo'} <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => deleteDoc.mutate({ docId: doc.id, filePath: doc.file_path })}
                                                    disabled={deleteDoc.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notas" className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-semibold text-foreground">Notas internas</h3>
                                <Button size="sm" variant="outline" onClick={() => { setNoteEditingId(null); setNoteContent(''); setNoteOpen(true); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Nova nota
                                </Button>
                            </div>
                            {notes.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">Nenhuma nota. Use para anotações rápidas sobre o processo.</p>
                                    <Button size="sm" variant="outline" className="mt-4" onClick={() => setNoteOpen(true)}>
                                        Nova nota
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notes.map((note) => (
                                        <Card key={note.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{note.content}</p>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(parseISO(note.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground"
                                                            onClick={() => { setNoteEditingId(note.id); setNoteContent(note.content); setNoteOpen(true); }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => deleteNote.mutate(note.id)}
                                                            disabled={deleteNote.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Modal Novo Andamento */}
            <Dialog open={andamentoOpen} onOpenChange={setAndamentoOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Andamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Data e hora</Label>
                            <Input
                                type="datetime-local"
                                value={andamentoData}
                                onChange={(e) => setAndamentoData(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Tipo</Label>
                            <Select value={andamentoTipo} onValueChange={setAndamentoTipo}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TIPOS_ANDAMENTO.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Textarea
                                placeholder="Descreva o andamento..."
                                value={andamentoDescricao}
                                onChange={(e) => setAndamentoDescricao(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAndamentoOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                if (!andamentoDescricao.trim()) {
                                    toast.error("Informe a descrição.");
                                    return;
                                }
                                createAndamento.mutateAsync({
                                    data: new Date(andamentoData).toISOString(),
                                    tipo: andamentoTipo,
                                    descricao: andamentoDescricao.trim(),
                                });
                            }}
                            disabled={createAndamento.isPending}
                        >
                            {createAndamento.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Adicionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Agendar Audiência */}
            <Dialog open={audienciaOpen} onOpenChange={setAudienciaOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Agendar Audiência</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Data e hora</Label>
                            <Input
                                type="datetime-local"
                                value={audienciaData}
                                onChange={(e) => setAudienciaData(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Tipo</Label>
                            <Select value={audienciaTipo} onValueChange={setAudienciaTipo}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TIPOS_AUDIENCIA.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Local (opcional)</Label>
                            <Input
                                placeholder="Ex: Sala 1, Fórum"
                                value={audienciaLocal}
                                onChange={(e) => setAudienciaLocal(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Link Meet / Zoom (opcional)</Label>
                            <Input
                                placeholder="https://..."
                                value={audienciaLink}
                                onChange={(e) => setAudienciaLink(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAudienciaOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                createAudiencia.mutateAsync({
                                    data: new Date(audienciaData).toISOString(),
                                    tipo: audienciaTipo,
                                    local: audienciaLocal.trim() || undefined,
                                    link_meet: audienciaLink.trim() || undefined,
                                });
                            }}
                            disabled={createAudiencia.isPending}
                        >
                            {createAudiencia.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Agendar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Nova / Editar Nota */}
            <Dialog open={noteOpen} onOpenChange={(open) => { setNoteOpen(open); if (!open) { setNoteContent(''); setNoteEditingId(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{noteEditingId ? 'Editar nota' : 'Nova nota'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Label htmlFor="note-content">Conteúdo</Label>
                        <Textarea
                            id="note-content"
                            placeholder="Anotação sobre o processo..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={4}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                const c = noteContent.trim();
                                if (!c) { toast.error('Digite o conteúdo da nota.'); return; }
                                if (noteEditingId) updateNote.mutate({ noteId: noteEditingId, content: c });
                                else createNote.mutate(c);
                            }}
                            disabled={createNote.isPending || updateNote.isPending}
                        >
                            {(createNote.isPending || updateNote.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {noteEditingId ? 'Salvar' : 'Adicionar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Adicionar documento/link ou arquivo */}
            <Dialog open={docOpen} onOpenChange={(open) => { setDocOpen(open); if (!open) { setDocTitle(''); setDocUrl(''); setDocDescription(''); setDocFile(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar documento, link ou arquivo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="doc-title">Título *</Label>
                            <Input
                                id="doc-title"
                                placeholder={docFile ? docFile.name : "Ex: Petição inicial, Decisão 12/02/2025"}
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="doc-file">Arquivo (upload)</Label>
                            <Input
                                id="doc-file"
                                type="file"
                                className="mt-1"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    setDocFile(f || null);
                                    if (f && !docTitle.trim()) setDocTitle(f.name);
                                }}
                            />
                            {docFile && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="doc-url">URL (link externo, opcional)</Label>
                            <Input
                                id="doc-url"
                                type="url"
                                placeholder="https://..."
                                value={docUrl}
                                onChange={(e) => setDocUrl(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="doc-desc">Descrição (opcional)</Label>
                            <Textarea
                                id="doc-desc"
                                placeholder="Breve descrição do documento"
                                value={docDescription}
                                onChange={(e) => setDocDescription(e.target.value)}
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDocOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                const t = (docTitle.trim() || docFile?.name || '').trim();
                                if (!t) { toast.error('Informe o título.'); return; }
                                createDoc.mutate({
                                    title: t,
                                    url: docUrl.trim() || undefined,
                                    description: docDescription.trim() || undefined,
                                    file: docFile || undefined,
                                });
                            }}
                            disabled={createDoc.isPending}
                        >
                            {createDoc.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Adicionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Alterar status */}
            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Alterar status do processo</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Select value={novoStatus} onValueChange={setNovoStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STATUS_PROCESSO.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={() => updateStatus.mutateAsync(novoStatus as typeof STATUS_PROCESSO[number])}
                            disabled={updateStatus.isPending}
                        >
                            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ProcessoDetail;

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft, Clock, Calendar, FileText,
    DollarSign, MessageSquare, Loader2, Plus,
    Hash, User, MapPin, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const ProcessoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("timeline");

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
            if (error) throw error;
            return data;
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
            if (error) throw error;
            return data;
        },
        enabled: !!id,
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
                    <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Andamento</Button>
                    <Button size="sm">Ações do Processo</Button>
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
                                        Nenhum andamento registrado. Adicione andamentos para construir a timeline.
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
                                    <Button size="sm" variant="outline" className="mt-4">Agendar Audiência</Button>
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

                        <TabsContent value="documentos" className="mt-6">
                            <div className="text-center py-20 text-muted-foreground">
                                Módulo de documentos em integração...
                            </div>
                        </TabsContent>

                        <TabsContent value="notas" className="mt-6">
                            <div className="text-center py-20 text-muted-foreground">
                                Módulo de notas em integração...
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </motion.div>
    );
};

export default ProcessoDetail;

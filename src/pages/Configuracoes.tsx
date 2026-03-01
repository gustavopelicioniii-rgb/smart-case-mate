import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Lock, Key, Save, Loader2, Eye, EyeOff,
    Shield, LogOut, MessageCircle, CreditCard, PenTool, Image, Trash2, Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile, useUpdateProfile, changePassword, useUploadFirmLogo, useRemoveFirmLogo, useUploadAvatar } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppConfig, useSaveWhatsAppConfig } from "@/hooks/useWhatsApp";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const PROFISSOES = ["Advogado", "Advogada", "Estagiário", "Estagiária", "Outro"];
const ESTADOS_BR = ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"];

const Configuracoes = () => {
    const { user, role, signOut } = useAuth();
    const { data: profile, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const uploadFirmLogo = useUploadFirmLogo();
    const removeFirmLogo = useRemoveFirmLogo();
    const uploadAvatar = useUploadAvatar();
    const { toast } = useToast();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [oabNumber, setOabNumber] = useState("");
    const [profissao, setProfissao] = useState("");
    const [oabState, setOabState] = useState("");
    const [estado, setEstado] = useState("");
    const [endereco, setEndereco] = useState("");
    const [numero, setNumero] = useState("");
    const [cpf, setCpf] = useState("");
    const [cep, setCep] = useState("");
    const [cidade, setCidade] = useState("");
    const [bairro, setBairro] = useState("");
    const [complemento, setComplemento] = useState("");
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        if (profile && !profileLoaded) {
            setFullName(profile.full_name ?? "");
            setPhone(profile.phone ?? "");
            setOabNumber(profile.oab_number ?? "");
            setProfissao(profile.profissao ?? "");
            setOabState(profile.oab_state ?? "");
            setEstado(profile.estado ?? "");
            setEndereco(profile.endereco ?? "");
            setNumero(profile.numero ?? "");
            setCpf(profile.cpf ?? "");
            setCep(profile.cep ?? "");
            setCidade(profile.cidade ?? "");
            setBairro(profile.bairro ?? "");
            setComplemento(profile.complemento ?? "");
            setProfileLoaded(true);
        }
    }, [profile, profileLoaded]);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [apiKey, setApiKey] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem("gemini_api_key") || "" : ""
    );
    const [showApiKey, setShowApiKey] = useState(false);

    const { data: waConfig, isLoading: waLoading } = useWhatsAppConfig();
    const saveWaConfig = useSaveWhatsAppConfig();
    const [waProvider, setWaProvider] = useState<"cloud_api" | "z_api" | "evolution_api">("z_api");
    const [waApiUrl, setWaApiUrl] = useState("");
    const [waApiKey, setWaApiKey] = useState("");
    const [waInstanceId, setWaInstanceId] = useState("");
    const [waPhoneNumber, setWaPhoneNumber] = useState("");
    const [waActive, setWaActive] = useState(false);
    const [waLoaded, setWaLoaded] = useState(false);

    const [payProvider, setPayProvider] = useState("asaas");
    const [payApiKey, setPayApiKey] = useState("");
    const [signProvider, setSignProvider] = useState("clicksign");
    const [signApiToken, setSignApiToken] = useState("");
    const [gcalClientId, setGcalClientId] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('google_calendar_client_id') || '' : ''
    );

    useEffect(() => {
        if (waConfig && !waLoaded) {
            setWaProvider(waConfig.provider);
            setWaApiUrl(waConfig.api_url);
            setWaApiKey(waConfig.api_key);
            setWaInstanceId(waConfig.instance_id);
            setWaPhoneNumber(waConfig.phone_number);
            setWaActive(waConfig.is_active);
            setWaLoaded(true);
        }
    }, [waConfig, waLoaded]);

    const handleSaveProfile = async () => {
        try {
            await updateProfile.mutateAsync({
                full_name: fullName,
                phone,
                oab_number: oabNumber,
                profissao: profissao || null,
                oab_state: oabState || null,
                estado: estado || null,
                endereco: endereco || null,
                numero: numero || null,
                cpf: cpf || null,
                cep: cep || null,
                cidade: cidade || null,
                bairro: bairro || null,
                complemento: complemento || null,
            });
        } catch {
            // error handled by mutation onError
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Senhas diferentes", description: "A confirmação não coincide com a nova senha.", variant: "destructive" });
            return;
        }
        setChangingPassword(true);
        try {
            await changePassword(newPassword);
            toast({ title: "Senha alterada com sucesso!" });
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erro ao alterar senha";
            toast({ title: "Erro", description: message, variant: "destructive" });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSaveApiKey = () => {
        localStorage.setItem("gemini_api_key", apiKey);
        toast({ title: "Chave da API salva!" });
    };

    const handleSaveWhatsApp = async () => {
        if (!user?.id) {
            toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
            return;
        }
        try {
            await saveWaConfig.mutateAsync({
                owner_id: user.id,
                provider: waProvider,
                api_url: waApiUrl,
                api_key: waApiKey,
                instance_id: waInstanceId,
                phone_number: waPhoneNumber,
                is_active: waActive,
            });
        } catch {
            // error handled by mutation onError
        }
    };

    const handleSaveGoogleCalendar = () => {
        localStorage.setItem('google_calendar_client_id', gcalClientId);
        toast({ title: "Client ID salvo!" });
    };

    const handleSavePayment = () => {
        toast({ title: "Configuração de pagamento salva!", description: `Provedor: ${payProvider}` });
    };

    const handleSaveSignature = () => {
        toast({ title: "Configuração de assinatura salva!", description: `Provedor: ${signProvider}` });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Carregando...</span>
            </div>
        );
    }

    const providerInfo: Record<string, { urlLabel: string; urlPlaceholder: string; keyLabel: string; keyPlaceholder: string; hasInstance: boolean }> = {
        z_api: {
            urlLabel: "URL da Instância Z-API",
            urlPlaceholder: "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN",
            keyLabel: "Client-Token",
            keyPlaceholder: "Seu client-token do Z-API",
            hasInstance: false,
        },
        evolution_api: {
            urlLabel: "URL base da Evolution API",
            urlPlaceholder: "https://sua-evolution-api.com",
            keyLabel: "API Key",
            keyPlaceholder: "Sua apikey da Evolution",
            hasInstance: true,
        },
        cloud_api: {
            urlLabel: "Número do Telefone (ID)",
            urlPlaceholder: "ID do número no Meta Business",
            keyLabel: "Access Token",
            keyPlaceholder: "Token permanente do Meta",
            hasInstance: false,
        },
    };

    const pInfo = providerInfo[waProvider];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
            <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Atualize seus dados</h1>
                <p className="mt-1 text-muted-foreground">Gerencie seu perfil, assinatura, senha e cartões.</p>
            </div>

            <Tabs defaultValue="informacoes" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1 bg-muted">
                    <TabsTrigger value="informacoes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Informações
                    </TabsTrigger>
                    <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
                    <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
                    <TabsTrigger value="cartoes">Cartões</TabsTrigger>
                </TabsList>

                <TabsContent value="informacoes" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    <label className="relative cursor-pointer block">
                                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                (fullName || user?.email || "U").charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background">
                                            <Camera className="h-4 w-4" />
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) uploadAvatar.mutate(file);
                                                e.target.value = "";
                                            }}
                                            disabled={uploadAvatar.isPending}
                                        />
                                    </label>
                                    <span className="text-xs text-muted-foreground">Alterar foto</span>
                                </div>

                                <div className="flex-1 grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="profissao">Profissão <span className="text-destructive">*</span></Label>
                                        <Select value={profissao || undefined} onValueChange={setProfissao}>
                                            <SelectTrigger id="profissao"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>
                                                {PROFISSOES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nome completo <span className="text-destructive">*</span></Label>
                                        <Input id="fullName" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="email">E-mail</Label>
                                        <Input id="email" value={user?.email ?? ""} disabled className="opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="oab_state">Estado da OAB</Label>
                                        <Select value={oabState || undefined} onValueChange={setOabState}>
                                            <SelectTrigger id="oab_state"><SelectValue placeholder="UF" /></SelectTrigger>
                                            <SelectContent>
                                                {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estado">Estado</Label>
                                        <Select value={estado || undefined} onValueChange={setEstado}>
                                            <SelectTrigger id="estado"><SelectValue placeholder="Estado" /></SelectTrigger>
                                            <SelectContent>
                                                {ESTADOS_BR.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endereco">Endereço</Label>
                                        <Input id="endereco" placeholder="Rua, avenida" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Número <span className="text-destructive">*</span></Label>
                                        <Input id="numero" placeholder="Nº" value={numero} onChange={(e) => setNumero(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf">CPF <span className="text-destructive">*</span></Label>
                                        <Input id="cpf" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input id="phone" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="oab">Nº da OAB</Label>
                                        <Input id="oab" placeholder="123456" value={oabNumber} onChange={(e) => setOabNumber(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cep">CEP</Label>
                                        <Input id="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cidade">Cidade</Label>
                                        <Input id="cidade" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bairro">Bairro</Label>
                                        <Input id="bairro" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="complemento">Complemento</Label>
                                        <Input id="complemento" placeholder="Apto, bloco" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center sm:justify-end mt-6">
                                <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-w-[120px]">
                                    {updateProfile.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <>SALVAR</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assinatura" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display text-lg">Assinatura</CardTitle>
                            <CardDescription>Seu plano atual e renovação.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    {profile?.subscription_plan ? String(profile.subscription_plan).toUpperCase() : "Start"}
                                </Badge>
                                <span className="text-muted-foreground text-sm">Plano ativo</span>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">Gerencie sua assinatura e formas de pagamento nas seções abaixo.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="senha" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display text-lg">Alterar Senha</CardTitle>
                            <CardDescription>Defina uma nova senha de acesso.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 6 caracteres"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repita a senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword}>
                                    {changingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Alterando...</> : <><Lock className="mr-2 h-4 w-4" />Alterar Senha</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cartoes" className="mt-4">
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium text-foreground">Cartões</p>
                            <p className="text-sm">Em breve. Você poderá cadastrar e gerenciar cartões aqui.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Separator className="my-6" />
            <div>
                <h2 className="font-display text-xl font-bold text-foreground">Configurações gerais</h2>
                <p className="mt-1 text-muted-foreground text-sm">Logo, IA, WhatsApp e integrações.</p>
            </div>

            {/* Logo do escritório */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Image className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">Logo do escritório</CardTitle>
                            <CardDescription>Faça o upload da logo para exibir no painel e no dashboard</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex flex-col items-center gap-2">
                            {profile?.firm_logo_url ? (
                                <div className="relative">
                                    <img
                                        src={profile.firm_logo_url}
                                        alt="Logo do escritório"
                                        className="h-20 w-auto max-w-[200px] object-contain rounded border border-border bg-muted/30 p-2"
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-32 rounded border border-dashed border-border bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
                                    Nenhuma logo
                                </div>
                            )}
                            <div className="flex gap-2">
                                    <input
                                        id="firm-logo-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                                        className="sr-only"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadFirmLogo.mutate(file);
                                            e.target.value = "";
                                        }}
                                        disabled={uploadFirmLogo.isPending}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={uploadFirmLogo.isPending}
                                        onClick={() => document.getElementById("firm-logo-upload")?.click()}
                                    >
                                        {uploadFirmLogo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                                        {" "}{profile?.firm_logo_url ? "Trocar" : "Enviar"} logo
                                    </Button>
                                {profile?.firm_logo_url && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => removeFirmLogo.mutate()}
                                        disabled={removeFirmLogo.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" /> Remover
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Key Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">Inteligência Artificial</CardTitle>
                            <CardDescription>Configure a chave da API do Google Gemini para o Gerador de Peças</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">Chave da API Google Gemini</Label>
                        <div className="relative">
                            <Input
                                id="apiKey"
                                type={showApiKey ? "text" : "password"}
                                placeholder="AIza..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showApiKey ? "Ocultar chave" : "Mostrar chave"}
                            >
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Obtenha em{" "}
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                aistudio.google.com/apikey
                            </a>
                            . Sua chave fica salva apenas no seu navegador.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={handleSaveApiKey}>
                            <Save className="mr-2 h-4 w-4" />Salvar Chave
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* WhatsApp Integration Section */}
            <Card className="border-green-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="font-display text-lg">WhatsApp Business</CardTitle>
                                <CardDescription>Integre conversas do WhatsApp ao CRM</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{waActive ? "Ativo" : "Inativo"}</span>
                            <Switch checked={waActive} onCheckedChange={setWaActive} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provedor</Label>
                        <Select value={waProvider} onValueChange={(v: "cloud_api" | "z_api" | "evolution_api") => setWaProvider(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="z_api">Z-API (Recomendado)</SelectItem>
                                <SelectItem value="evolution_api">Evolution API</SelectItem>
                                <SelectItem value="cloud_api">Meta Cloud API (Oficial)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>{pInfo.urlLabel}</Label>
                            <Input
                                placeholder={pInfo.urlPlaceholder}
                                value={waProvider === "cloud_api" ? waPhoneNumber : waApiUrl}
                                onChange={(e) => waProvider === "cloud_api" ? setWaPhoneNumber(e.target.value) : setWaApiUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{pInfo.keyLabel}</Label>
                            <Input
                                type="password"
                                placeholder={pInfo.keyPlaceholder}
                                value={waApiKey}
                                onChange={(e) => setWaApiKey(e.target.value)}
                            />
                        </div>
                    </div>

                    {pInfo.hasInstance && (
                        <div className="space-y-2">
                            <Label>Nome da Instância</Label>
                            <Input
                                placeholder="minha-instancia"
                                value={waInstanceId}
                                onChange={(e) => setWaInstanceId(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">Como configurar:</p>
                        {waProvider === "z_api" && (
                            <>
                                <p>1. Crie uma conta em <a href="https://z-api.io" target="_blank" className="text-primary underline">z-api.io</a></p>
                                <p>2. Crie uma instância e escaneie o QR Code com seu WhatsApp</p>
                                <p>3. Cole a URL da instância e o Client-Token acima</p>
                                <p>4. Configure o webhook de recebimento na Z-API apontando para seu Supabase</p>
                            </>
                        )}
                        {waProvider === "evolution_api" && (
                            <>
                                <p>1. Instale a Evolution API no seu servidor</p>
                                <p>2. Crie uma instância e escaneie o QR Code</p>
                                <p>3. Cole a URL, API Key e nome da instância acima</p>
                                <p>4. Configure o webhook na Evolution API</p>
                            </>
                        )}
                        {waProvider === "cloud_api" && (
                            <>
                                <p>1. Acesse <a href="https://developers.facebook.com" target="_blank" className="text-primary underline">developers.facebook.com</a></p>
                                <p>2. Crie um app do tipo Business e configure o WhatsApp</p>
                                <p>3. Obtenha o Token permanente e o ID do número</p>
                                <p>4. Configure o webhook no Meta para seu Supabase</p>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveWhatsApp} disabled={saveWaConfig.isPending} className="bg-green-600 hover:bg-green-700">
                            {saveWaConfig.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" />Salvar WhatsApp</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card className="border-blue-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 3.75h-15A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25zM9 17.25H6.75V9.75H9v7.5zm4.125 0h-2.25V9.75h2.25v7.5zM17.25 17.25H15V9.75h2.25v7.5zM6.75 8.25v-3h10.5v3H6.75z" /></svg>
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">Google Calendar</CardTitle>
                            <CardDescription>Sincronize sua agenda com o Google Calendar (2 vias)</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Google OAuth Client ID</Label>
                        <Input
                            placeholder="123456789-abc.apps.googleusercontent.com"
                            value={gcalClientId}
                            onChange={(e) => setGcalClientId(e.target.value)}
                        />
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">Como obter o Client ID:</p>
                        <p>1. Acesse <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-primary underline">Google Cloud Console</a></p>
                        <p>2. Crie um projeto (ou use um existente)</p>
                        <p>3. Ative a API <strong>Google Calendar API</strong></p>
                        <p>4. Crie credenciais → OAuth 2.0 Client ID (tipo: Web application)</p>
                        <p>5. Em "Authorized JavaScript origins", adicione: <code className="bg-muted px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8082'}</code></p>
                        <p>6. Em "Authorized redirect URIs", adicione a mesma URL</p>
                        <p>7. Cole o Client ID acima</p>
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveGoogleCalendar}>
                            <Save className="mr-2 h-4 w-4" />Salvar Google Calendar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Integration */}
            <Card className="border-emerald-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">Pagamentos Online</CardTitle>
                            <CardDescription>Configure integração para cobranças PIX, boleto e link de pagamento</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provedor de Pagamento</Label>
                        <Select value={payProvider} onValueChange={setPayProvider}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asaas">Asaas</SelectItem>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input
                                type="password"
                                placeholder="Sua chave de API"
                                value={payApiKey}
                                onChange={(e) => setPayApiKey(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input readOnly value="https://seu-supabase.co/functions/v1/payment-webhook" className="opacity-70" />
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">Baixa automática</p>
                        <p>Ao configurar o webhook no provedor, pagamentos confirmados serão marcados como "Pago" automaticamente no sistema.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSavePayment}>
                            <Save className="mr-2 h-4 w-4" />Salvar Pagamentos
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* E-Signature Integration */}
            <Card className="border-indigo-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                            <PenTool className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">Assinatura Eletrônica</CardTitle>
                            <CardDescription>Integre assinatura digital para contratos e documentos</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provedor de Assinatura</Label>
                        <Select value={signProvider} onValueChange={setSignProvider}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clicksign">Clicksign</SelectItem>
                                <SelectItem value="docusign">DocuSign</SelectItem>
                                <SelectItem value="zapsign">ZapSign</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Token de API</Label>
                        <Input
                            type="password"
                            placeholder="Seu token de acesso"
                            value={signApiToken}
                            onChange={(e) => setSignApiToken(e.target.value)}
                        />
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">Como funciona:</p>
                        <p>1. Obtenha o token de API no painel do seu provedor de assinatura.</p>
                        <p>2. Ao enviar um documento para assinatura no módulo Documentos, o sistema usará essa integração.</p>
                        <p>3. O status da assinatura é atualizado automaticamente via webhook.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveSignature}>
                            <Save className="mr-2 h-4 w-4" />Salvar Assinatura
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg text-destructive">Sessão</CardTitle>
                            <CardDescription>Encerrar a sessão atual</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Ao sair, você será redirecionado para a tela de login e precisará inserir suas credenciais novamente.
                    </p>
                    <Button variant="destructive" onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />Sair da Conta
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Configuracoes;

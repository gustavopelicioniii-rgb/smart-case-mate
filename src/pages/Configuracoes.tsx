import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Lock, Key, Palette, Save, Loader2, Eye, EyeOff,
    Shield, LogOut, MessageCircle,
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
import { useProfile, useUpdateProfile, changePassword } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppConfig, useSaveWhatsAppConfig } from "@/hooks/useWhatsApp";

const Configuracoes = () => {
    const { user, role, signOut } = useAuth();
    const { data: profile, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const { toast } = useToast();

    // Profile form
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [oabNumber, setOabNumber] = useState("");
    const [profileLoaded, setProfileLoaded] = useState(false);

    // Load profile data into form when available
    if (profile && !profileLoaded) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setOabNumber(profile.oab_number ?? "");
        setProfileLoaded(true);
    }

    // Password form
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // API Key
    const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
    const [showApiKey, setShowApiKey] = useState(false);

    // WhatsApp config
    const { data: waConfig, isLoading: waLoading } = useWhatsAppConfig();
    const saveWaConfig = useSaveWhatsAppConfig();
    const [waProvider, setWaProvider] = useState<"cloud_api" | "z_api" | "evolution_api">("z_api");
    const [waApiUrl, setWaApiUrl] = useState("");
    const [waApiKey, setWaApiKey] = useState("");
    const [waInstanceId, setWaInstanceId] = useState("");
    const [waPhoneNumber, setWaPhoneNumber] = useState("");
    const [waActive, setWaActive] = useState(false);
    const [waLoaded, setWaLoaded] = useState(false);

    // Load WhatsApp config
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
        await updateProfile.mutateAsync({
            full_name: fullName,
            phone,
            oab_number: oabNumber,
        });
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Senhas diferentes", description: "A confirmaÃ§Ã£o nÃ£o coincide com a nova senha.", variant: "destructive" });
            return;
        }
        setChangingPassword(true);
        try {
            await changePassword(newPassword);
            toast({ title: "Senha alterada com sucesso!" });
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: any) {
            toast({ title: "Erro", description: e.message, variant: "destructive" });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSaveApiKey = () => {
        localStorage.setItem("gemini_api_key", apiKey);
        toast({ title: "Chave da API salva!" });
    };

    const handleSaveWhatsApp = async () => {
        await saveWaConfig.mutateAsync({
            owner_id: user?.id ?? "",
            provider: waProvider,
            api_url: waApiUrl,
            api_key: waApiKey,
            instance_id: waInstanceId,
            phone_number: waPhoneNumber,
            is_active: waActive,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Carregando...</span>
            </div>
        );
    }

    // Provider-specific placeholder text
    const providerInfo: Record<string, { urlLabel: string; urlPlaceholder: string; keyLabel: string; keyPlaceholder: string; hasInstance: boolean }> = {
        z_api: {
            urlLabel: "URL da InstÃ¢ncia Z-API",
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
            urlLabel: "NÃºmero do Telefone (ID)",
            urlPlaceholder: "ID do nÃºmero no Meta Business",
            keyLabel: "Access Token",
            keyPlaceholder: "Token permanente do Meta",
            hasInstance: false,
        },
    };

    const pInfo = providerInfo[waProvider];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
            <div>
                <h1 className="font-display text-3xl font-bold text-foreground">ConfiguraÃ§Ãµes</h1>
                <p className="mt-1 text-muted-foreground">Gerencie seu perfil, seguranÃ§a e preferÃªncias.</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">Perfil</CardTitle>
                            <CardDescription>InformaÃ§Ãµes pessoais e profissionais</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                            {(fullName || user?.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{fullName || "Sem nome"}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <Badge variant="secondary" className="mt-1">
                                <Shield className="mr-1 h-3 w-3" />
                                {role === "admin" ? "Administrador" : "Advogado"}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                placeholder="Dr. JoÃ£o Silva"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={user?.email ?? ""}
                                disabled
                                className="opacity-60"
                            />
                            <p className="text-xs text-muted-foreground">O email nÃ£o pode ser alterado.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="oab">NÂº OAB</Label>
                            <Input
                                id="oab"
                                placeholder="123456/SP"
                                value={oabNumber}
                                onChange={(e) => setOabNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                            {updateProfile.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" />Salvar Perfil</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg">SeguranÃ§a</CardTitle>
                            <CardDescription>Altere sua senha de acesso</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="MÃ­nimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
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
                            {changingPassword ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Alterando...</>
                            ) : (
                                <><Lock className="mr-2 h-4 w-4" />Alterar Senha</>
                            )}
                        </Button>
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
                            <CardTitle className="font-display text-lg">InteligÃªncia Artificial</CardTitle>
                            <CardDescription>Configure a chave da API do Google Gemini para o Gerador de PeÃ§as</CardDescription>
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
                        <Select value={waProvider} onValueChange={(v: any) => setWaProvider(v)}>
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
                            <Label>Nome da InstÃ¢ncia</Label>
                            <Input
                                placeholder="minha-instancia"
                                value={waInstanceId}
                                onChange={(e) => setWaInstanceId(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">ðŸ“‹ Como configurar:</p>
                        {waProvider === "z_api" && (
                            <>
                                <p>1. Crie uma conta em <a href="https://z-api.io" target="_blank" className="text-primary underline">z-api.io</a></p>
                                <p>2. Crie uma instÃ¢ncia e escaneie o QR Code com seu WhatsApp</p>
                                <p>3. Cole a URL da instÃ¢ncia e o Client-Token acima</p>
                                <p>4. Configure o webhook de recebimento na Z-API apontando para seu Supabase</p>
                            </>
                        )}
                        {waProvider === "evolution_api" && (
                            <>
                                <p>1. Instale a Evolution API no seu servidor</p>
                                <p>2. Crie uma instÃ¢ncia e escaneie o QR Code</p>
                                <p>3. Cole a URL, API Key e nome da instÃ¢ncia acima</p>
                                <p>4. Configure o webhook na Evolution API</p>
                            </>
                        )}
                        {waProvider === "cloud_api" && (
                            <>
                                <p>1. Acesse <a href="https://developers.facebook.com" target="_blank" className="text-primary underline">developers.facebook.com</a></p>
                                <p>2. Crie um app do tipo Business e configure o WhatsApp</p>
                                <p>3. Obtenha o Token permanente e o ID do nÃºmero</p>
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

            {/* Danger Zone */}
            <Card className="border-destructive/30">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="font-display text-lg text-destructive">SessÃ£o</CardTitle>
                            <CardDescription>Encerrar a sessÃ£o atual</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Ao sair, vocÃª serÃ¡ redirecionado para a tela de login e precisarÃ¡ inserir suas credenciais novamente.
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

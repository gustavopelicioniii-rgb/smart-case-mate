import { useState } from "react";
import { motion } from "framer-motion";
import {
    User, Lock, Key, Palette, Save, Loader2, Eye, EyeOff,
    Shield, LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProfile, useUpdateProfile, changePassword } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
            toast({ title: "Senhas diferentes", description: "A confirmação não coincide com a nova senha.", variant: "destructive" });
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Carregando...</span>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
            <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Configurações</h1>
                <p className="mt-1 text-muted-foreground">Gerencie seu perfil, segurança e preferências.</p>
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
                            <CardDescription>Informações pessoais e profissionais</CardDescription>
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
                                placeholder="Dr. João Silva"
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
                            <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
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
                            <Label htmlFor="oab">Nº OAB</Label>
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
                            <CardTitle className="font-display text-lg">Segurança</CardTitle>
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
                                    placeholder="Mínimo 6 caracteres"
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

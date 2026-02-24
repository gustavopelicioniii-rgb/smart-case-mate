import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    MessageCircle, Send, Phone, Search, ArrowLeft, User, Clock,
    Loader2, Check, CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    useConversations, useWhatsAppMessages, useSendWhatsAppMessage,
    useWhatsAppConfig, type Conversation,
} from "@/hooks/useWhatsApp";

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function ConversationList({
    conversations, selected, onSelect, search, onSearchChange,
}: {
    conversations: Conversation[];
    selected: string | null;
    onSelect: (phone: string) => void;
    search: string;
    onSearchChange: (v: string) => void;
}) {
    const filtered = conversations.filter(
        (c) =>
            c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
            c.contact_phone.includes(search)
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar conversa..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhuma conversa</p>
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.contact_phone}
                            onClick={() => onSelect(conv.contact_phone)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                                selected === conv.contact_phone && "bg-muted"
                            )}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold shrink-0">
                                {conv.contact_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium truncate">{conv.contact_name}</p>
                                    <span className="text-[10px] text-muted-foreground">{formatTime(conv.last_time)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                            </div>
                            {conv.unread_count > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white px-1">
                                    {conv.unread_count}
                                </span>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

function ChatView({
    phone, onBack,
}: {
    phone: string;
    onBack: () => void;
}) {
    const { data: messages, isLoading } = useWhatsAppMessages(phone);
    const sendMessage = useSendWhatsAppMessage();
    const [text, setText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const contactName = messages?.[0]?.contact_name || phone;

    const handleSend = async () => {
        if (!text.trim()) return;
        await sendMessage.mutateAsync({ phone, text: text.trim() });
        setText("");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">
                    {contactName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{contactName}</p>
                    <p className="text-xs text-muted-foreground">{phone}</p>
                </div>
                <a href={`tel:${phone}`} className="text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4" />
                </a>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/chat-bg.png')] bg-repeat">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    (messages ?? []).map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex",
                                msg.direction === "outgoing" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[75%] rounded-xl px-3 py-2 text-sm shadow-sm",
                                    msg.direction === "outgoing"
                                        ? "bg-green-600 text-white rounded-br-sm"
                                        : "bg-card text-foreground rounded-bl-sm border border-border"
                                )}
                            >
                                <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                                <div className={cn(
                                    "flex items-center justify-end gap-1 mt-0.5",
                                    msg.direction === "outgoing" ? "text-green-200" : "text-muted-foreground"
                                )}>
                                    <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                                    {msg.direction === "outgoing" && (
                                        msg.status === "sent" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <Input
                        placeholder="Digite uma mensagem..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!text.trim() || sendMessage.isPending}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {sendMessage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

const WhatsApp = () => {
    const { data: config } = useWhatsAppConfig();
    const { data: conversations, isLoading } = useConversations();
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    if (!config?.is_active) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">WhatsApp</h1>
                    <p className="mt-1 text-muted-foreground">Integração com WhatsApp Business</p>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                            <MessageCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">WhatsApp não configurado</h2>
                        <p className="text-muted-foreground max-w-md mb-4">
                            Configure sua API do WhatsApp nas Configurações para começar a receber e enviar mensagens
                            diretamente pelo sistema.
                        </p>
                        <Button asChild variant="outline">
                            <a href="/configuracoes">Ir para Configurações</a>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]">
            <Card className="h-full overflow-hidden">
                <div className="flex h-full">
                    {/* Conversation list */}
                    <div className={cn(
                        "w-full lg:w-80 border-r border-border flex-shrink-0",
                        selectedPhone ? "hidden lg:flex lg:flex-col" : "flex flex-col"
                    )}>
                        <div className="p-3 border-b border-border">
                            <h2 className="font-semibold flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-green-600" />
                                Conversas ({conversations?.length ?? 0})
                            </h2>
                        </div>
                        <ConversationList
                            conversations={conversations ?? []}
                            selected={selectedPhone}
                            onSelect={setSelectedPhone}
                            search={search}
                            onSearchChange={setSearch}
                        />
                    </div>

                    {/* Chat view */}
                    <div className={cn(
                        "flex-1 flex flex-col",
                        !selectedPhone ? "hidden lg:flex" : "flex"
                    )}>
                        {selectedPhone ? (
                            <ChatView phone={selectedPhone} onBack={() => setSelectedPhone(null)} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <MessageCircle className="h-12 w-12 mb-3" />
                                <p className="text-lg font-medium">Selecione uma conversa</p>
                                <p className="text-sm">Escolha um contato para ver as mensagens</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default WhatsApp;

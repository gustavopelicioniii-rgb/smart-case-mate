import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ──── Types ────

export interface WhatsAppConfig {
    id: string;
    owner_id: string;
    provider: 'cloud_api' | 'z_api' | 'evolution_api';
    api_url: string;
    api_key: string;
    instance_id: string;
    phone_number: string;
    is_active: boolean;
}

export interface WhatsAppMessage {
    id: string;
    owner_id: string | null;
    contact_name: string;
    contact_phone: string;
    message_text: string;
    direction: 'incoming' | 'outgoing';
    media_url: string;
    status: string;
    crm_client_id: string | null;
    created_at: string;
}

export interface Conversation {
    contact_phone: string;
    contact_name: string;
    last_message: string;
    last_time: string;
    unread_count: number;
    crm_client_id: string | null;
}

// ──── Config Hook ────

export function useWhatsAppConfig() {
    return useQuery<WhatsAppConfig | null>({
        queryKey: ['whatsapp-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('whatsapp_config')
                .select('*')
                .maybeSingle();
            if (error) throw error;
            return data as WhatsAppConfig | null;
        },
    });
}

export function useSaveWhatsAppConfig() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (config: Omit<WhatsAppConfig, 'id'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            const { error } = await supabase
                .from('whatsapp_config')
                .upsert({ ...config, owner_id: user.id }, { onConflict: 'owner_id' });
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-config'] });
            toast({ title: 'Configuração WhatsApp salva!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        },
    });
}

// ──── Messages Hook ────

export function useWhatsAppMessages(contactPhone?: string) {
    return useQuery<WhatsAppMessage[]>({
        queryKey: ['whatsapp-messages', contactPhone],
        queryFn: async () => {
            let query = supabase
                .from('whatsapp_messages')
                .select('*')
                .order('created_at', { ascending: true });
            if (contactPhone) {
                query = query.eq('contact_phone', contactPhone);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as WhatsAppMessage[];
        },
        enabled: !contactPhone || contactPhone.length > 0,
    });
}

export function useConversations() {
    return useQuery<Conversation[]>({
        queryKey: ['whatsapp-conversations'],
        queryFn: async () => {
            // Get all messages grouped by contact_phone
            const { data, error } = await supabase
                .from('whatsapp_messages')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;

            const messages = data as WhatsAppMessage[];
            const convMap = new Map<string, Conversation>();

            for (const msg of messages) {
                if (!convMap.has(msg.contact_phone)) {
                    convMap.set(msg.contact_phone, {
                        contact_phone: msg.contact_phone,
                        contact_name: msg.contact_name || msg.contact_phone,
                        last_message: msg.message_text,
                        last_time: msg.created_at,
                        unread_count: msg.direction === 'incoming' && msg.status === 'received' ? 1 : 0,
                        crm_client_id: msg.crm_client_id,
                    });
                } else if (msg.direction === 'incoming' && msg.status === 'received') {
                    const conv = convMap.get(msg.contact_phone)!;
                    conv.unread_count += 1;
                }
            }

            return Array.from(convMap.values()).sort(
                (a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime()
            );
        },
    });
}

// ──── Send Message ────

export function useSendWhatsAppMessage() {
    const qc = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ phone, text }: { phone: string; text: string }) => {
            // 1. Get config
            const { data: config } = await supabase
                .from('whatsapp_config')
                .select('*')
                .single();
            if (!config || !config.is_active) throw new Error('WhatsApp não configurado');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            // 2. Send via provider API
            let sent = false;
            const cfg = config as WhatsAppConfig;

            if (cfg.provider === 'z_api') {
                const res = await fetch(`${cfg.api_url}/send-text`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Client-Token': cfg.api_key,
                    },
                    body: JSON.stringify({ phone, message: text }),
                });
                sent = res.ok;
            } else if (cfg.provider === 'evolution_api') {
                const res = await fetch(`${cfg.api_url}/message/sendText/${cfg.instance_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: cfg.api_key,
                    },
                    body: JSON.stringify({ number: phone, text }),
                });
                sent = res.ok;
            } else if (cfg.provider === 'cloud_api') {
                const res = await fetch(
                    `https://graph.facebook.com/v18.0/${cfg.phone_number}/messages`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${cfg.api_key}`,
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: phone,
                            type: 'text',
                            text: { body: text },
                        }),
                    }
                );
                sent = res.ok;
            }

            // 3. Save outgoing message to DB
            await supabase.from('whatsapp_messages').insert({
                owner_id: user.id,
                contact_phone: phone,
                contact_name: '',
                message_text: text,
                direction: 'outgoing',
                status: sent ? 'sent' : 'failed',
            });

            if (!sent) throw new Error('Falha ao enviar mensagem');
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-messages'] });
            qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao enviar', description: e.message, variant: 'destructive' });
        },
    });
}

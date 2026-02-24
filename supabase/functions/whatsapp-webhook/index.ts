// Supabase Edge Function: WhatsApp Webhook Receiver
// Deploy: supabase functions deploy whatsapp-webhook
//
// This handles incoming webhooks from all 3 providers:
// - Meta Cloud API
// - Z-API
// - Evolution API
//
// It inserts messages into whatsapp_messages table,
// which triggers auto CRM lead creation.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
    // Handle Meta Cloud API verification
    if (req.method === 'GET') {
        const url = new URL(req.url);
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');

        if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
            return new Response(challenge, { status: 200 });
        }
        return new Response('Forbidden', { status: 403 });
    }

    try {
        const body = await req.json();
        const provider = req.headers.get('x-provider') || detectProvider(body);

        let messages: { phone: string; name: string; text: string }[] = [];

        if (provider === 'cloud_api') {
            // Meta Cloud API format
            const entries = body?.entry ?? [];
            for (const entry of entries) {
                for (const change of entry.changes ?? []) {
                    for (const msg of change.value?.messages ?? []) {
                        const contact = change.value?.contacts?.find((c: any) => c.wa_id === msg.from);
                        messages.push({
                            phone: msg.from,
                            name: contact?.profile?.name || msg.from,
                            text: msg.text?.body || '[mídia]',
                        });
                    }
                }
            }
        } else if (provider === 'z_api') {
            // Z-API format
            if (body.text?.message) {
                messages.push({
                    phone: body.phone,
                    name: body.senderName || body.phone,
                    text: body.text.message,
                });
            }
        } else if (provider === 'evolution_api') {
            // Evolution API format
            if (body.data?.message?.conversation) {
                messages.push({
                    phone: body.data.key.remoteJid.replace('@s.whatsapp.net', ''),
                    name: body.data.pushName || '',
                    text: body.data.message.conversation,
                });
            }
        }

        // Get the owner_id (first admin)
        const { data: admin } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .limit(1)
            .single();

        // Insert messages
        for (const msg of messages) {
            await supabase.from('whatsapp_messages').insert({
                owner_id: admin?.id,
                contact_phone: msg.phone,
                contact_name: msg.name,
                message_text: msg.text,
                direction: 'incoming',
                status: 'received',
            });
        }

        return new Response(JSON.stringify({ success: true, count: messages.length }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Webhook error:', err);
        return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});

function detectProvider(body: any): string {
    if (body?.entry) return 'cloud_api';
    if (body?.phone && body?.text) return 'z_api';
    if (body?.data?.key?.remoteJid) return 'evolution_api';
    return 'unknown';
}

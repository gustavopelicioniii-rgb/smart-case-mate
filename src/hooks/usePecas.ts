import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedPeca {
    id: string;
    created_at: string;
    title: string;
    tipo: string;
    context: string;
    generated_text: string;
    process_number: string;
    owner_id: string | null;
}

export type PecaInsert = Omit<GeneratedPeca, 'id' | 'created_at'>;

// Saved generated pieces
export function usePecas() {
    return useQuery<GeneratedPeca[]>({
        queryKey: ['pecas'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pecas')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as GeneratedPeca[];
        },
    });
}

export function useSavePeca() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (peca: PecaInsert) => {
            const { data, error } = await supabase.from('pecas').insert(peca).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pecas'] });
            toast({ title: 'Peça salva com sucesso!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
        },
    });
}

export function useDeletePeca() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('pecas').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pecas'] });
            toast({ title: 'Peça excluída.' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        },
    });
}

// --- Gemini API call ---
export async function generateWithGemini(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Erro ao chamar a API Gemini');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sem resposta gerada.';
}

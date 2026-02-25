import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InboxItem {
    id: string;
    tipo: 'Publicação' | 'Andamento' | 'Documento' | 'Tarefa' | 'Sistema';
    titulo: string;
    descricao: string;
    referencia_id: string | null;
    lido: boolean;
    prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
    owner_id: string;
    created_at: string;
}

export function useInbox() {
    return useQuery<InboxItem[]>({
        queryKey: ['inbox'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inbox_items')
                .select('*')
                .order('created_at', { ascending: false })
                .range(0, 199);
            if (error) throw error;
            return data as InboxItem[];
        },
        staleTime: 1 * 60 * 1000,
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('inbox_items')
                .update({ lido: true })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inbox'] });
        },
        onError: () => {},
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ownerId: string) => {
            const { error } = await supabase
                .from('inbox_items')
                .update({ lido: true })
                .eq('owner_id', ownerId)
                .eq('lido', false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inbox'] });
        },
        onError: () => {},
    });
}

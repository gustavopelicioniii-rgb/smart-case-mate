import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Processo {
    id: string;
    created_at: string;
    updated_at: string;
    number: string;
    client: string;
    court: string;
    class: string;
    subject: string;
    active_party: string;
    passive_party: string;
    responsible: string;
    phase: string;
    status: 'Em andamento' | 'Aguardando prazo' | 'Concluído' | 'Suspenso';
    next_deadline: string | null;
    last_movement: string;
    value: number;
    docs_count: number;
    owner_id: string | null;
}

export type ProcessoInsert = Omit<Processo, 'id' | 'created_at' | 'updated_at'>;
export type ProcessoUpdate = Partial<ProcessoInsert> & { id: string };

export function useProcessos() {
    return useQuery<Processo[]>({
        queryKey: ['processos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('processos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Processo[];
        },
    });
}

export function useProcessoStats() {
    const { data: processos } = useProcessos();

    const stats = {
        total: processos?.length ?? 0,
        emAndamento: processos?.filter(p => p.status === 'Em andamento').length ?? 0,
        aguardandoPrazo: processos?.filter(p => p.status === 'Aguardando prazo').length ?? 0,
        concluidos: processos?.filter(p => p.status === 'Concluído').length ?? 0,
    };

    return stats;
}

export function useCreateProcesso() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (processo: ProcessoInsert) => {
            const { data, error } = await supabase
                .from('processos')
                .insert(processo)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processos'] });
            toast({ title: 'Processo criado com sucesso!' });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro ao criar processo', description: error.message, variant: 'destructive' });
        },
    });
}

export function useUpdateProcesso() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, ...updates }: ProcessoUpdate) => {
            const { data, error } = await supabase
                .from('processos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processos'] });
            toast({ title: 'Processo atualizado!' });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
        },
    });
}

export function useDeleteProcesso() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('processos')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processos'] });
            toast({ title: 'Processo excluído.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        },
    });
}

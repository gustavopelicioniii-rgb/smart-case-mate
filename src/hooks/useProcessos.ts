import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getPlanProcessLimit, useProfile } from '@/hooks/useProfile';

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
    last_checked_at?: string | null;
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
                .order('created_at', { ascending: false })
                .range(0, 499);

            if (error) throw error;
            return data as Processo[];
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useProcessPlanLimit() {
    const { user } = useAuth();
    const { data: profile } = useProfile();
    const { data: processos } = useProcessos();
    const limit = getPlanProcessLimit(profile?.subscription_plan ?? null);
    const currentCount = useMemo(
        () => (processos ?? []).filter((p) => p.owner_id === user?.id).length,
        [processos, user?.id]
    );
    return { limit, currentCount, atLimit: currentCount >= limit };
}

export function useProcessoStats() {
    const { data: processos } = useProcessos();
    return useMemo(() => {
        const stats = (processos ?? []).reduce(
            (acc, p) => {
                acc.total++;
                if (p.status === 'Em andamento') acc.emAndamento++;
                else if (p.status === 'Aguardando prazo') acc.aguardandoPrazo++;
                else if (p.status === 'Concluído') acc.concluidos++;
                return acc;
            },
            { total: 0, emAndamento: 0, aguardandoPrazo: 0, concluidos: 0 }
        );
        return stats;
    }, [processos]);
}

export function useCreateProcesso() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (processo: ProcessoInsert) => {
            if (user?.id) {
                let limit = 40;
                try {
                    const [{ data: profileData }, { count }] = await Promise.all([
                        supabase.from('profiles').select('subscription_plan').eq('id', user.id).single(),
                        supabase.from('processos').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
                    ]);
                    limit = getPlanProcessLimit((profileData as { subscription_plan?: string } | null)?.subscription_plan ?? null);
                    if ((count ?? 0) >= limit) {
                        throw new Error(`Limite do plano atingido (${limit} processos). Atualize seu plano para cadastrar mais processos.`);
                    }
                } catch (e) {
                    if (e instanceof Error && e.message.includes('Limite do plano')) throw e;
                    const { count } = await supabase.from('processos').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);
                    if ((count ?? 0) >= limit) {
                        throw new Error(`Limite do plano atingido (${limit} processos). Atualize seu plano para cadastrar mais processos.`);
                    }
                }
            }
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
            queryClient.invalidateQueries({ queryKey: ['fees'] });
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
            queryClient.invalidateQueries({ queryKey: ['fees'] });
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
            queryClient.invalidateQueries({ queryKey: ['fees'] });
            toast({ title: 'Processo excluído.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        },
    });
}

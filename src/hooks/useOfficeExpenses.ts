import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type OfficeExpenseRow = Database['public']['Tables']['office_expenses']['Row'];
type OfficeExpenseInsert = Database['public']['Tables']['office_expenses']['Insert'];
type OfficeExpenseUpdate = Database['public']['Tables']['office_expenses']['Update'];

/** Retorna lista de despesas do usuário. Em erro (ex.: tabela inexistente), retorna []. */
export function useOfficeExpenses() {
    const { user } = useAuth();
    return useQuery<OfficeExpenseRow[]>({
        queryKey: ['office_expenses', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('office_expenses')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });
            if (error) return [];
            return (data ?? []) as OfficeExpenseRow[];
        },
        enabled: !!user,
    });
}

export function useAddOfficeExpense() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (input: Omit<OfficeExpenseInsert, 'owner_id'>) => {
            if (!user) throw new Error('Não autenticado');
            const { error } = await supabase.from('office_expenses').insert({
                ...input,
                owner_id: user.id,
            } as OfficeExpenseInsert);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['office_expenses'] });
            toast({ title: 'Despesa criada!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao criar despesa', description: e.message, variant: 'destructive' });
        },
    });
}

export function useUpdateOfficeExpense() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, ...updates }: OfficeExpenseUpdate & { id: string }) => {
            const { error } = await supabase
                .from('office_expenses')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['office_expenses'] });
            toast({ title: 'Despesa atualizada!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao atualizar', description: e.message, variant: 'destructive' });
        },
    });
}

export function useDeleteOfficeExpense() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('office_expenses').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['office_expenses'] });
            toast({ title: 'Despesa excluída.' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
        },
    });
}

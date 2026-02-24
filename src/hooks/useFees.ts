import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Fee {
    id: string;
    created_at: string;
    updated_at: string;
    client: string;
    process_number: string;
    description: string;
    value: number;
    status: 'Pago' | 'Pendente' | 'Atrasado' | 'Cancelado';
    due_date: string | null;
    paid_date: string | null;
    owner_id: string | null;
}

export type FeeInsert = Omit<Fee, 'id' | 'created_at' | 'updated_at'>;
export type FeeUpdate = Partial<FeeInsert> & { id: string };

export function useFees() {
    return useQuery<Fee[]>({
        queryKey: ['fees'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('fees')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Fee[];
        },
    });
}

export function useFeeStats() {
    const { data: fees } = useFees();
    const pago = fees?.filter(f => f.status === 'Pago').reduce((sum, f) => sum + Number(f.value), 0) ?? 0;
    const pendente = fees?.filter(f => f.status === 'Pendente').reduce((sum, f) => sum + Number(f.value), 0) ?? 0;
    const atrasado = fees?.filter(f => f.status === 'Atrasado').reduce((sum, f) => sum + Number(f.value), 0) ?? 0;
    return { total: pago + pendente + atrasado, pago, pendente, atrasado };
}

export function useCreateFee() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (fee: FeeInsert) => {
            const { data, error } = await supabase.from('fees').insert(fee).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast({ title: 'Honorário registrado!' }); },
        onError: (e: Error) => { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); },
    });
}

export function useUpdateFee() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, ...updates }: FeeUpdate) => {
            const { error } = await supabase.from('fees').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast({ title: 'Honorário atualizado!' }); },
        onError: (e: Error) => { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); },
    });
}

export function useDeleteFee() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('fees').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast({ title: 'Honorário excluído.' }); },
        onError: (e: Error) => { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); },
    });
}

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExpenseCategory = 'luz' | 'agua' | 'assinaturas' | 'outros';

export interface OfficeExpense {
    id: string;
    created_at: string;
    updated_at: string;
    category: ExpenseCategory;
    description: string;
    value: number;
    status: 'Pago' | 'Pendente' | 'Atrasado' | 'Cancelado';
    due_date: string | null;
    paid_date: string | null;
    owner_id: string | null;
}

export type OfficeExpenseInsert = Omit<OfficeExpense, 'id' | 'created_at' | 'updated_at'>;
export type OfficeExpenseUpdate = Partial<OfficeExpenseInsert> & { id: string };

export function useExpenses() {
    return useQuery<OfficeExpense[]>({
        queryKey: ['office_expenses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('office_expenses')
                .select('*')
                .order('due_date', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .range(0, 499);
            if (error) return [];
            return (data ?? []) as OfficeExpense[];
        },
        staleTime: 2 * 60 * 1000,
    });
}

export function useExpenseStats() {
    const { data: expenses } = useExpenses();
    return useMemo(() => {
        const byCategory: Record<Exclude<ExpenseCategory, 'outros'> | 'outros', { total: number; count: number }> = {
            luz: { total: 0, count: 0 },
            agua: { total: 0, count: 0 },
            assinaturas: { total: 0, count: 0 },
            outros: { total: 0, count: 0 },
        };
        let totalGeral = 0;
        (expenses ?? []).forEach((e) => {
            const v = Number(e.value);
            totalGeral += v;
            if (e.category in byCategory) {
                byCategory[e.category as keyof typeof byCategory].total += v;
                byCategory[e.category as keyof typeof byCategory].count += 1;
            }
        });
        return { byCategory, totalGeral };
    }, [expenses]);
}

export function useCreateExpense() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (expense: OfficeExpenseInsert) => {
            const { data, error } = await supabase.from('office_expenses').insert(expense).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['office_expenses'] });
            toast({ title: 'Despesa registrada!' });
        },
        onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
    });
}

export function useUpdateExpense() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, ...updates }: OfficeExpenseUpdate) => {
            const { error } = await supabase.from('office_expenses').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['office_expenses'] });
            toast({ title: 'Despesa atualizada!' });
        },
        onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
    });
}

export function useDeleteExpense() {
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
        onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
    });
}

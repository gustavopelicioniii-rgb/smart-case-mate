import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Category = 'luz' | 'agua' | 'assinaturas' | 'outros';
type Row = Database['public']['Tables']['office_expense_category_settings']['Row'];

const DEFAULT_NAMES: Record<Category, string> = {
    luz: 'Luz',
    agua: 'Água',
    assinaturas: 'Assinaturas',
    outros: 'Outros',
};

/** Lista configurações de categorias do usuário. */
export function useOfficeExpenseCategorySettings() {
    const { user } = useAuth();
    return useQuery<Row[]>({
        queryKey: ['office_expense_category_settings', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('office_expense_category_settings')
                .select('*')
                .eq('owner_id', user.id);
            if (error) return [];
            return (data ?? []) as Row[];
        },
        enabled: !!user,
    });
}

/** Retorna o nome de exibição da categoria (custom ou padrão). */
export function getCategoryDisplayName(category: Category, settings: Row[] | undefined): string {
    const s = settings?.find((x) => x.category === category);
    return s?.display_name ?? DEFAULT_NAMES[category];
}

/** Retorna o valor de meta/orçamento da categoria. */
export function getCategoryBudgetValue(category: Category, settings: Row[] | undefined): number {
    const s = settings?.find((x) => x.category === category);
    return s?.budget_value ?? 0;
}

export function useUpsertOfficeExpenseCategorySetting() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (input: { category: Category; display_name: string; budget_value: number }) => {
            if (!user) throw new Error('Não autenticado');
            const { error } = await supabase.from('office_expense_category_settings').upsert(
                {
                    owner_id: user.id,
                    category: input.category,
                    display_name: input.display_name,
                    budget_value: input.budget_value,
                },
                { onConflict: 'owner_id,category' }
            );
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['office_expense_category_settings'] });
            toast({ title: 'Categoria atualizada!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao salvar categoria', description: e.message, variant: 'destructive' });
        },
    });
}

export { DEFAULT_NAMES };
export type { Category };

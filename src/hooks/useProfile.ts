import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    phone: string | null;
    oab_number: string | null;
    avatar_url: string | null;
    updated_at: string | null;
}

export function useProfile() {
    const { user } = useAuth();
    return useQuery<Profile | null>({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            return data as Profile;
        },
        enabled: !!user,
    });
}

export function useUpdateProfile() {
    const qc = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();
    return useMutation({
        mutationFn: async (updates: Partial<Omit<Profile, 'id'>>) => {
            if (!user) throw new Error('Não autenticado');
            const { error } = await supabase
                .from('profiles')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', user.id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['profile'] });
            toast({ title: 'Perfil atualizado!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        },
    });
}

export async function changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
}

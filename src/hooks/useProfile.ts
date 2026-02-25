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
    firm_logo_url: string | null;
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

const LOGOS_BUCKET = 'documents';
const LOGOS_PREFIX = 'logos';

export function useUploadFirmLogo() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();
    const updateProfile = useUpdateProfile();

    return useMutation({
        mutationFn: async (file: File) => {
            if (!user) throw new Error('Não autenticado');
            const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
            if (!['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
                throw new Error('Use uma imagem (PNG, JPG, GIF, WebP ou SVG).');
            }
            const path = `${LOGOS_PREFIX}/${user.id}/logo.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from(LOGOS_BUCKET)
                .upload(path, file, { upsert: true, contentType: file.type });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path);
            const publicUrl = urlData.publicUrl;
            await updateProfile.mutateAsync({ firm_logo_url: publicUrl });
            return publicUrl;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['profile'] });
            toast({ title: 'Logo do escritório atualizada!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao enviar logo', description: e.message, variant: 'destructive' });
        },
    });
}

export function useRemoveFirmLogo() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();
    const updateProfile = useUpdateProfile();

    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Não autenticado');
            await updateProfile.mutateAsync({ firm_logo_url: null });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['profile'] });
            toast({ title: 'Logo removida.' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao remover logo', description: e.message, variant: 'destructive' });
        },
    });
}

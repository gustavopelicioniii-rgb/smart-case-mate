import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionPlan = 'start' | 'pro' | 'elite';

export const PLAN_PROCESS_LIMITS: Record<SubscriptionPlan, number> = {
    start: 40,
    pro: 100,
    elite: 250,
};

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    phone: string | null;
    oab_number: string | null;
    avatar_url: string | null;
    firm_logo_url: string | null;
    subscription_plan?: SubscriptionPlan | null;
    updated_at: string | null;
}

export function getPlanProcessLimit(plan: SubscriptionPlan | null | undefined): number {
    if (!plan || !(plan in PLAN_PROCESS_LIMITS)) return PLAN_PROCESS_LIMITS.start;
    return PLAN_PROCESS_LIMITS[plan as SubscriptionPlan];
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

export type UpdateProfileOptions = { silent?: boolean };

export function useUpdateProfile() {
    const qc = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();
    return useMutation({
        mutationFn: async (arg: Partial<Omit<Profile, 'id'>> & UpdateProfileOptions) => {
            if (!user) throw new Error('Não autenticado');
            const { silent, ...updates } = arg;
            const { error } = await supabase
                .from('profiles')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', user.id);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['profile'] });
            if (variables.silent !== true) toast({ title: 'Perfil atualizado!' });
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
            if (uploadError) {
                throw new Error(`Storage: ${uploadError.message}. Confira se o bucket "documents" existe e se as políticas de Storage para logos/ estão aplicadas (migration 20250226130000).`);
            }
            const { data: urlData } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path);
            const publicUrl = urlData.publicUrl;
            try {
                await updateProfile.mutateAsync({ firm_logo_url: publicUrl, silent: true });
            } catch (profileErr) {
                const m = profileErr instanceof Error ? profileErr.message : String(profileErr);
                if (/recursion|policy|RLS|row-level security/i.test(m)) {
                    throw new Error(`Perfil: ${m}. Execute no Supabase (SQL Editor) a migration 20250226140000_profiles_rls_no_recursion.sql.`);
                }
                if (/policy|violates|row-level security/i.test(m)) {
                    throw new Error(`Perfil: ${m}. Execute no Supabase a migration 20250226120000_profiles_update_own.sql.`);
                }
                throw profileErr;
            }
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

/** Extrai o path no bucket a partir da URL pública do Storage (ex.: logos/user-id/logo.png). */
function pathFromPublicUrl(publicUrl: string, bucket: string): string | null {
    try {
        const idx = publicUrl.indexOf(`/object/public/${bucket}/`);
        if (idx === -1) return null;
        return publicUrl.slice(idx + `/object/public/${bucket}/`.length).split('?')[0] || null;
    } catch {
        return null;
    }
}

export function useRemoveFirmLogo() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();
    const updateProfile = useUpdateProfile();
    const { data: profile } = useProfile();

    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Não autenticado');
            const url = profile?.firm_logo_url;
            if (url) {
                const path = pathFromPublicUrl(url, LOGOS_BUCKET);
                if (path) {
                    await supabase.storage.from(LOGOS_BUCKET).remove([path]);
                }
            }
            await updateProfile.mutateAsync({ firm_logo_url: null, silent: true });
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

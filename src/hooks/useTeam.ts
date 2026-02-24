import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    phone: string | null;
    oab_number: string | null;
    updated_at: string | null;
}

export interface UserPermission {
    id: string;
    user_id: string;
    module: string;
    can_view: boolean;
    can_edit: boolean;
}

export function useTeamMembers() {
    return useQuery<TeamMember[]>({
        queryKey: ['team-members'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, phone, oab_number, updated_at')
                .order('full_name');
            if (error) throw error;
            return data as TeamMember[];
        },
    });
}

export function useUserPermissions(userId: string) {
    return useQuery<UserPermission[]>({
        queryKey: ['user-permissions', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_permissions')
                .select('*')
                .eq('user_id', userId);
            if (error) throw error;
            return data as UserPermission[];
        },
        enabled: !!userId,
    });
}

export function useUpdateUserRole() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['team-members'] });
            toast({ title: 'Cargo atualizado!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        },
    });
}

export function useUpdatePermission() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({
            userId,
            module,
            can_view,
            can_edit,
        }: {
            userId: string;
            module: string;
            can_view: boolean;
            can_edit: boolean;
        }) => {
            // Upsert the permission
            const { error } = await supabase
                .from('user_permissions')
                .upsert(
                    { user_id: userId, module, can_view, can_edit },
                    { onConflict: 'user_id,module' }
                );
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        },
    });
}

export function useInviteUser() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ email, fullName }: { email: string; fullName: string }) => {
            // 1. Save current admin session
            const { data: { session: adminSession } } = await supabase.auth.getSession();
            if (!adminSession) throw new Error('Você precisa estar logado');

            // 2. Create the new user with fixed temp password
            const tempPassword = 'senha123';
            const { data, error } = await supabase.auth.signUp({
                email,
                password: tempPassword,
                options: {
                    data: { full_name: fullName, must_change_password: true },
                },
            });
            if (error) throw error;

            // 3. Restore admin session (signUp may have changed the active session)
            await supabase.auth.setSession({
                access_token: adminSession.access_token,
                refresh_token: adminSession.refresh_token,
            });

            return { email, tempPassword, userId: data.user?.id };
        },
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: ['team-members'] });
            toast({
                title: 'Membro criado com sucesso!',
                description: `Email: ${result.email} — Senha temporária: ${result.tempPassword}`,
                duration: 15000,
            });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao convidar', description: e.message, variant: 'destructive' });
        },
    });
}

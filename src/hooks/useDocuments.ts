import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Document {
    id: string;
    created_at: string;
    name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    process_number: string;
    description: string;
    uploaded_by: string | null;
}

export function useDocuments() {
    return useQuery<Document[]>({
        queryKey: ['documents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Document[];
        },
    });
}

export function useUploadDocument() {
    const qc = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ file, processNumber, description }: {
            file: File;
            processNumber?: string;
            description?: string;
        }) => {
            // 1. Upload file to Storage
            const timestamp = Date.now();
            const filePath = `${timestamp}_${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get the user
            const { data: { user } } = await supabase.auth.getUser();

            // 3. Insert metadata into documents table
            const { data, error: insertError } = await supabase
                .from('documents')
                .insert({
                    name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    mime_type: file.type,
                    process_number: processNumber || '',
                    description: description || '',
                    uploaded_by: user?.id ?? null,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });
            toast({ title: 'Documento enviado com sucesso!' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao enviar documento', description: e.message, variant: 'destructive' });
        },
    });
}

export function useDeleteDocument() {
    const qc = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([filePath]);
            if (storageError) console.warn('Storage delete error:', storageError.message);

            // Delete from database
            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });
            toast({ title: 'Documento excluído.' });
        },
        onError: (e: Error) => {
            toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
        },
    });
}

export function getDocumentUrl(filePath: string): string {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

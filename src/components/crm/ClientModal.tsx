import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCrmClient, useUpdateCrmClient, type CrmClient, type CrmClientInsert } from "@/hooks/useCrm";
import { useAuth } from "@/contexts/AuthContext";

interface ClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: CrmClient | null;
    stageId: string;
    position: number;
}

export default function ClientModal({ open, onOpenChange, client, stageId, position }: ClientModalProps) {
    const { user } = useAuth();
    const createMutation = useCreateCrmClient();
    const updateMutation = useUpdateCrmClient();
    const isEditing = !!client;

    const [form, setForm] = useState({
        name: client?.name ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        source: client?.source ?? "",
        notes: client?.notes ?? "",
    });

    const set = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;

        if (isEditing && client) {
            await updateMutation.mutateAsync({ id: client.id, ...form });
        } else {
            const newClient: CrmClientInsert = {
                ...form,
                stage_id: stageId,
                position,
                owner_id: user?.id ?? null,
            };
            await createMutation.mutateAsync(newClient);
        }
        onOpenChange(false);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                        {isEditing ? "Editar Cliente" : "Novo Cliente"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input id="name" placeholder="Nome do cliente" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" placeholder="(11) 99999-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="source">Origem</Label>
                        <Input id="source" placeholder="Instagram, Indicação, Google..." value={form.source} onChange={(e) => set("source", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea id="notes" placeholder="Anotações sobre o cliente..." value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Adicionar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

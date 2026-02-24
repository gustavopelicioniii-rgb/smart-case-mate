import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateFee, useUpdateFee, type Fee, type FeeInsert } from "@/hooks/useFees";
import { useAuth } from "@/contexts/AuthContext";

interface FeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fee?: Fee | null;
}

export default function FeeModal({ open, onOpenChange, fee }: FeeModalProps) {
    const { user } = useAuth();
    const createMutation = useCreateFee();
    const updateMutation = useUpdateFee();
    const isEditing = !!fee;

    const [form, setForm] = useState({
        client: fee?.client ?? "",
        process_number: fee?.process_number ?? "",
        description: fee?.description ?? "",
        value: fee?.value ?? 0,
        status: fee?.status ?? "Pendente" as Fee['status'],
        due_date: fee?.due_date ?? null as string | null,
        paid_date: fee?.paid_date ?? null as string | null,
    });

    const set = (field: string, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.client) return;

        if (isEditing && fee) {
            await updateMutation.mutateAsync({ id: fee.id, ...form, owner_id: fee.owner_id });
        } else {
            const newFee: FeeInsert = { ...form, owner_id: user?.id ?? null };
            await createMutation.mutateAsync(newFee);
        }
        onOpenChange(false);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                        {isEditing ? "Editar Honorário" : "Novo Honorário"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="client">Cliente *</Label>
                        <Input id="client" placeholder="Nome do cliente" value={form.client} onChange={(e) => set("client", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="process_number">Processo</Label>
                        <Input id="process_number" placeholder="0012345-67.2024" value={form.process_number} onChange={(e) => set("process_number", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" placeholder="Honorários advocatícios, consulta..." value={form.description} onChange={(e) => set("description", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Valor (R$) *</Label>
                            <Input id="value" type="number" step="0.01" placeholder="0,00" value={form.value} onChange={(e) => set("value", parseFloat(e.target.value) || 0)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={(v) => set("status", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                    <SelectItem value="Pago">Pago</SelectItem>
                                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Vencimento</Label>
                            <Input id="due_date" type="date" value={form.due_date ?? ""} onChange={(e) => set("due_date", e.target.value || null)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paid_date">Data de Pagamento</Label>
                            <Input id="paid_date" type="date" value={form.paid_date ?? ""} onChange={(e) => set("paid_date", e.target.value || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Registrar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

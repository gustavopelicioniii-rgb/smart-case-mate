import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AgendaEvent } from "@/types/agenda";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["agenda_events"]["Row"];
type Insert = Database["public"]["Tables"]["agenda_events"]["Insert"];

function rowToAgendaEvent(row: Row): AgendaEvent {
  const dataDate = new Date(row.data + "T12:00:00");
  const tipo = (row.tipo === "audiencia" || row.tipo === "reuniao" || row.tipo === "reuniao-meet" || row.tipo === "reuniao-zoom")
    ? row.tipo
    : "reuniao";
  return {
    id: row.id,
    titulo: row.titulo,
    tipo: tipo as AgendaEvent["tipo"],
    data: dataDate,
    hora: row.hora_inicio,
    horaFim: row.hora_fim || undefined,
    cliente: row.cliente_nome ?? undefined,
    clienteId: row.cliente_id ?? undefined,
    processo: row.processo_numero ?? undefined,
    processoId: row.processo_id ?? undefined,
    link: row.link ?? undefined,
    status: (row.status as AgendaEvent["status"]) ?? "agendada",
    participantes: row.participantes ? row.participantes.split(",").map((p) => p.trim()).filter(Boolean) : undefined,
  };
}

export function useAgendaEvents() {
  return useQuery({
    queryKey: ["agenda_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*")
        .order("data", { ascending: true })
        .order("hora_inicio", { ascending: true });
      if (error) throw error;
      return (data as Row[]).map(rowToAgendaEvent);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      titulo: string;
      tipo: string;
      data: string;
      hora_inicio: string;
      hora_fim: string;
      participantes?: string;
      cliente_id?: string;
      processo_id?: string;
      cliente_nome?: string;
      processo_numero?: string;
      link?: string;
      owner_id: string | null;
    }) => {
      const row: Insert = {
        owner_id: input.owner_id,
        titulo: input.titulo,
        tipo: input.tipo,
        data: input.data,
        hora_inicio: input.hora_inicio,
        hora_fim: input.hora_fim,
        participantes: input.participantes || null,
        cliente_id: input.cliente_id || null,
        processo_id: input.processo_id || null,
        cliente_nome: input.cliente_nome || null,
        processo_numero: input.processo_numero || null,
        link: input.link || null,
        status: "agendada",
      };
      const { data, error } = await supabase.from("agenda_events").insert(row).select().single();
      if (error) {
        const e = new Error(error.message) as Error & { details?: string; hint?: string };
        e.details = error.details;
        e.hint = error.hint;
        throw e;
      }
      return data as Row;
    },
    onSuccess: (data: Row) => {
      const newEvent = rowToAgendaEvent(data);
      queryClient.setQueryData<AgendaEvent[]>(["agenda_events"], (prev) =>
        prev ? [...prev, newEvent] : [newEvent]
      );
      queryClient.invalidateQueries({ queryKey: ["agenda_events"] });
      queryClient.refetchQueries({ queryKey: ["agenda_events"] });
    },
  });
}

type UpdatePayload = {
  id: string;
  titulo?: string;
  tipo?: string;
  data?: string;
  hora_inicio?: string;
  hora_fim?: string;
  participantes?: string | null;
  cliente_id?: string | null;
  processo_id?: string | null;
  cliente_nome?: string | null;
  processo_numero?: string | null;
  link?: string | null;
  status?: string;
};

export function useUpdateAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const { id, ...updates } = payload;
      const toUpdate: Record<string, unknown> = {};
      if (updates.titulo !== undefined) toUpdate.titulo = updates.titulo;
      if (updates.tipo !== undefined) toUpdate.tipo = updates.tipo;
      if (updates.data !== undefined) toUpdate.data = updates.data;
      if (updates.hora_inicio !== undefined) toUpdate.hora_inicio = updates.hora_inicio;
      if (updates.hora_fim !== undefined) toUpdate.hora_fim = updates.hora_fim;
      if (updates.participantes !== undefined) toUpdate.participantes = updates.participantes;
      if (updates.cliente_id !== undefined) toUpdate.cliente_id = updates.cliente_id;
      if (updates.processo_id !== undefined) toUpdate.processo_id = updates.processo_id;
      if (updates.cliente_nome !== undefined) toUpdate.cliente_nome = updates.cliente_nome;
      if (updates.processo_numero !== undefined) toUpdate.processo_numero = updates.processo_numero;
      if (updates.link !== undefined) toUpdate.link = updates.link;
      if (updates.status !== undefined) toUpdate.status = updates.status;
      const { data, error } = await supabase.from("agenda_events").update(toUpdate).eq("id", id).select().single();
      if (error) throw error;
      return data as Row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_events"] });
      queryClient.refetchQueries({ queryKey: ["agenda_events"] });
    },
  });
}

export function useDeleteAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_events"] });
      queryClient.refetchQueries({ queryKey: ["agenda_events"] });
    },
  });
}

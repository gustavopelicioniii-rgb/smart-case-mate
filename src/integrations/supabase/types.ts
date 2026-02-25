export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: string | null;
          phone: string | null;
          oab_number: string | null;
          avatar_url: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      processos: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          number: string;
          client: string;
          court: string;
          class: string;
          subject: string;
          active_party: string;
          passive_party: string;
          responsible: string;
          phase: string;
          status: 'Em andamento' | 'Aguardando prazo' | 'Concluído' | 'Suspenso';
          next_deadline: string | null;
          last_movement: string;
          value: number;
          docs_count: number;
          owner_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['processos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['processos']['Insert']>;
      };
      deadlines: {
        Row: {
          id: string;
          process_id: string;
          titulo: string;
          descricao: string;
          data_inicio: string;
          data_fim: string;
          dias_uteis: number;
          status: 'Pendente' | 'Concluído' | 'Vencido' | 'Cancelado';
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['deadlines']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['deadlines']['Insert']>;
      };
      feriados_forenses: {
        Row: {
          data: string;
          descricao: string;
          tribunal: string;
        };
        Insert: Database['public']['Tables']['feriados_forenses']['Row'];
        Update: Partial<Database['public']['Tables']['feriados_forenses']['Row']>;
      };
      fees: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          client: string;
          process_number: string;
          description: string;
          value: number;
          status: 'Pago' | 'Pendente' | 'Atrasado' | 'Cancelado';
          due_date: string | null;
          paid_date: string | null;
          owner_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['fees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['fees']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          process_number: string;
          description: string;
          uploaded_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      inbox_items: {
        Row: {
          id: string;
          tipo: 'Publicação' | 'Andamento' | 'Documento' | 'Tarefa' | 'Sistema';
          titulo: string;
          descricao: string;
          referencia_id: string | null;
          lido: boolean;
          prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
          owner_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inbox_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['inbox_items']['Insert']>;
      };
      crm_stages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          color: string;
          position: number;
          owner_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['crm_stages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['crm_stages']['Insert']>;
      };
      crm_clients: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string;
          phone: string;
          source: string;
          notes: string;
          stage_id: string;
          position: number;
          owner_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['crm_clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['crm_clients']['Insert']>;
      };
      whatsapp_config: {
        Row: {
          id: string;
          owner_id: string;
          provider: 'cloud_api' | 'z_api' | 'evolution_api';
          api_url: string;
          api_key: string;
          instance_id: string;
          phone_number: string;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['whatsapp_config']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['whatsapp_config']['Insert']>;
      };
      whatsapp_messages: {
        Row: {
          id: string;
          owner_id: string | null;
          contact_name: string;
          contact_phone: string;
          message_text: string;
          direction: 'incoming' | 'outgoing';
          media_url: string;
          status: string;
          crm_client_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['whatsapp_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['whatsapp_messages']['Insert']>;
      };
      pecas: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          tipo: string;
          context: string;
          generated_text: string;
          process_number: string;
          owner_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['pecas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pecas']['Insert']>;
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          module: string;
          can_view: boolean;
          can_edit: boolean;
        };
        Insert: Omit<Database['public']['Tables']['user_permissions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_permissions']['Insert']>;
      };
    };
  };
}

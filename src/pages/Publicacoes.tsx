import { useMemo } from "react";
import { motion } from "framer-motion";
import { Newspaper, Bell, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInbox } from "@/hooks/useInbox";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const Publicacoes = () => {
  const { data: inboxItems } = useInbox();

  const publications = useMemo(() => {
    return (inboxItems ?? [])
      .filter((item) => item.tipo === "Publicação")
      .slice(0, 50)
      .map((item) => ({
        title: item.titulo,
        date: item.created_at ? format(parseISO(item.created_at), "d MMM yyyy", { locale: ptBR }) : "—",
        type: "Publicação",
        read: item.lido,
        summary: item.descricao?.slice(0, 120) || "",
      }));
  }, [inboxItems]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Publicações</h1>
        <p className="mt-1 text-muted-foreground">Diário oficial e intimações dos seus processos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Publicações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {publications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma publicação recente.</p>
              <p className="text-xs text-muted-foreground mt-1">Itens do tipo &quot;Publicação&quot; na Inbox aparecem aqui.</p>
            </div>
          ) : (
            publications.map((p, i) => (
              <div key={i} className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all hover:bg-muted/50 ${!p.read ? "border-primary/30 bg-primary/[0.02]" : "border-border"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!p.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {!p.read ? <Bell className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${!p.read ? "text-foreground" : "text-muted-foreground"}`}>{p.title}</p>
                    {!p.read && <Badge variant="default" className="text-[10px] h-5">Nova</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{p.summary}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{p.type}</Badge>
                    <span className="text-xs text-muted-foreground">{p.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Publicacoes;

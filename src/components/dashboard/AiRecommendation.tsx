import { useMemo } from "react";
import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFees } from "@/hooks/useFees";
import { useProcessos } from "@/hooks/useProcessos";
import { useCrmClients, useCrmStages } from "@/hooks/useCrm";

const typeStyles = {
  opportunity: "bg-success/10 text-success border-success/20",
  risk: "bg-warning/10 text-warning border-warning/20",
  insight: "bg-info/10 text-info border-info/20",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface Rec {
  icon: React.ElementType;
  title: string;
  text: string;
  type: "opportunity" | "risk" | "insight";
}

const AiRecommendation = () => {
  const { data: fees } = useFees();
  const { data: processos } = useProcessos();
  const { data: crmClients } = useCrmClients();
  const { data: stages } = useCrmStages();

  const recommendations = useMemo(() => {
    const list: Rec[] = [];
    const now = new Date();

    const atrasados = (fees ?? []).filter((f) => f.status === "Atrasado");
    const allClients = [...new Set((fees ?? []).map((f) => f.client).filter(Boolean))];
    const clientesInadimplentes = [...new Set(atrasados.map((f) => f.client).filter(Boolean))];
    if (allClients.length > 0 && clientesInadimplentes.length > 0) {
      const pct = Math.round((clientesInadimplentes.length / allClients.length) * 100);
      list.push({
        icon: AlertTriangle,
        title: "Inadimplência",
        text: `${pct}% dos seus clientes com honorários estão em atraso (${clientesInadimplentes.length} de ${allClients.length}). Sugestão: automatizar cobrança recorrente.`,
        type: "risk",
      });
    }

    const semMovimento = (processos ?? []).filter((p) => {
      if (p.status !== "Em andamento") return false;
      const up = new Date(p.updated_at);
      const diff = (now.getTime() - up.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 30;
    });
    if (semMovimento.length > 0) {
      list.push({
        icon: Lightbulb,
        title: "Processos parados",
        text: `${semMovimento.length} processo(s) sem movimentação há mais de 30 dias. Verifique se há pendências ou oportunidades de acordo.`,
        type: "insight",
      });
    }

    const totalPendente = (fees ?? []).filter((f) => f.status === "Pendente" || f.status === "Atrasado").reduce((s, f) => s + Number(f.value), 0);
    if (totalPendente > 0) {
      list.push({
        icon: TrendingUp,
        title: "Receita a receber",
        text: `Você tem ${formatCurrency(totalPendente)} em honorários pendentes ou em atraso. Acompanhe no módulo Financeiro e envie cobranças.`,
        type: "opportunity",
      });
    }

    const lastStageId = stages?.length ? stages[stages.length - 1]?.id : null;
    const converted = lastStageId ? (crmClients?.filter((c) => c.stage_id === lastStageId).length ?? 0) : 0;
    const totalCrm = crmClients?.length ?? 0;
    if (totalCrm > 0 && converted < totalCrm) {
      const pct = Math.round((converted / totalCrm) * 100);
      list.push({
        icon: TrendingUp,
        title: "Pipeline CRM",
        text: `${pct}% dos clientes (${converted} de ${totalCrm}) estão na última etapa do pipeline. Invista em conversão dos demais.`,
        type: "opportunity",
      });
    }

    if (list.length === 0) {
      list.push({
        icon: Brain,
        title: "Tudo em ordem",
        text: "Não há recomendações críticas no momento. Continue cadastrando processos, honorários e clientes para receber insights personalizados.",
        type: "insight",
      });
    }

    return list;
  }, [fees, processos, crmClients, stages]);

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          Recomendação Estratégica da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 transition-all hover:scale-[1.005] cursor-pointer ${typeStyles[rec.type]}`}
          >
            <div className="flex items-start gap-3">
              <rec.icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">{rec.title}</p>
                <p className="text-sm mt-1 opacity-90">{rec.text}</p>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full mt-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground">
          <Brain className="h-4 w-4 mr-2" />
          Ver mais recomendações
        </Button>
      </CardContent>
    </Card>
  );
};

export default AiRecommendation;

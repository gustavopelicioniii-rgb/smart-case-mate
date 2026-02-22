import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const recommendations = [
  {
    icon: TrendingUp,
    title: "Foco em Trabalhista",
    text: "65% da sua receita vem de ações trabalhistas. Sugestão: investir em captação nesse nicho para maximizar ROI.",
    type: "opportunity" as const,
  },
  {
    icon: AlertTriangle,
    title: "Inadimplência Alta",
    text: "30% dos seus clientes estão inadimplentes. Sugestão: automatizar cobrança recorrente para reduzir em 50%.",
    type: "risk" as const,
  },
  {
    icon: Lightbulb,
    title: "Processos Parados",
    text: "4 processos sem movimentação há mais de 30 dias. Verifique se há pendências ou oportunidades de acordo.",
    type: "insight" as const,
  },
];

const typeStyles = {
  opportunity: "bg-success/10 text-success border-success/20",
  risk: "bg-warning/10 text-warning border-warning/20",
  insight: "bg-info/10 text-info border-info/20",
};

const AiRecommendation = () => (
  <Card className="border-primary/20 bg-primary/[0.02]">
    <CardHeader className="pb-3">
      <CardTitle className="font-display text-xl flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        🧠 Recomendação Estratégica da IA
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

export default AiRecommendation;

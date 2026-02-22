import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronDown, CheckCircle2, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HealthScoreProps {
  score: number;
  label: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { bg: "bg-success/15", text: "text-success", ring: "ring-success/30" };
  if (score >= 60) return { bg: "bg-warning/15", text: "text-warning", ring: "ring-warning/30" };
  return { bg: "bg-destructive/15", text: "text-destructive", ring: "ring-destructive/30" };
};

const getScoreEmoji = (score: number) => {
  if (score >= 80) return "🟢";
  if (score >= 60) return "🟠";
  return "🔴";
};

const breakdownItems = [
  { icon: CheckCircle2, label: "Prazos organizados", value: "90%", status: "good" as const },
  { icon: AlertTriangle, label: "Honorários em risco", value: "3 pendentes", status: "warning" as const },
  { icon: TrendingDown, label: "Processo com baixa probabilidade", value: "1 identificado", status: "warning" as const },
  { icon: DollarSign, label: "Receita projetada", value: "Positiva", status: "good" as const },
];

const statusStyles = {
  good: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  bad: "text-destructive bg-destructive/10",
};

const HealthScore = ({ score, label }: HealthScoreProps) => {
  const [expanded, setExpanded] = useState(false);
  const colors = getScoreColor(score);

  return (
    <Card
      className={`relative overflow-hidden border-2 ${colors.ring} ring-2 cursor-pointer transition-all`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={colors.text}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${colors.text}`}>{score}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Activity className={`h-4 w-4 ${colors.text}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Índice de Saúde
              </span>
            </div>
            <p className={`text-lg font-bold ${colors.text}`}>
              {getScoreEmoji(score)} {score}/100
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {breakdownItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-lg p-2.5 bg-muted/30">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${statusStyles[item.status]}`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${item.status === "good" ? "text-success" : "text-warning"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default HealthScore;

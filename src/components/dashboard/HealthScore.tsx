import { motion } from "framer-motion";
import { Activity } from "lucide-react";
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

const HealthScore = ({ score, label }: HealthScoreProps) => {
  const colors = getScoreColor(score);

  return (
    <Card className={`relative overflow-hidden border-2 ${colors.ring} ring-2`}>
      <CardContent className="p-6 flex items-center gap-5">
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
        <div>
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
      </CardContent>
    </Card>
  );
};

export default HealthScore;

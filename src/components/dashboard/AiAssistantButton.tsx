import { useState } from "react";
import { Brain, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const suggestions = [
  "Quais processos têm maior risco?",
  "Quem está inadimplente?",
  "Qual área gera mais receita?",
  "Onde estou perdendo dinheiro?",
];

const AiAssistantButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        size="icon"
      >
        {open ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
      </Button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <Card className="shadow-2xl border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Perguntar à IA
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Pergunte qualquer coisa sobre seu escritório
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="w-full text-left text-sm p-2.5 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Input placeholder="Digite sua pergunta..." className="text-sm" />
                <Button size="icon" variant="default">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AiAssistantButton;

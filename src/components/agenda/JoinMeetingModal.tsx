import { useState, useEffect } from "react";
import { Video, Loader2, ExternalLink, Users, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AgendaEvent } from "@/types/agenda";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface JoinMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: AgendaEvent | null;
}

const JoinMeetingModal = ({ open, onOpenChange, event }: JoinMeetingModalProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!event) return null;

  const handleOpenMeeting = () => {
    if (event.link) {
      window.open(event.link, "_blank");
    }
    toast.success("Reunião aberta em nova aba", { description: event.titulo });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Video className="h-5 w-5 text-success" />
            Entrar na Reunião
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Preparando sua reunião…</p>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <h3 className="font-semibold text-foreground">{event.titulo}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {event.hora}{event.horaFim && ` – ${event.horaFim}`}
                </div>
                {event.participantes && event.participantes.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {event.participantes.join(", ")}
                  </div>
                )}
                {event.link && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono break-all">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    {event.link}
                  </div>
                )}
              </div>

              <Button onClick={handleOpenMeeting} className="w-full bg-success text-success-foreground hover:bg-success/90 gap-2">
                <Video className="h-4 w-4" />
                Abrir Reunião
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default JoinMeetingModal;

import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<div style=\"padding:24px;font-family:system-ui;color:#dc2626;\">Erro: elemento #root não encontrado.</div>";
} else {
  try {
    createRoot(rootEl).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    rootEl.innerHTML = `<div style="padding:24px;font-family:system-ui;color:#0f172a;max-width:560px;"><p style="color:#dc2626;font-weight:600;">Erro ao iniciar a aplicação</p><p style="margin:8px 0;font-size:0.875rem;">${msg}</p><p style="margin-top:16px;font-size:0.75rem;color:#64748b;">Verifique as variáveis de ambiente na Vercel (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) e o Console do navegador (F12).</p></div>`;
  }
}

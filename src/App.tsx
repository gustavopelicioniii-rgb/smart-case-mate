import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Processos from "./pages/Processos";
import Pecas from "./pages/Pecas";
import CRM from "./pages/CRM";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import Documentos from "./pages/Documentos";
import Publicacoes from "./pages/Publicacoes";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/processos" element={<Processos />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/pecas" element={<Pecas />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/publicacoes" element={<Publicacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

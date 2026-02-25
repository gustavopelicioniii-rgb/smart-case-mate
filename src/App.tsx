import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Processos from "./pages/Processos";
import ProcessoDetail from "./pages/ProcessoDetail";
import Pecas from "./pages/Pecas";
import CRM from "./pages/CRM";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import Documentos from "./pages/Documentos";
import Publicacoes from "./pages/Publicacoes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Equipe from "./pages/Equipe";
import WhatsAppPage from "./pages/WhatsApp";
import MobileMenu from "./pages/MobileMenu";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/processos/:id" element={<ProcessoDetail />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/pecas" element={<Pecas />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/documentos" element={<ErrorBoundary><Documentos /></ErrorBoundary>} />
              <Route path="/publicacoes" element={<Publicacoes />} />
              <Route path="/relatorios" element={
                <ProtectedRoute requiredRole="admin">
                  <Relatorios />
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/equipe" element={
                <ProtectedRoute requiredRole="admin">
                  <Equipe />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/menu" element={<MobileMenu />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

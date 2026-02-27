import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyPermissions } from "@/hooks/useTeam";

const PATH_TO_MODULE: Record<string, string> = {
  "/processos": "processos",
  "/agenda": "agenda",
  "/pecas": "pecas",
  "/crm": "crm",
  "/financeiro": "financeiro",
  "/documentos": "documentos",
  "/publicacoes": "publicacoes",
  "/relatorios": "relatorios",
  "/configuracoes": "configuracoes",
};

/** Redireciona para / se o usuário acessar uma rota de módulo sem permissão can_view. */
export default function PermissionRedirect() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAdmin, byModule } = useMyPermissions();

  useEffect(() => {
    if (isAdmin) return;
    const first = pathname.split("/").filter(Boolean)[0];
    if (!first) return;
    const basePath = "/" + first;
    const module = PATH_TO_MODULE[basePath];
    if (module && !byModule(module).can_view) {
      navigate("/", { replace: true });
    }
  }, [pathname, isAdmin, byModule, navigate]);

  return null;
}

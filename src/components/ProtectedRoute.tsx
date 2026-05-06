
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation, useParams } from "react-router-dom";
import GhostLoader from "@/components/ui/ghost-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, userStores } = useAuth();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const location = useLocation();

  console.log("ProtectedRoute - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "storeSlug:", storeSlug);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <GhostLoader size="medium" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estivermos em uma rota de loja (/admin)
  if (storeSlug) {
    const hasAccess = userStores.some(store => store.slug === storeSlug);

    if (!hasAccess) {
      console.log(`Usuário não tem acesso à loja ${storeSlug}, redirecionando`);
      return <Navigate to="/" state={{ message: "Você não tem permissão para acessar esta loja" }} replace />;
    }
  }

  console.log("Acesso liberado");
  return <>{children}</>;
};

export default ProtectedRoute;

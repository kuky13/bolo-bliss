
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import GhostLoader from "@/components/ui/ghost-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <GhostLoader size="medium" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    // Redirect to login and remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log("Usuário autenticado mas não é admin, redirecionando para home");
    // Usuário está autenticado mas não é admin
    return <Navigate to="/" state={{ message: "Acesso restrito a administradores" }} replace />;
  }

  console.log("Acesso liberado para admin");
  return <>{children}</>;
};

export default ProtectedRoute;

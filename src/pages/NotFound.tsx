
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Gamepad2 } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold mb-2 text-gradient">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Página não encontrada</p>
        
        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full flex items-center justify-center gap-2">
              <Home size={18} />
              Voltar para Início
            </Button>
          </Link>
          
          <Link to="/easteregg" className="block">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Gamepad2 size={18} />
              Jogar um jogo enquanto isso?
            </Button>
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          A página que você está procurando pode ter sido removida ou está temporariamente indisponível.
        </p>
      </div>
    </div>
  );
};

export default NotFound;

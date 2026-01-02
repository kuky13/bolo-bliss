
import React from "react";
import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EasterEggAlertProps {
  show: boolean;
}

const EasterEggAlert: React.FC<EasterEggAlertProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="mb-4 sm:mb-6 animate-fade-in">
      <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 border-store-pink/20 shadow-md hover:shadow-lg transition-all">
        <Gamepad2 className="h-5 w-5 text-store-pink bounce-gentle" />
        <AlertTitle className="text-store-pink font-medium flex items-center gap-2">
          Easter Egg encontrado!
        </AlertTitle>
        <AlertDescription className="text-gray-700">
          <p className="mb-2">Você encontrou um jogo secreto :D</p>
          <Link to="/easteregg">
            <Button size="sm" className="mt-1 bg-gradient-to-r from-store-pink to-store-purple shadow-md hover:shadow-xl transition-all">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Jogar Agora
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EasterEggAlert;


import React from "react";
import { HelpCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Componente HelpTooltip - Exibe uma dica de ajuda quando o usuário passa o mouse sobre o ícone
 * 
 * Este componente é usado nas páginas de configuração para fornecer explicações
 * adicionais sobre campos e funcionalidades.
 * 
 * @param {string} text - O texto de ajuda que será exibido no tooltip
 * @example
 * <HelpTooltip text="Este é o nome da sua loja que será exibido no cabeçalho" />
 */
interface HelpTooltipProps {
  text: string;
}

const HelpTooltip = ({ text }: HelpTooltipProps) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-primary/60 ml-2 cursor-help transition-colors hover:text-primary hover:scale-110" />
      </TooltipTrigger>
      <TooltipContent className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-none shadow-xl text-white animate-scale-in max-w-xs rounded-lg p-3">
        <p className="text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default HelpTooltip;

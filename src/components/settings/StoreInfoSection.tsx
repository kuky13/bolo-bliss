import React from "react";
import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  text: string;
}

const HelpTooltip = ({ text }: HelpTooltipProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface StoreInfoSectionProps {
  storeName: string;
  whatsappNumber: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const StoreInfoSection = ({ 
  storeName, 
  whatsappNumber, 
  onInputChange 
}: StoreInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="storeName" className="text-sm font-medium">Nome da Loja</Label>
          <HelpTooltip text="Este é o nome que aparecerá no topo do site e nos pedidos" />
        </div>
        <Input
          id="storeName"
          name="storeName"
          value={storeName}
          onChange={onInputChange}
          placeholder="Ex: Minha Loja Online"
          required
          className="h-12 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="whatsappNumber" className="text-sm font-medium">Número do WhatsApp</Label>
          <HelpTooltip text="Este número receberá as mensagens de pedidos. Use o formato internacional" />
        </div>
        <Input
          id="whatsappNumber"
          name="whatsappNumber"
          value={whatsappNumber}
          onChange={onInputChange}
          placeholder="5511999999999"
          required
          className="h-12 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <p className="text-xs text-muted-foreground">
          Formato: 55 (Brasil) + DDD + número. Ex: 5511999999999
        </p>
      </div>
    </div>
  );
};

export default StoreInfoSection;

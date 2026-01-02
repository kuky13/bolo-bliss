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

interface DeliverySettingsSectionProps {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DeliverySettingsSection = ({
  deliveryFee,
  freeDeliveryThreshold,
  onInputChange
}: DeliverySettingsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="deliveryFee" className="text-sm font-medium">Taxa (R$)</Label>
            <HelpTooltip text="Valor cobrado pela entrega" />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
            <Input
              id="deliveryFee"
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={onInputChange}
              placeholder="0.00"
              className="h-12 pl-10 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="freeDeliveryThreshold" className="text-sm font-medium">Grátis acima de</Label>
            <HelpTooltip text="Pedidos acima deste valor têm frete grátis" />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
            <Input
              id="freeDeliveryThreshold"
              name="freeDeliveryThreshold"
              type="number"
              min="0"
              step="0.01"
              value={freeDeliveryThreshold}
              onChange={onInputChange}
              placeholder="0.00"
              className="h-12 pl-10 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Deixe "Grátis acima de" como 0 para desativar o frete grátis automático.
      </p>
    </div>
  );
};

export default DeliverySettingsSection;

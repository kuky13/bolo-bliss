
import React from "react";
import { Truck, Store } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile.tsx";

interface DeliveryMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DeliveryMethodSelector = ({ value, onChange }: DeliveryMethodSelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`rounded-xl border bg-gradient-to-br from-white to-gray-50/40 dark:from-card dark:to-muted/40 shadow-sm backdrop-blur-sm ${isMobile ? 'p-3' : 'p-6'}`}>
      <RadioGroup value={value} onValueChange={onChange} className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
        <div 
          onClick={() => onChange("delivery")}
          className={`flex flex-col items-center justify-center ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4'} rounded-xl border-2 transition-all cursor-pointer ${value === "delivery" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}
        >
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center`}>
            <Truck className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" className={isMobile ? 'h-4 w-4' : ''} />
            <Label htmlFor="delivery" className={`font-medium ${isMobile ? 'text-xs' : 'text-base'} cursor-pointer`}>
              {isMobile ? 'Entrega' : 'Entrega a Domicílio'}
            </Label>
          </div>
        </div>
        
        <div 
          onClick={() => onChange("pickup")}
          className={`flex flex-col items-center justify-center ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4'} rounded-xl border-2 transition-all cursor-pointer ${value === "pickup" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}
        >
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center`}>
            <Store className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" className={isMobile ? 'h-4 w-4' : ''} />
            <Label htmlFor="pickup" className={`font-medium ${isMobile ? 'text-xs' : 'text-base'} cursor-pointer`}>
              Retirada
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default DeliveryMethodSelector;

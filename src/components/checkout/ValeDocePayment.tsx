import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useValeDoce } from "@/context/ValeDoceContext";
import { Candy, Sparkles } from "lucide-react";

interface ValeDocePaymentProps {
  total: number;
  valedoceAmount: number;
  onValeDoceAmountChange: (amount: number) => void;
  isUsingValeDoce: boolean;
  onUseValeDoceChange: (use: boolean) => void;
}

const ValeDocePayment = ({
  total,
  valedoceAmount,
  onValeDoceAmountChange,
  isUsingValeDoce,
  onUseValeDoceChange
}: ValeDocePaymentProps) => {
  const { balance, settings, currentAffiliate } = useValeDoce();

  // Se não é afiliado ou não tem saldo, não mostrar
  if (!currentAffiliate || balance <= 0) {
    return null;
  }

  const maxValeDoceCanUse = Math.min(balance, Math.floor(total / settings.valedoceValue));
  const discountAmount = valedoceAmount * settings.valedoceValue;
  const remainingTotal = total - discountAmount;

  return (
    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-2">
              <Candy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Pagar com ValeDoce</h3>
              <p className="text-xs text-muted-foreground">
                Saldo: {balance} ValeDoce (R$ {(balance * settings.valedoceValue).toFixed(2)})
              </p>
            </div>
          </div>
          <Switch
            checked={isUsingValeDoce}
            onCheckedChange={onUseValeDoceChange}
          />
        </div>

        {isUsingValeDoce && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Quantidade a usar:</Label>
                <span className="font-semibold text-pink-600">
                  {valedoceAmount} ValeDoce
                </span>
              </div>
              <Slider
                value={[valedoceAmount]}
                onValueChange={(value) => onValeDoceAmountChange(value[0])}
                max={maxValeDoceCanUse}
                min={0}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Máximo: {maxValeDoceCanUse}</span>
              </div>
            </div>

            {valedoceAmount > 0 && (
              <div className="bg-white rounded-lg p-3 space-y-2 border border-pink-100">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto ValeDoce:</span>
                  <span className="text-green-600 font-medium">
                    -R$ {discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Restante a pagar:</span>
                  <span className="text-primary">R$ {remainingTotal.toFixed(2)}</span>
                </div>
                {remainingTotal === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-xs mt-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Pedido 100% pago com ValeDoce!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValeDocePayment;

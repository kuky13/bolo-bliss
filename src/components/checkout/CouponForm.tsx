
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoupon } from "@/context/CouponContext";
import { CheckCheck, X, Ticket } from "lucide-react";
import { toast } from "sonner";

const CouponForm: React.FC = () => {
  const [couponCode, setCouponCode] = useState("");
  const { appliedCoupon, applyCoupon, removeCoupon } = useCoupon();

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Por favor, digite um código de cupom");
      return;
    }

    const result = applyCoupon(couponCode);
    
    if (result.success) {
      toast.success(result.message);
      setCouponCode("");
    } else {
      toast.error(result.message);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md text-sm">
        <div className="flex items-center">
          <CheckCheck className="h-4 w-4 text-green-500 mr-2" />
          <span>
            Cupom <span className="font-medium">{appliedCoupon.code}</span> aplicado
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 p-0 px-2"
          onClick={removeCoupon}
        >
          <X className="h-4 w-4 mr-1" />
          Remover
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-grow">
        <Ticket className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Código do cupom"
          className="pl-8"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
        />
      </div>
      <Button 
        variant="outline" 
        onClick={handleApplyCoupon}
        className="shrink-0"
      >
        Aplicar
      </Button>
    </div>
  );
};

export default CouponForm;

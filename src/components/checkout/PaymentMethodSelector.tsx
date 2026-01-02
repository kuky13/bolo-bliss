import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { QrCode, CreditCard, Banknote, Check, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useValeDoce } from "@/context/ValeDoceContext";
import { Button } from "@/components/ui/button";
interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  needChange: boolean;
  changeAmount: string;
  onChangeOptionChange: (needChange: boolean) => void;
  onChangeAmountChange: (amount: string) => void;
  total: number;
  // ValeDoce partial payment props
  isUsingValeDoce?: boolean;
  onUseValeDoceChange?: (use: boolean) => void;
  valedoceAmount?: number;
  onValeDoceAmountChange?: (amount: number) => void;
}
const PaymentMethodSelector = ({
  value,
  onChange,
  needChange,
  changeAmount,
  onChangeOptionChange,
  onChangeAmountChange,
  total,
  isUsingValeDoce = false,
  onUseValeDoceChange,
  valedoceAmount = 0,
  onValeDoceAmountChange
}: PaymentMethodSelectorProps) => {
  const {
    balance,
    settings,
    currentAffiliate
  } = useValeDoce();

  // Calculate real value of ValeDoce balance
  const balanceInReais = balance * settings.valedoceValue;

  // Check if user can pay 100% with ValeDoce
  const canPayFullWithValeDoce = currentAffiliate && balanceInReais >= total;

  // Calculate max ValeDoce that can be used as partial payment
  const maxValeDoceCanUse = Math.min(balance, Math.floor(total / settings.valedoceValue));
  const valedoceDiscountAmount = valedoceAmount * settings.valedoceValue;
  const remainingTotal = total - valedoceDiscountAmount;

  // Check if user has any ValeDoce balance
  const hasValeDoceBalance = currentAffiliate && balance > 0;

  // Traditional payment methods (shown when ValeDoce doesn't cover 100% or user chooses not to use it)
  const traditionalPaymentMethods = [{
    id: "pix",
    label: "PIX",
    description: "Pagamento instantâneo",
    icon: QrCode,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-500"
  }, {
    id: "card",
    label: "Cartão",
    description: "Crédito ou débito",
    icon: CreditCard,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-500"
  }, {
    id: "cash",
    label: "Dinheiro",
    description: "Pague na entrega",
    icon: Banknote,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-500"
  }];

  // Handle ValeDoce full payment selection
  const handleValeDoceFullPayment = () => {
    onChange("valedoce");
    if (onValeDoceAmountChange) {
      onValeDoceAmountChange(Math.ceil(total / settings.valedoceValue));
    }
  };
  return <div className="space-y-5">
      {/* ValeDoce Wallet Section */}
      {hasValeDoceBalance && <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-[2px]">
          <div className="rounded-2xl bg-background p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Carteira ValeDoce</h3>
                  <p className="text-xs text-muted-foreground">Seu saldo digital</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  R$ {balanceInReais.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {balance} créditos
                </p>
              </div>
            </div>

            {/* Full Payment Button - Only if balance covers total */}
            {canPayFullWithValeDoce && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.1
        }}>
                <Button type="button" onClick={handleValeDoceFullPayment} className={cn("w-full h-14 text-base font-semibold rounded-xl transition-all", value === "valedoce" ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/30" : "bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 text-pink-600 dark:text-pink-400 border-2 border-pink-500/30")}>
                  {value === "valedoce" ? <span className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Pagar R$ {total.toFixed(2)} com ValeDoce
                    </span> : <span className="flex items-center gap-2 text-primary-foreground">
                      
                      Usar ValeDoce para pagar tudo
                    </span>}
                </Button>
                
                {value === "valedoce" && <motion.p initial={{
            opacity: 0,
            y: -5
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-center text-sm text-muted-foreground mt-3">
                    Novo saldo após compra: R$ {(balanceInReais - total).toFixed(2)}
                  </motion.p>}
              </motion.div>}

            {/* Partial Payment Section - Only if can't pay full */}
            {!canPayFullWithValeDoce && value !== "valedoce" && onUseValeDoceChange && onValeDoceAmountChange && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.1
        }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usar como desconto</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isUsingValeDoce} onChange={e => {
                onUseValeDoceChange(e.target.checked);
                if (!e.target.checked) {
                  onValeDoceAmountChange(0);
                } else {
                  // Auto-set to max available
                  onValeDoceAmountChange(maxValeDoceCanUse);
                }
              }} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-600 peer-focus:ring-2 peer-focus:ring-pink-300 transition-colors">
                      <div className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", isUsingValeDoce && "translate-x-5")} />
                    </div>
                  </label>
                </div>

                {isUsingValeDoce && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: "auto"
          }} className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usar:</span>
                      <span className="font-semibold text-pink-600 dark:text-pink-400">
                        R$ {valedoceDiscountAmount.toFixed(2)}
                      </span>
                    </div>

                    <Slider value={[valedoceAmount]} onValueChange={v => onValeDoceAmountChange(v[0])} max={maxValeDoceCanUse} min={0} step={1} className="py-2" />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 0</span>
                      <span>Máx: R$ {(maxValeDoceCanUse * settings.valedoceValue).toFixed(2)}</span>
                    </div>

                    {valedoceAmount > 0 && <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-3 border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700 dark:text-green-400">Restante a pagar:</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            R$ {remainingTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>}
                  </motion.div>}
              </motion.div>}
          </div>
        </motion.div>}

      {/* Divider when using partial ValeDoce */}
      {hasValeDoceBalance && value !== "valedoce" && isUsingValeDoce && valedoceAmount > 0 && <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground px-2">
            Escolha como pagar o restante
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>}

      {/* Traditional Payment Methods - Hidden when ValeDoce is selected as full payment */}
      {value !== "valedoce" && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.2
    }}>
          <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-3 gap-3">
            {traditionalPaymentMethods.map((method, index) => {
          const isSelected = value === method.id;
          const Icon = method.icon;
          return <motion.div key={method.id} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }}>
                  <Label htmlFor={method.id} className={cn("flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 relative", isSelected ? `${method.bgColor} ${method.borderColor}` : "bg-muted/30 border-transparent hover:bg-muted/50")}>
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all", isSelected ? method.bgColor : "bg-muted")}>
                      <Icon className={cn("h-5 w-5", isSelected ? method.color : "text-muted-foreground")} />
                    </div>
                    
                    <span className={cn("font-medium text-sm", isSelected ? method.color : "text-foreground")}>
                      {method.label}
                    </span>
                    
                    <span className="text-xs text-muted-foreground text-center mt-0.5">
                      {method.description}
                    </span>
                    
                    {isSelected && <motion.div initial={{
                scale: 0
              }} animate={{
                scale: 1
              }} className={cn("absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center", method.bgColor)}>
                        <Check className={cn("h-3 w-3", method.color)} />
                      </motion.div>}
                  </Label>
                </motion.div>;
        })}
          </RadioGroup>
        </motion.div>}
      
      {/* Cash change options */}
      {value === "cash" && <motion.div initial={{
      opacity: 0,
      height: 0
    }} animate={{
      opacity: 1,
      height: "auto"
    }} exit={{
      opacity: 0,
      height: 0
    }} className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl space-y-3">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">Precisa de troco?</p>
          
          <RadioGroup value={needChange ? "need-change" : "no-change"} onValueChange={v => onChangeOptionChange(v === "need-change")} className="flex gap-4">
            <Label htmlFor="no-change" className={cn("flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border", !needChange ? "bg-green-100 dark:bg-green-900/50 border-green-500" : "bg-background border-transparent hover:bg-muted/50")}>
              <RadioGroupItem value="no-change" id="no-change" className="sr-only" />
              <span className="text-sm">Não</span>
            </Label>
            
            <Label htmlFor="need-change" className={cn("flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border", needChange ? "bg-green-100 dark:bg-green-900/50 border-green-500" : "bg-background border-transparent hover:bg-muted/50")}>
              <RadioGroupItem value="need-change" id="need-change" className="sr-only" />
              <span className="text-sm">Sim</span>
            </Label>
          </RadioGroup>
          
          {needChange && <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }}>
              <Label htmlFor="change-amount" className="mb-1.5 block text-sm text-green-700 dark:text-green-400">
                Troco para quanto?
              </Label>
              <Input id="change-amount" type="text" value={changeAmount} onChange={e => onChangeAmountChange(e.target.value)} placeholder="Ex: R$ 50,00" className="max-w-[200px] rounded-xl bg-background" />
            </motion.div>}
        </motion.div>}
      
      {/* PIX info */}
      {value === "pix" && <motion.div initial={{
      opacity: 0,
      height: 0
    }} animate={{
      opacity: 1,
      height: "auto"
    }} className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
                Pagamento via PIX
                {isUsingValeDoce && valedoceAmount > 0 && <span className="text-pink-600 dark:text-pink-400 ml-1">
                    (+ R$ {valedoceDiscountAmount.toFixed(2)} ValeDoce)
                  </span>}
              </p>
              <p className="text-xs text-teal-600/80 dark:text-teal-400/80 mt-1">
                Após confirmar, você receberá um QR Code para pagamento de R$ {remainingTotal.toFixed(2)}.
              </p>
            </div>
          </div>
        </motion.div>}
      
      {/* Card info */}
      {value === "card" && <motion.div initial={{
      opacity: 0,
      height: 0
    }} animate={{
      opacity: 1,
      height: "auto"
    }} className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Pagamento com Cartão
                {isUsingValeDoce && valedoceAmount > 0 && <span className="text-pink-600 dark:text-pink-400 ml-1">
                    (+ R$ {valedoceDiscountAmount.toFixed(2)} ValeDoce)
                  </span>}
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                Você será redirecionado para pagar R$ {remainingTotal.toFixed(2)} com segurança.
              </p>
            </div>
          </div>
        </motion.div>}
    </div>;
};
export default PaymentMethodSelector;
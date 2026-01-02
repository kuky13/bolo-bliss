import React from "react";
import { Link } from "react-router-dom";
import { Candy, ChevronRight } from "lucide-react";
import { useValeDoce } from "@/context/ValeDoceContext";
import { cn } from "@/lib/utils";
interface ValeDoceBalanceBadgeProps {
  variant?: "compact" | "expanded" | "card";
  className?: string;
  showLink?: boolean;
}
const ValeDoceBalanceBadge: React.FC<ValeDoceBalanceBadgeProps> = ({
  variant = "compact",
  className,
  showLink = true
}) => {
  const {
    currentAffiliate,
    balance,
    settings
  } = useValeDoce();
  if (!currentAffiliate || balance <= 0) return null;
  const valedoceValue = settings?.valedoceValue || 1;
  const realValue = (balance * valedoceValue).toFixed(2);
  if (variant === "compact") {
    return <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full", "bg-gradient-to-r from-pink-500/10 to-purple-500/10", "border border-pink-200/50 dark:border-pink-800/50", className)}>
        <Candy className="h-3.5 w-3.5 text-pink-500" />
        <span className="text-xs font-semibold text-pink-600 dark:text-pink-400">
          {balance}
        </span>
      </div>;
  }
  if (variant === "expanded") {
    const content = <div className={cn("flex items-center justify-between gap-3 p-3 rounded-xl", "bg-gradient-to-r from-pink-500/10 to-purple-500/10", "border border-pink-200/50 dark:border-pink-800/50", "touch-feedback", className)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <Candy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seus Créditos</p>
            <p className="text-lg font-bold text-gradient-pink">{balance} ValeDoce</p>
            <p className="text-[10px] text-muted-foreground">= R$ {realValue}</p>
          </div>
        </div>
        {showLink && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </div>;
    if (showLink) {
      return <Link to="/y/creditos">{content}</Link>;
    }
    return content;
  }

  // Card variant for Cart/Checkout pages
  return <div className={cn("p-4 rounded-2xl ios-card animate-fade-in-up", "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
          <Candy className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Saldo ValeDoce</p>
          <p className="text-xs text-muted-foreground">Disponível para uso</p>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gradient-pink">{balance}</p>
          <p className="text-xs text-muted-foreground">= R$ {realValue} em desconto</p>
        </div>
        
        {showLink && <Link to="/y/creditos" className="text-xs font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1 touch-feedback">
            Ver detalhes
            <ChevronRight className="h-3 w-3" />
          </Link>}
      </div>
    </div>;
};
export default ValeDoceBalanceBadge;
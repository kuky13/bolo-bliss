import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, Home, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StoreLayout from "@/components/layout/StoreLayout";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get("order");

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          {/* Error icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
          >
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </motion.div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Pagamento não Aprovado
            </h1>
            <p className="text-muted-foreground">
              Houve um problema com o seu pagamento. Por favor, tente novamente.
            </p>
          </div>

          {/* Order code */}
          {orderCode && (
            <div className="p-4 bg-muted/30 rounded-xl">
              <p className="text-sm text-muted-foreground">Pedido</p>
              <p className="font-bold text-lg">{orderCode}</p>
            </div>
          )}

          {/* Suggestions */}
          <div className="p-4 bg-muted/30 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HelpCircle className="h-4 w-4 text-primary" />
              O que pode ter acontecido?
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Saldo insuficiente no cartão</li>
              <li>Dados do cartão incorretos</li>
              <li>Limite excedido</li>
              <li>Cartão bloqueado</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => navigate("/checkout")} 
              className="gap-2 rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="gap-2 rounded-xl"
            >
              <Home className="h-4 w-4" />
              Voltar para a Loja
            </Button>
          </div>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default PaymentFailure;

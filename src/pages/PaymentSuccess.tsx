import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Home, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StoreLayout from "@/components/layout/StoreLayout";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  order_code: string;
  customer_name: string;
  customer_email: string;
  total: number;
  payment_status: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("order_code, customer_name, customer_email, total, payment_status")
        .eq("order_code", orderCode)
        .maybeSingle();

      if (!error && data) {
        setOrder(data);
      }
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderCode]);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
          >
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </motion.div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Seu pedido foi recebido com sucesso
            </p>
          </div>

          {/* Order details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-muted/30 rounded-2xl space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Código do Pedido</span>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-xl">
                <span className="text-2xl font-bold tracking-widest text-primary">
                  {order.order_code}
                </span>
              </div>

              <div className="pt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  <span className="font-medium">{order.customer_name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-medium">R$ {Number(order.total).toFixed(2)}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Info */}
          <p className="text-sm text-muted-foreground">
            Enviamos um recibo para o seu email com todos os detalhes do pedido.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate("/")} className="gap-2 rounded-xl">
              <Home className="h-4 w-4" />
              Voltar para a Loja
            </Button>
          </div>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default PaymentSuccess;

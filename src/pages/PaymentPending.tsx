import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, Home, RefreshCw, Loader2, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StoreLayout from "@/components/layout/StoreLayout";
import { supabase } from "@/integrations/supabase/client";
import PixPaymentSection from "@/components/checkout/PixPaymentSection";
import { toast } from "sonner";

interface Order {
  order_code: string;
  customer_name: string;
  total: number;
  payment_status: string;
  payment_method: string;
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  mercadopago_preference_id: string | null;
  pix_expires_at: string | null;
}

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [hasAutoCancelled, setHasAutoCancelled] = useState(false);

  const fetchOrder = async () => {
    if (!orderCode) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        "order_code, customer_name, total, payment_status, payment_method, pix_qr_code, pix_qr_code_base64, mercadopago_preference_id, pix_expires_at"
      )
      .eq("order_code", orderCode)
      .maybeSingle();

    if (!error && data) {
      setOrder(data);

      // Redirect if payment approved
      if (data.payment_status === "approved") {
        navigate(`/payment/success?order=${orderCode}`);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrder();

    // Poll for status updates
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [orderCode]);

  // Local countdown effect (ticks every second)
  useEffect(() => {
    if (!order?.pix_expires_at || !orderCode) return;

    const expiresAt = new Date(order.pix_expires_at).getTime();
    const now = Date.now();
    const initialDiff = Math.floor((expiresAt - now) / 1000);

    if (initialDiff <= 0) {
      setIsExpired(true);
      setRemainingSeconds(0);
      return;
    }

    setIsExpired(false);
    setHasAutoCancelled(false);
    setRemainingSeconds(initialDiff);

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);

          // Auto-cancel order when PIX expires to trigger cancellation email
          if (!hasAutoCancelled && order && order.payment_status !== "approved" && order.payment_status !== "cancelled") {
            setHasAutoCancelled(true);
            (async () => {
              try {
                const { error } = await supabase.functions.invoke("cancel-payment", {
                  body: { orderCode },
                });

                if (error) {
                  console.error("Erro ao cancelar automaticamente após expiração do PIX:", error);
                } else {
                  console.log("Pedido cancelado automaticamente após expiração do PIX.");
                }
              } catch (err) {
                console.error("Erro inesperado ao cancelar automaticamente após expiração do PIX:", err);
              }
            })();
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.pix_expires_at, order?.payment_status, orderCode, hasAutoCancelled]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrder();
    setIsRefreshing(false);
  };

  const handleCancelPayment = async () => {
    if (!order || !orderCode) return;

    if (order.payment_status === "approved") {
      toast.error("Este pedido já foi pago e não pode ser cancelado.");
      return;
    }

    try {
      setIsCancelling(true);

      const { error } = await supabase.functions.invoke("cancel-payment", {
        body: { orderCode },
      });

      if (error) {
        console.error("Erro ao cancelar pagamento:", error);
        toast.error("Não foi possível cancelar o pagamento. Tente novamente.");
        return;
      }

      toast.success("Pagamento cancelado com sucesso.");
      navigate("/");
    } catch (err) {
      console.error("Erro inesperado ao cancelar pagamento:", err);
      toast.error("Ocorreu um erro ao cancelar o pagamento.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenMercadoPago = () => {
    if (order?.mercadopago_preference_id) {
      // Use sandbox URL for test credentials
      const mpUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${order.mercadopago_preference_id}`;
      window.open(mpUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StoreLayout>
    );
  }

  const hasPixQrCode = order?.pix_qr_code;

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
            >
              <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">Aguardando Pagamento</h1>
              <p className="text-muted-foreground mt-1">
                Complete o pagamento para confirmar seu pedido
              </p>
            </div>
          </div>

          {/* Order info */}
          {order && (
            <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Pedido #{order.order_code}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                </div>
              </div>
              <span className="font-bold text-primary">
                R$ {Number(order.total).toFixed(2)}
              </span>
            </div>
          )}

          {/* PIX Section - Show QR code if available */}
          {order?.payment_method === "pix" && hasPixQrCode && !isExpired && (
            <div className="p-6 bg-background rounded-2xl border shadow-sm">
              <PixPaymentSection
                pixQrCode={order.pix_qr_code || undefined}
                pixQrCodeBase64={order.pix_qr_code_base64 || undefined}
                total={Number(order.total)}
                orderCode={order.order_code}
              />
            </div>
          )}

          {/* Mercado Pago button - Show if no direct PIX QR code and not expired */}
          {order?.payment_method === "pix" && !hasPixQrCode && order?.mercadopago_preference_id && !isExpired && (
            <div className="p-6 bg-background rounded-2xl border shadow-sm space-y-4">
              <div className="text-center space-y-2">
                <p className="font-medium">Pague via Mercado Pago</p>
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para abrir o pagamento PIX no Mercado Pago
                </p>
              </div>

              <Button
                onClick={handleOpenMercadoPago}
                className="w-full gap-2 rounded-xl bg-[#009ee3] hover:bg-[#007eb5]"
              >
                <ExternalLink className="h-4 w-4" />
                Pagar com Mercado Pago
              </Button>
            </div>
          )}

          {/* Countdown / expiration message */}
          {order?.payment_method === "pix" && order.pix_expires_at && (
            <div className="text-center text-sm text-muted-foreground">
              {isExpired ? (
                <p className="text-destructive font-medium">
                  Este PIX expirou. Por favor, gere um novo pedido para pagar.
                </p>
              ) : remainingSeconds !== null ? (
                <p>
                  PIX expira em <span className="font-semibold">{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}</span>
                </p>
              ) : null}
            </div>
          )}

          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="w-full gap-2 rounded-xl"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Verificando..." : "Verificar Status do Pagamento"}
          </Button>

          {/* Cancel payment button */}
          {order && order.payment_status !== "approved" && (
            <Button
              onClick={handleCancelPayment}
              variant="destructive"
              className="w-full gap-2 rounded-xl"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Cancelar pagamento
                </>
              )}
            </Button>
          )}

          {/* Back home */}
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full gap-2 rounded-xl"
          >
            <Home className="h-4 w-4" />
            Voltar para a Loja
          </Button>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default PaymentPending;

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import { IOSCard } from "@/components/ui/IOSCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Package, Clock, CheckCircle2, XCircle, Loader2, MapPin, Phone, Mail, CreditCard, QrCode, Banknote, Truck, Store, Eye, RefreshCw, Candy, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { toast } from "sonner";
interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string | null;
  delivery_method: string;
  address: string | null;
  district: string | null;
  complement: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  valedoce_discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  need_change: boolean;
  change_amount: string | null;
  affiliate_code: string | null;
  coupon_code: string | null;
  created_at: string;
  // Campos adicionais da transação / Mercado Pago
  mercadopago_payment_id: string | null;
  mercadopago_preference_id: string | null;
  pix_expires_at: string | null;
  transaction_details: any | null;
}
const statusConfig: Record<string, {
  label: string;
  color: string;
  icon: React.ElementType;
}> = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock
  },
  approved: {
    label: "Aprovado",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2
  },
  rejected: {
    label: "Rejeitado",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle
  },
  in_process: {
    label: "Processando",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Loader2
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: XCircle
  }
};
const paymentMethodConfig: Record<string, {
  label: string;
  icon: React.ElementType;
}> = {
  pix: {
    label: "PIX",
    icon: QrCode
  },
  card: {
    label: "Cartão",
    icon: CreditCard
  },
  cash: {
    label: "Dinheiro",
    icon: Banknote
  },
  valedoce: {
    label: "ValeDoce",
    icon: Candy
  }
};
const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to confirm cash payment
  const confirmCashPayment = async (orderId: string) => {
    setIsConfirmingPayment(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("confirm-cash-payment", {
        body: {
          orderId
        }
      });
      if (error) throw error;
      toast.success("Pagamento confirmado! ValeDoce creditado ao afiliado.");
      refetch();
      setSelectedOrder(null);
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast.error(error.message || "Erro ao confirmar");
    } finally {
      setIsConfirmingPayment(false);
    }
  };
  const {
    data: orders,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["admin-orders", statusFilter, paymentFilter],
    queryFn: async () => {
      let query = supabase.from("orders").select("*").order("created_at", {
        ascending: false
      });
      if (statusFilter !== "all") {
        query = query.eq("payment_status", statusFilter);
      }
      if (paymentFilter !== "all") {
        query = query.eq("payment_method", paymentFilter);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data as Order[];
    }
  });
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar permanentemente este pedido?")) return;
    setIsDeleting(true);
    try {
      const {
        error
      } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;
      toast.success("Pedido apagado com sucesso.");
      setSelectedOrder(null);
      refetch();
    } catch (error: any) {
      console.error("Erro ao apagar pedido:", error);
      toast.error(error.message || "Não foi possível apagar o pedido.");
    } finally {
      setIsDeleting(false);
    }
  };
  const filteredOrders = orders?.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return order.order_code.toLowerCase().includes(search) || order.customer_name.toLowerCase().includes(search) || order.customer_email.toLowerCase().includes(search) || order.customer_phone.includes(search);
  });
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.payment_status === "pending").length || 0,
    approved: orders?.filter(o => o.payment_status === "approved").length || 0,
    totalValue: orders?.reduce((acc, o) => acc + Number(o.total), 0) || 0
  };
  return <PageTransition>
      <AdminLayout title="Pedidos">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
              <p className="text-muted-foreground">Gerencie todos os pedidos da loja</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>

          {/* Stats */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StaggerItem>
              <IOSCard variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </IOSCard>
            </StaggerItem>
            <StaggerItem>
              <IOSCard variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </IOSCard>
            </StaggerItem>
            <StaggerItem>
              <IOSCard variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                    <p className="text-xs text-muted-foreground">Aprovados</p>
                  </div>
                </div>
              </IOSCard>
            </StaggerItem>
            <StaggerItem>
              <IOSCard variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Faturamento</p>
                  </div>
                </div>
              </IOSCard>
            </StaggerItem>
          </StaggerContainer>

          {/* Filters */}
          <IOSCard variant="default" padding="md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por código, nome, email ou telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 rounded-xl" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="in_process">Processando</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-xl">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os métodos</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </IOSCard>

          {/* Orders List */}
          <IOSCard variant="default" padding="none">
            {isLoading ? <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div> : filteredOrders?.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium">Nenhum pedido encontrado</p>
                <p className="text-sm text-muted-foreground">Ajuste os filtros ou aguarde novos pedidos</p>
              </div> : <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border">
                  <AnimatePresence>
                    {filteredOrders?.map((order, index) => {
                  const status = statusConfig[order.payment_status] || statusConfig.pending;
                  const payment = paymentMethodConfig[order.payment_method] || paymentMethodConfig.pix;
                  const StatusIcon = status.icon;
                  const PaymentIcon = payment.icon;
                  return <motion.div key={order.id} initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    y: -10
                  }} transition={{
                    delay: index * 0.02
                  }} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">#{order.order_code}</p>
                                  <Badge variant="outline" className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {order.customer_name} • {order.customer_email}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <PaymentIcon className="h-3 w-3" />
                                  <span>{payment.label}</span>
                                  <span>•</span>
                                  {order.delivery_method === "delivery" ? <span className="flex items-center gap-1">
                                      <Truck className="h-3 w-3" /> Entrega
                                    </span> : <span className="flex items-center gap-1">
                                      <Store className="h-3 w-3" /> Retirada
                                    </span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary">R$ {Number(order.total).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                            locale: ptBR
                          })}
                              </p>
                            </div>
                          </div>
                        </motion.div>;
                })}
                  </AnimatePresence>
                </div>
              </ScrollArea>}
          </IOSCard>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Pedido #{selectedOrder?.order_code}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Status do Pagamento</p>
                      <Badge className={statusConfig[selectedOrder.payment_status]?.color || ""}>
                        {statusConfig[selectedOrder.payment_status]?.label || selectedOrder.payment_status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary">R$ {Number(selectedOrder.total).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Dados do Cliente
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="font-medium">{selectedOrder.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedOrder.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="font-medium">{selectedOrder.customer_phone}</p>
                      </div>
                      {selectedOrder.customer_cpf && <div>
                          <p className="text-xs text-muted-foreground">CPF</p>
                          <p className="font-medium">{selectedOrder.customer_cpf}</p>
                        </div>}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {selectedOrder.delivery_method === "delivery" && <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Endereço de Entrega
                      </h3>
                      <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                        <p>{selectedOrder.address}</p>
                        {selectedOrder.complement && <p className="text-sm text-muted-foreground">{selectedOrder.complement}</p>}
                        <p className="text-sm">Bairro: {selectedOrder.district}</p>
                        {selectedOrder.reference && <p className="text-sm text-muted-foreground">Ref: {selectedOrder.reference}</p>}
                        {selectedOrder.latitude && selectedOrder.longitude && <p className="text-xs text-muted-foreground">
                            📍 {selectedOrder.latitude.toFixed(6)}, {selectedOrder.longitude.toFixed(6)}
                          </p>}
                      </div>
                    </div>}

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Itens do Pedido
                    </h3>
                    <div className="space-y-2">
                      {(selectedOrder.items as any[]).map((item, idx) => <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}x R$ {Number(item.price).toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold">R$ {Number(item.total).toFixed(2)}</p>
                        </div>)}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-primary/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(selectedOrder.delivery_fee) > 0 && <div className="flex justify-between text-sm">
                        <span>Taxa de Entrega</span>
                        <span>R$ {Number(selectedOrder.delivery_fee).toFixed(2)}</span>
                      </div>}
                    {Number(selectedOrder.discount_amount) > 0 && <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ""}</span>
                        <span>-R$ {Number(selectedOrder.discount_amount).toFixed(2)}</span>
                      </div>}
                    {Number(selectedOrder.valedoce_discount) > 0 && <div className="flex justify-between text-sm text-pink-600">
                        <span>ValeDoce</span>
                        <span>-R$ {Number(selectedOrder.valedoce_discount).toFixed(2)}</span>
                      </div>}
                    
                  </div>

                  {/* Detalhes da transação Mercado Pago */}
                  {selectedOrder.transaction_details && <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Dados da transação (Mercado Pago)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">ID da transação</p>
                          <p className="font-medium">
                            {selectedOrder.transaction_details.transaction_id || selectedOrder.mercadopago_payment_id || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Método de pagamento</p>
                          <p className="font-medium">
                            {selectedOrder.transaction_details.payment_type || ""}
                            {selectedOrder.transaction_details.payment_method ? ` • ${selectedOrder.transaction_details.payment_method}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status detalhado</p>
                          <p className="font-medium">
                            {selectedOrder.transaction_details.status || ""}
                            {selectedOrder.transaction_details.status_detail ? ` (${selectedOrder.transaction_details.status_detail})` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor transacionado</p>
                          <p className="font-medium">
                            R$
                            {` ${Number(selectedOrder.transaction_details.transaction_amount || 0).toFixed(2)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total pago / líquido</p>
                          <p className="font-medium">
                            R$
                            {` ${Number(selectedOrder.transaction_details.total_paid_amount || 0).toFixed(2)}`}
                            {" • R$ "}
                            {Number(selectedOrder.transaction_details.net_received_amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pagador</p>
                          <p className="font-medium">
                            {selectedOrder.transaction_details.payer_name || ""}
                            {selectedOrder.transaction_details.payer_email ? ` (${selectedOrder.transaction_details.payer_email})` : ""}
                          </p>
                        </div>
                        {selectedOrder.transaction_details.payer_identification?.number && <div>
                            <p className="text-xs text-muted-foreground">Documento</p>
                            <p className="font-medium">
                              {selectedOrder.transaction_details.payer_identification.type}
                              {" • "}
                              {selectedOrder.transaction_details.payer_identification.number}
                            </p>
                          </div>}
                        {selectedOrder.transaction_details.ticket_url && <div className="col-span-full">
                            <p className="text-xs text-muted-foreground mb-1">Comprovante</p>
                            <div className="rounded-lg border border-border/40 bg-background/60 p-3 text-xs space-y-1">
                              <p>
                                <span className="font-semibold">Status:</span> {selectedOrder.transaction_details.status || ""}
                                {selectedOrder.transaction_details.status_detail ? ` (${selectedOrder.transaction_details.status_detail})` : ""}
                              </p>
                              <p>
                                <span className="font-semibold">Valor pago:</span> R{" "}
                                {Number(selectedOrder.transaction_details.total_paid_amount || selectedOrder.transaction_details.transaction_amount || 0).toFixed(2)}
                              </p>
                              {selectedOrder.transaction_details.payer_name && <p>
                                  <span className="font-semibold">Pagador:</span> {selectedOrder.transaction_details.payer_name}
                                  {selectedOrder.transaction_details.payer_email ? ` (${selectedOrder.transaction_details.payer_email})` : ""}
                                </p>}
                              {selectedOrder.transaction_details.payer_identification?.number && <p>
                                  <span className="font-semibold">Documento:</span> {" "}
                                  {selectedOrder.transaction_details.payer_identification.type}
                                  {" • "}
                                  {selectedOrder.transaction_details.payer_identification.number}
                                </p>}
                              <p>
                                <span className="font-semibold">Transaction ID:</span>{" "}
                                {selectedOrder.transaction_details.transaction_id || selectedOrder.mercadopago_payment_id || "—"}
                              </p>
                              <a href={selectedOrder.transaction_details.ticket_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline mt-2">
                                Abrir comprovante no site do Mercado Pago
                              </a>
                            </div>
                          </div>}

                        {selectedOrder.pix_expires_at && <div>
                            <p className="text-xs text-muted-foreground">PIX expira em</p>
                            <p className="font-medium">
                              {format(new Date(selectedOrder.pix_expires_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR
                      })}
                            </p>
                          </div>}
                      </div>

                      {(selectedOrder.mercadopago_payment_id || selectedOrder.mercadopago_preference_id) && <div className="mt-3 text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedOrder.mercadopago_payment_id && <p>
                              Payment ID:
                              <span className="font-mono"> {selectedOrder.mercadopago_payment_id}</span>
                            </p>}
                          {selectedOrder.mercadopago_preference_id && <p>
                              Preference ID:
                              <span className="font-mono"> {selectedOrder.mercadopago_preference_id}</span>
                            </p>}
                        </div>}
                    </div>}

                  {/* Payment Info */}
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-xs text-muted-foreground">Método</p>
                      <p className="font-medium">{paymentMethodConfig[selectedOrder.payment_method]?.label}</p>
                    </div>
                    {selectedOrder.need_change && <div>
                        <p className="text-xs text-muted-foreground">Troco para</p>
                        <p className="font-medium">{selectedOrder.change_amount}</p>
                      </div>}
                    {selectedOrder.affiliate_code && <div>
                        <p className="text-xs text-muted-foreground">Afiliado</p>
                        <p className="font-medium">{selectedOrder.affiliate_code}</p>
                      </div>}
                  </div>

                  {/* Confirm Cash Payment Button */}
                  {selectedOrder.payment_method === "cash" && selectedOrder.payment_status === "pending" && <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                            <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">Pagamento em Dinheiro</p>
                            <p className="text-xs text-green-600/80 dark:text-green-400/80">
                              {selectedOrder.affiliate_code ? "Confirmar para creditar ValeDoce ao afiliado" : "Confirmar recebimento do pagamento"}
                            </p>
                          </div>
                        </div>
                        <Button onClick={() => confirmCashPayment(selectedOrder.id)} disabled={isConfirmingPayment} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                          {isConfirmingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                          Confirmar
                        </Button>
                      </div>
                    </div>}

                  {/* ValeDoce affiliate notice */}
                  {selectedOrder.affiliate_code && selectedOrder.payment_status === "approved" && <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-xl border border-pink-200 dark:border-pink-800">
                      <Candy className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      <span className="text-sm text-pink-700 dark:text-pink-400">
                        ValeDoce creditado ao afiliado {selectedOrder.affiliate_code}
                      </span>
                    </div>}

                  {/* Date */}
                  <p className="text-center text-sm text-muted-foreground">
                    Pedido realizado em{" "}
                    {format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR
                })}
                  </p>
                </div>
              </ScrollArea>}
            <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button variant="outline" className="w-full sm:w-auto border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => selectedOrder && handleDeleteOrder(selectedOrder.id)} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Apagar pedido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </PageTransition>;
};
export default Orders;
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface TransactionDetails {
  transaction_id?: number;
  date_approved?: string;
  date_created?: string;
  payment_type?: string;
  payment_method?: string;
  status?: string;
  status_detail?: string;
  payer_email?: string;
  payer_name?: string;
  payer_identification?: {
    type?: string;
    number?: string;
  };
  card_last_four?: string;
  card_first_six?: string;
  card_holder_name?: string;
  card_expiration_month?: number;
  card_expiration_year?: number;
  installments?: number;
  transaction_amount?: number;
  total_paid_amount?: number;
  net_received_amount?: number;
  ticket_url?: string;
}

function formatTransactionDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return dateString;
  }
}

function generateTransactionDetailsHtml(
  paymentMethod: string,
  transactionDetails?: TransactionDetails
): string {
  if (!transactionDetails || !transactionDetails.transaction_id) {
    return "";
  }

  const isPix = paymentMethod === "pix" || transactionDetails.payment_type === "bank_transfer";
  const isCard = transactionDetails.payment_type === "credit_card" || transactionDetails.payment_type === "debit_card";

  let detailsContent = "";

  // Common transaction info
  detailsContent += `
    <p style="margin: 0 0 8px;"><strong>ID da Transação:</strong> ${transactionDetails.transaction_id}</p>
    <p style="margin: 0 0 8px;"><strong>Data/Hora:</strong> ${formatTransactionDate(transactionDetails.date_approved || transactionDetails.date_created)}</p>
  `;

  if (transactionDetails.transaction_amount) {
    detailsContent += `
      <p style="margin: 0 0 8px;"><strong>Valor da Transação:</strong> R$ ${Number(transactionDetails.transaction_amount).toFixed(2)}</p>
    `;
  }

  if (isPix) {
    // PIX specific details
    if (transactionDetails.payer_name) {
      detailsContent += `
        <p style="margin: 0 0 8px;"><strong>Pagador:</strong> ${transactionDetails.payer_name}</p>
      `;
    }
    if (transactionDetails.payer_email) {
      detailsContent += `
        <p style="margin: 0 0 8px;"><strong>Email do Pagador:</strong> ${transactionDetails.payer_email}</p>
      `;
    }
    if (transactionDetails.payer_identification?.number) {
      const cpf = transactionDetails.payer_identification.number;
      const maskedCpf = cpf.length === 11 
        ? `***.***.${cpf.substring(6, 9)}-**`
        : cpf;
      detailsContent += `
        <p style="margin: 0 0 8px;"><strong>CPF:</strong> ${maskedCpf}</p>
      `;
    }

    return `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #333; margin: 0 0 12px; font-size: 16px;">🔐 Comprovante PIX</h3>
        <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-radius: 12px; padding: 16px; border-left: 4px solid #0284c7;">
          ${detailsContent}
        </div>
      </div>
    `;
  }

  if (isCard) {
    // Card specific details
    if (transactionDetails.card_holder_name) {
      detailsContent += `
        <p style="margin: 0 0 8px;"><strong>Titular do Cartão:</strong> ${transactionDetails.card_holder_name}</p>
      `;
    }
    if (transactionDetails.card_last_four) {
      detailsContent += `
        <p style="margin: 0 0 8px;"><strong>Cartão:</strong> **** **** **** ${transactionDetails.card_last_four}</p>
      `;
    }
    if (transactionDetails.installments && transactionDetails.installments > 1) {
      detailsContent += `
        <p style="margin: 0 0 8px;"><strong>Parcelas:</strong> ${transactionDetails.installments}x</p>
      `;
    }

    const cardTypeLabel = transactionDetails.payment_type === "credit_card" ? "Crédito" : "Débito";

    return `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #333; margin: 0 0 12px; font-size: 16px;">💳 Comprovante de Pagamento (${cardTypeLabel})</h3>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 16px; border-left: 4px solid #f59e0b;">
          ${detailsContent}
        </div>
      </div>
    `;
  }

  // Generic payment details
  return `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #333; margin: 0 0 12px; font-size: 16px;">🧾 Dados da Transação</h3>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border-left: 4px solid #64748b;">
        ${detailsContent}
      </div>
    </div>
  `;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, type } = await req.json();

    console.log(`Sending ${type} email for order:`, orderId);

    // Fetch order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const items = order.items as OrderItem[];
    const transactionDetails = order.transaction_details as TransactionDetails | null;
    
    const formattedDate = new Date(order.created_at).toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const paymentMethods: Record<string, string> = {
      pix: "PIX",
      card: "Cartão de Crédito/Débito",
      cash: "Dinheiro",
    };
    const paymentMethodLabel = paymentMethods[order.payment_method as string] || order.payment_method;

    const paymentStatuses: Record<string, string> = {
      pending: "⏳ Pendente",
      approved: "✅ Aprovado",
      rejected: "❌ Rejeitado",
      in_process: "🔄 Em processamento",
      cancelled: "🚫 Cancelado",
    };
    const paymentStatusLabel = paymentStatuses[order.payment_status as string] || order.payment_status;

    const deliveryMethodLabel = order.delivery_method === "delivery" ? "🚚 Entrega" : "🏪 Retirada no Local";

    const subject =
      type === "approved"
        ? `✅ Pagamento Confirmado - Pedido #${order.order_code}`
        : `🎉 Pedido Recebido - #${order.order_code}`;

    const headerMessage =
      type === "approved"
        ? "Seu pagamento foi confirmado com sucesso!"
        : "Recebemos seu pedido e estamos preparando tudo com carinho!";

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    // Generate transaction details section for approved payments
    const transactionDetailsHtml = type === "approved" 
      ? generateTransactionDetailsHtml(order.payment_method, transactionDetails || undefined)
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f7;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Cantinho da YSA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">${headerMessage}</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Order Code -->
            <div style="text-align: center; margin-bottom: 24px;">
              <p style="color: #666; margin: 0 0 8px;">Código do Pedido</p>
              <div style="background: #fdf2f8; border: 2px dashed #ec4899; border-radius: 12px; padding: 16px; display: inline-block;">
                <span style="font-size: 28px; font-weight: bold; color: #db2777; letter-spacing: 4px;">${order.order_code}</span>
              </div>
            </div>

            <!-- Status -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0; font-size: 18px;">${paymentStatusLabel}</p>
              <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Método: ${paymentMethodLabel}</p>
            </div>

            <!-- Transaction Details (only for approved payments) -->
            ${transactionDetailsHtml}

            <!-- Customer Info -->
            <div style="margin-bottom: 24px;">
              <h3 style="color: #333; margin: 0 0 12px; font-size: 16px;">👤 Dados do Cliente</h3>
              <div style="background: #f8fafc; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 8px;"><strong>Nome:</strong> ${order.customer_name}</p>
                <p style="margin: 0 0 8px;"><strong>Email:</strong> ${order.customer_email}</p>
                <p style="margin: 0;"><strong>Telefone:</strong> ${order.customer_phone}</p>
                ${order.customer_cpf ? `<p style="margin: 8px 0 0;"><strong>CPF:</strong> ${order.customer_cpf}</p>` : ""}
              </div>
            </div>

            <!-- Delivery Info -->
            <div style="margin-bottom: 24px;">
              <h3 style="color: #333; margin: 0 0 12px; font-size: 16px;">${deliveryMethodLabel}</h3>
              ${
                order.delivery_method === "delivery"
                  ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 16px;">
                  <p style="margin: 0 0 8px;"><strong>Endereço:</strong> ${order.address}</p>
                  ${order.complement ? `<p style="margin: 0 0 8px;"><strong>Complemento:</strong> ${order.complement}</p>` : ""}
                  <p style="margin: 0;"><strong>Bairro:</strong> ${order.district}</p>
                  ${order.reference ? `<p style="margin: 8px 0 0;"><strong>Referência:</strong> ${order.reference}</p>` : ""}
                </div>
              `
                  : `
                <div style="background: #f8fafc; border-radius: 12px; padding: 16px;">
                  <p style="margin: 0;">Você optou por retirar seu pedido no local.</p>
                </div>
              `
              }
            </div>

            <!-- Items Table -->
            <div style="margin-bottom: 24px;">
              <h3 style="color: #333; margin: 0 0 12px; font-size: 16px;">🛒 Itens do Pedido</h3>
              <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background: #ec4899; color: white;">
                    <th style="padding: 12px; text-align: left;">Produto</th>
                    <th style="padding: 12px; text-align: center;">Qtd</th>
                    <th style="padding: 12px; text-align: right;">Preço</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal:</span>
                <span>R$ ${Number(order.subtotal).toFixed(2)}</span>
              </div>
              ${
                Number(order.delivery_fee) > 0
                  ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Taxa de Entrega:</span>
                  <span>R$ ${Number(order.delivery_fee).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                Number(order.discount_amount) > 0
                  ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #059669;">
                  <span>Desconto:</span>
                  <span>-R$ ${Number(order.discount_amount).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                Number(order.valedoce_discount) > 0
                  ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ec4899;">
                  <span>ValeDoce:</span>
                  <span>-R$ ${Number(order.valedoce_discount).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <hr style="border: none; border-top: 2px solid #ec4899; margin: 12px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #db2777;">
                <span>Total:</span>
                <span>R$ ${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Data do Pedido: ${formattedDate}</p>
              <p style="color: #999; margin: 0; font-size: 12px;">
                Guarde este email como comprovante do seu pedido.
              </p>
            </div>
          </div>

          <!-- Bottom Message -->
          <div style="text-align: center; padding: 24px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Obrigado por comprar conosco! 💖
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Cantinho da YSA <pedidos@kuky.cloud>",
      to: [order.customer_email],
      subject,
      html,
    });

    console.log("Email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending receipt:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

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
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  valedoce_discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  coupon_code: string | null;
  affiliate_code: string | null;
  need_change: boolean;
  change_amount: string | null;
  custom_cake_details: any;
  created_at: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
};

const getPaymentMethodLabel = (method: string): string => {
  const methods: Record<string, string> = {
    pix: "PIX",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    cash: "Dinheiro",
    mercadopago: "Mercado Pago",
  };
  return methods[method] || method;
};

const getDeliveryMethodLabel = (method: string): string => {
  return method === "delivery" ? "🚚 Entrega" : "🏪 Retirada no Local";
};

const generateEmailHTML = (order: Order): string => {
  const itemsHTML = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">
            <strong>${item.name}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}x
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${formatCurrency(item.price)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join("");

  const deliveryInfo =
    order.delivery_method === "delivery"
      ? `
        <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px;">📍 Endereço de Entrega</h3>
          <p style="margin: 0; color: #15803d;">
            ${order.address || "Não informado"}<br/>
            ${order.district ? `Bairro: ${order.district}<br/>` : ""}
            ${order.complement ? `Complemento: ${order.complement}<br/>` : ""}
            ${order.reference ? `Referência: ${order.reference}` : ""}
          </p>
        </div>
      `
      : `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #92400e; font-size: 16px;">🏪 Cliente vai retirar no local</h3>
        </div>
      `;

  const changeInfo =
    order.need_change && order.change_amount
      ? `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 12px; margin-top: 12px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            💰 <strong>Precisa de troco para:</strong> ${order.change_amount}
          </p>
        </div>
      `
      : "";

  const customCakeInfo = order.custom_cake_details
    ? `
        <div style="background-color: #faf5ff; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; color: #7c3aed; font-size: 16px;">🎂 Detalhes do Bolo Personalizado</h3>
          <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; color: #6b21a8; font-size: 14px;">${JSON.stringify(order.custom_cake_details, null, 2)}</pre>
        </div>
      `
    : "";

  const couponInfo = order.coupon_code
    ? `<p style="margin: 4px 0; color: #059669;">🎟️ Cupom aplicado: <strong>${order.coupon_code}</strong></p>`
    : "";

  const affiliateInfo = order.affiliate_code
    ? `<p style="margin: 4px 0; color: #7c3aed;">🤝 Afiliado: <strong>${order.affiliate_code}</strong></p>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <div style="background-color: #22c55e; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 16px;">
            ✅ NOVO PEDIDO APROVADO
          </div>
          <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 2px;">
            #${order.order_code}
          </h1>
          <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">
            ${formatDate(order.created_at)}
          </p>
        </div>
        
        <!-- Content -->
        <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Customer Info -->
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">👤 Dados do Cliente</h3>
            <table style="width: 100%; font-size: 14px; color: #1e3a8a;">
              <tr>
                <td style="padding: 4px 0;"><strong>Nome:</strong></td>
                <td style="padding: 4px 0;">${order.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Email:</strong></td>
                <td style="padding: 4px 0;">${order.customer_email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Telefone:</strong></td>
                <td style="padding: 4px 0;">${order.customer_phone}</td>
              </tr>
              ${order.customer_cpf ? `
              <tr>
                <td style="padding: 4px 0;"><strong>CPF:</strong></td>
                <td style="padding: 4px 0;">${order.customer_cpf}</td>
              </tr>
              ` : ""}
            </table>
          </div>
          
          <!-- Delivery Method -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; border-left: 4px solid #4f46e5;">
            <p style="margin: 0; font-size: 16px; color: #1e293b;">
              <strong>${getDeliveryMethodLabel(order.delivery_method)}</strong>
            </p>
          </div>
          
          ${deliveryInfo}
          
          ${customCakeInfo}
          
          <!-- Order Items -->
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">🛒 Itens do Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; color: #374151;">Produto</th>
                <th style="padding: 12px; text-align: center; color: #374151;">Qtd</th>
                <th style="padding: 12px; text-align: right; color: #374151;">Preço</th>
                <th style="padding: 12px; text-align: right; color: #374151;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <!-- Order Summary -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Subtotal:</td>
                <td style="padding: 6px 0; text-align: right; color: #374151;">${formatCurrency(order.subtotal)}</td>
              </tr>
              ${order.delivery_fee > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Taxa de entrega:</td>
                <td style="padding: 6px 0; text-align: right; color: #374151;">${formatCurrency(order.delivery_fee)}</td>
              </tr>
              ` : ""}
              ${order.discount_amount > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #059669;">Desconto (cupom):</td>
                <td style="padding: 6px 0; text-align: right; color: #059669;">-${formatCurrency(order.discount_amount)}</td>
              </tr>
              ` : ""}
              ${order.valedoce_discount > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #7c3aed;">Desconto ValeDoce:</td>
                <td style="padding: 6px 0; text-align: right; color: #7c3aed;">-${formatCurrency(order.valedoce_discount)}</td>
              </tr>
              ` : ""}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 6px 0; font-size: 18px; font-weight: bold; color: #111827;">TOTAL:</td>
                <td style="padding: 12px 0 6px 0; text-align: right; font-size: 18px; font-weight: bold; color: #4f46e5;">${formatCurrency(order.total)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Payment Info -->
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              💳 <strong>Pagamento:</strong> ${getPaymentMethodLabel(order.payment_method)}
              <span style="background-color: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">
                ✓ APROVADO
              </span>
            </p>
          </div>
          
          ${changeInfo}
          
          <!-- Additional Info -->
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            ${couponInfo}
            ${affiliateInfo}
          </div>
          
          <!-- Action Box -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 20px; margin-top: 24px; text-align: center;">
            <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: bold;">
              ⚡ Ação Necessária
            </p>
            <p style="margin: 8px 0 0 0; color: #a16207; font-size: 14px;">
              ${order.delivery_method === "delivery" 
                ? "Prepare o pedido e organize a entrega!" 
                : "Prepare o pedido para retirada no local!"}
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">📧 Notificação automática do sistema de pedidos</p>
          <p style="margin: 4px 0 0 0;">Esta mensagem foi enviada para todos os administradores.</p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error("orderId is required");
    }

    console.log("Fetching order:", orderId);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    console.log("Order found:", order.order_code);

    // Fetch all admin users
    // We need to get user emails from auth.users, which requires service role
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      throw new Error(`Error fetching admin roles: ${rolesError.message}`);
    }

    console.log("Found admin roles:", adminRoles?.length || 0);

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails using auth.admin API
    const adminEmails: string[] = [];
    for (const adminRole of adminRoles) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        adminRole.user_id
      );
      
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
        console.log("Found admin email:", userData.user.email);
      } else if (userError) {
        console.error("Error fetching user:", adminRole.user_id, userError.message);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending notification to admins:", adminEmails);

    // Generate email HTML
    const emailHTML = generateEmailHTML(order as Order);

    // Send email to all admins
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Pedidos <pedidos@kuky.cloud>",
      to: adminEmails,
      subject: `🎉 Novo Pedido Aprovado #${order.order_code} - ${order.customer_name}`,
      html: emailHTML,
    });

    if (emailError) {
      throw new Error(`Error sending email: ${emailError.message}`);
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${adminEmails.length} admin(s)`,
        emailId: emailData?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-admin-order-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

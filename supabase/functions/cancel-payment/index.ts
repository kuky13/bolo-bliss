import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface CancelPaymentRequest {
  orderCode: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: "Configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CancelPaymentRequest = await req.json();

    if (!body.orderCode) {
      return new Response(JSON.stringify({ error: "orderCode é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Cancel payment requested for order:", body.orderCode);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, payment_status, customer_email, customer_name, order_code")
      .eq("order_code", body.orderCode)
      .maybeSingle();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return new Response(JSON.stringify({ error: "Erro ao buscar pedido" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.payment_status === "approved") {
      return new Response(JSON.stringify({ error: "Pedido já pago não pode ser cancelado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "cancelled",
        pix_qr_code: null,
        pix_qr_code_base64: null,
        mercadopago_payment_id: null,
        mercadopago_preference_id: null,
        transaction_details: null,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error cancelling order:", updateError);
      return new Response(JSON.stringify({ error: "Erro ao cancelar pedido" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Order cancelled successfully:", order.id);

    if (!resend) {
      console.error("RESEND_API_KEY is not configured; skipping cancellation email.");
    } else if (order.customer_email) {
      try {
        await resend.emails.send({
          from: "Pedidos Doce <onboarding@resend.dev>",
          to: [order.customer_email],
          subject: "Seu pedido foi cancelado",
          html: `
            <h1>Pedido cancelado</h1>
            <p>Olá ${order.customer_name ?? "cliente"},</p>
            <p>Seu pedido ${order.order_code ? `de código <strong>${order.order_code}</strong>` : ""} foi cancelado com sucesso.</p>
            <p>Se o cancelamento não foi solicitado por você ou se tiver qualquer dúvida, entre em contato com a loja.</p>
          `,
        });
        console.log("Cancellation email sent to:", order.customer_email);
      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in cancel-payment function:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao cancelar pagamento" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValeDoceNotificationRequest {
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  newBalance: number;
  productNames?: string[];
  orderValue?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ValeDoceNotificationRequest = await req.json();
    console.log("Recebido pedido de notificação ValeDoce:", payload);

    const { affiliateName, affiliateEmail, amount, newBalance, productNames, orderValue } = payload;

    if (!affiliateEmail || !affiliateEmail.includes("@")) {
      return new Response(
        JSON.stringify({ success: true, message: "Email não configurado" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const productsList = productNames?.length ? `<p style="color: #666;">Produtos: ${productNames.join(", ")}</p>` : "";
    const orderInfo = orderValue ? `<p style="color: #666;">Valor do pedido: R$ ${orderValue.toFixed(2)}</p>` : "";

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); border-radius: 16px; padding: 32px; text-align: center; color: white;">
          <h1>🍬 ValeDoce</h1>
        </div>
        <div style="background: white; border-radius: 16px; padding: 32px; margin-top: 16px;">
          <h2>Olá, ${affiliateName}! 🎉</h2>
          <p>Você ganhou <strong style="color: #ec4899;">${amount} ValeDoce</strong>!</p>
          ${orderInfo}${productsList}
          <div style="background: #fdf2f8; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="margin: 0;">Saldo: <strong style="color: #ec4899; font-size: 24px;">${newBalance} ValeDoce</strong></p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ValeDoce <valedoce@kuky.cloud>",
      to: [affiliateEmail],
      subject: `🍬 Você ganhou ${amount} ValeDoce!`,
      html: emailHtml,
    });

    console.log("Email enviado:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

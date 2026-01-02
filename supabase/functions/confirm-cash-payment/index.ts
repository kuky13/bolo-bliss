import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmPaymentRequest {
  orderId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: ConfirmPaymentRequest = await req.json();

    console.log("Confirming cash payment for order:", body.orderId);

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      throw new Error("Pedido não encontrado");
    }

    // Check if already approved
    if (order.payment_status === "approved") {
      console.log("Order already approved");
      return new Response(
        JSON.stringify({ success: true, message: "Pedido já estava aprovado" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order status to approved
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        payment_status: "approved",
        updated_at: new Date().toISOString()
      })
      .eq("id", body.orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new Error("Erro ao atualizar pedido");
    }

    console.log("Order status updated to approved");

    // Grant ValeDoce to affiliate if order came through affiliate link
    if (order.affiliate_id) {
      await grantValeDoceToAffiliate(supabase, supabaseUrl, supabaseServiceKey, order);
    }

    // Send confirmation emails
    // Send receipt to customer
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-order-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          orderId: body.orderId,
          type: "approved",
        }),
      });
      console.log("Customer receipt email sent");
    } catch (emailError) {
      console.error("Failed to send customer receipt email:", emailError);
    }

    // Send notification to all admins
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-admin-order-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          orderId: body.orderId,
        }),
      });
      console.log("Admin notification email sent");
    } catch (adminError) {
      console.error("Failed to send admin notification:", adminError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Pagamento confirmado com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error confirming payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Grant ValeDoce to affiliate when sale is confirmed
async function grantValeDoceToAffiliate(
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  order: any
) {
  try {
    // IMPORTANT: Do not grant ValeDoce if order used ValeDoce for payment
    if (order.valedoce_discount && order.valedoce_discount > 0) {
      console.log("Order used ValeDoce discount, checking if full payment...");
      
      // If ValeDoce covered most of the order, don't grant rewards
      if (order.valedoce_discount >= order.total * 0.5) {
        console.log("Order was significantly paid with ValeDoce, no reward granted");
        return;
      }
    }

    console.log("Granting ValeDoce to affiliate:", order.affiliate_id);

    // Get affiliate details
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("*")
      .eq("id", order.affiliate_id)
      .single();

    if (affiliateError || !affiliate) {
      console.error("Affiliate not found:", affiliateError);
      return;
    }

    // Get global ValeDoce settings
    const { data: valedoceSettings } = await supabase
      .from("valedoce_settings")
      .select("default_reward")
      .limit(1)
      .maybeSingle();

    const defaultReward = valedoceSettings?.default_reward || 5;

    // Get products from order items and calculate total ValeDoce reward
    const orderItems = order.items || [];
    let totalValeDoceReward = 0;
    const productNames: string[] = [];

    // Calculate ValeDoce using global default reward per product
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", item.id)
        .single();

      if (product) {
        const reward = defaultReward * (item.quantity || 1);
        totalValeDoceReward += reward;
        productNames.push(product.name);
      }
    }

    if (totalValeDoceReward <= 0) {
      console.log("No ValeDoce reward to grant");
      return;
    }

    console.log(`Granting ${totalValeDoceReward} ValeDoce to affiliate ${affiliate.name}`);

    // Create earned transaction
    const { error: transactionError } = await supabase
      .from("valedoce_transactions")
      .insert([{
        affiliate_id: affiliate.id,
        amount: totalValeDoceReward,
        type: "earned",
        description: `Comissão - Pedido #${order.order_code}`,
        order_id: order.id,
      }]);

    if (transactionError) {
      console.error("Error creating ValeDoce transaction:", transactionError);
      return;
    }

    // Update affiliate balance
    const newBalance = (affiliate.valedoce_balance || 0) + totalValeDoceReward;
    const { error: updateError } = await supabase
      .from("affiliates")
      .update({ valedoce_balance: newBalance })
      .eq("id", affiliate.id);

    if (updateError) {
      console.error("Error updating affiliate balance:", updateError);
      return;
    }

    console.log(`ValeDoce granted! New balance: ${newBalance}`);

    // Send notification email to affiliate
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-valedoce-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          affiliateName: affiliate.name,
          affiliateEmail: affiliate.email,
          amount: totalValeDoceReward,
          newBalance: newBalance,
          productNames: productNames,
          orderValue: order.total,
        }),
      });
      console.log("ValeDoce notification email sent to affiliate");
    } catch (notifError) {
      console.error("Failed to send ValeDoce notification:", notifError);
    }
  } catch (error) {
    console.error("Error granting ValeDoce to affiliate:", error);
  }
}

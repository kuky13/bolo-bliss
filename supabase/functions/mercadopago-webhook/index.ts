import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mercadopagoToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook data
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Handle different webhook types
    if (body.type === "payment" || body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data?.id;

      if (!paymentId) {
        console.log("No payment ID found in webhook");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${mercadopagoToken}`,
          },
        }
      );

      const payment = await paymentResponse.json();
      console.log("Payment details:", JSON.stringify(payment, null, 2));

      if (!payment.external_reference) {
        console.log("No external_reference (order ID) in payment");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Map Mercado Pago status to our status
      let paymentStatus: string;
      switch (payment.status) {
        case "approved":
          paymentStatus = "approved";
          break;
        case "rejected":
        case "cancelled":
          paymentStatus = "rejected";
          break;
        case "pending":
        case "in_process":
        case "authorized":
          paymentStatus = "in_process";
          break;
        default:
          paymentStatus = "pending";
      }

      // Build transaction details from payment data
      const transactionDetails = {
        transaction_id: payment.id,
        date_approved: payment.date_approved,
        date_created: payment.date_created,
        payment_type: payment.payment_type_id,
        payment_method: payment.payment_method_id,
        status: payment.status,
        status_detail: payment.status_detail,
        // Payer info
        payer_email: payment.payer?.email,
        payer_name: `${payment.payer?.first_name || ""} ${payment.payer?.last_name || ""}`.trim(),
        payer_identification: payment.payer?.identification,
        // Card info (if credit/debit card)
        card_last_four: payment.card?.last_four_digits,
        card_first_six: payment.card?.first_six_digits,
        card_holder_name: payment.card?.cardholder?.name,
        card_expiration_month: payment.card?.expiration_month,
        card_expiration_year: payment.card?.expiration_year,
        installments: payment.installments,
        // Transaction amounts
        transaction_amount: payment.transaction_amount,
        total_paid_amount: payment.transaction_details?.total_paid_amount,
        net_received_amount: payment.transaction_details?.net_received_amount,
        // PIX specific
        ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url,
        pix_expires_at: payment.date_of_expiration,
      };

      console.log("Transaction details:", JSON.stringify(transactionDetails, null, 2));

      // Update order with payment status and transaction details
      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          mercadopago_payment_id: String(paymentId),
          transaction_details: transactionDetails,
          pix_expires_at: payment.date_of_expiration,
        })
        .eq("id", payment.external_reference)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating order:", updateError);
      } else {
        console.log("Order updated:", order?.order_code, "Status:", paymentStatus);

        // If payment approved, process ValeDoce and send emails
        // Note: Cash payments are handled separately via confirm-cash-payment function
        if (paymentStatus === "approved" && order.payment_method !== "cash") {
          await processApprovedPayment(supabase, supabaseUrl, supabaseServiceKey, order, payment.external_reference);
        }
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Process approved payment: ValeDoce grants, spends, and notifications
async function processApprovedPayment(
  supabase: any, 
  supabaseUrl: string, 
  supabaseServiceKey: string, 
  order: any,
  orderId: string
) {
  try {
    // 1. GRANT ValeDoce to affiliate if order came through affiliate link
    if (order.affiliate_id) {
      await grantValeDoceToAffiliate(supabase, supabaseUrl, supabaseServiceKey, order);
    }

    // 2. SPEND ValeDoce if customer used it (deduct after payment confirmation)
    if (order.valedoce_discount > 0) {
      await spendCustomerValeDoce(supabase, order);
    }

    // 3. Send confirmation emails
    // Send receipt to customer
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-order-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          orderId: orderId,
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
          orderId: orderId,
        }),
      });
      console.log("Admin notification email sent");
    } catch (adminEmailError) {
      console.error("Failed to send admin notification email:", adminEmailError);
    }
  } catch (error) {
    console.error("Error processing approved payment:", error);
  }
}

// Grant ValeDoce to affiliate when sale is made through their link
async function grantValeDoceToAffiliate(
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  order: any
) {
  try {
    // IMPORTANT: Do not grant ValeDoce if payment was made with ValeDoce
    if (order.payment_method === "valedoce") {
      console.log("Payment was made with ValeDoce, no reward granted to affiliate");
      return;
    }

    // Also check if order was fully paid with ValeDoce (valedoce_discount >= total)
    if (order.valedoce_discount && order.valedoce_discount >= order.total) {
      console.log("Order was fully paid with ValeDoce discount, no reward granted");
      return;
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

// Spend ValeDoce for customer who used it in their order (after payment is confirmed)
async function spendCustomerValeDoce(supabase: any, order: any) {
  try {
    // Get valedoce settings to calculate amount
    const { data: settings } = await supabase
      .from("valedoce_settings")
      .select("valedoce_value")
      .limit(1)
      .single();

    const valedoceValue = settings?.valedoce_value || 1;
    const valedoceAmount = Math.round(order.valedoce_discount / valedoceValue);

    if (valedoceAmount <= 0) {
      console.log("No ValeDoce to spend");
      return;
    }

    // We need to find the buyer's affiliate record by email
    // Check if there's a buyer_affiliate_id stored in the order or find by email
    const { data: buyerAffiliate, error: buyerError } = await supabase
      .from("affiliates")
      .select("*")
      .eq("email", order.customer_email)
      .single();

    if (buyerError || !buyerAffiliate) {
      console.log("Buyer is not an affiliate, cannot process ValeDoce spend");
      return;
    }

    console.log(`Spending ${valedoceAmount} ValeDoce from buyer ${buyerAffiliate.name}`);

    // Create spent transaction
    const { error: transactionError } = await supabase
      .from("valedoce_transactions")
      .insert([{
        affiliate_id: buyerAffiliate.id,
        amount: -valedoceAmount,
        type: "spent",
        description: `Compra - Pedido #${order.order_code} - R$ ${order.valedoce_discount.toFixed(2)} de desconto`,
        order_id: order.id,
      }]);

    if (transactionError) {
      console.error("Error creating ValeDoce spend transaction:", transactionError);
      return;
    }

    // Update buyer's balance
    const newBalance = Math.max(0, (buyerAffiliate.valedoce_balance || 0) - valedoceAmount);
    const { error: updateError } = await supabase
      .from("affiliates")
      .update({ valedoce_balance: newBalance })
      .eq("id", buyerAffiliate.id);

    if (updateError) {
      console.error("Error updating buyer balance:", updateError);
      return;
    }

    console.log(`ValeDoce spent! New balance for buyer: ${newBalance}`);
  } catch (error) {
    console.error("Error spending customer ValeDoce:", error);
  }
}

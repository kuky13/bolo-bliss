import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
}

interface CreateOrderRequest {
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
  };
  delivery: {
    method: "delivery" | "pickup";
    address?: string;
    district?: string;
    complement?: string;
    reference?: string;
    latitude?: number;
    longitude?: number;
  };
  payment: {
    method: "pix" | "card" | "cash" | "valedoce";
    needChange?: boolean;
    changeAmount?: string;
  };
  totals: {
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    valedoceDiscount: number;
    total: number;
  };
  customCakeDetails?: string;
  affiliateId?: string;
  affiliateCode?: string;
  couponCode?: string;
  buyerAffiliateId?: string; // ID of the buyer's affiliate record (for ValeDoce spending)
}

function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mercadopagoToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: CreateOrderRequest = await req.json();

    console.log("Creating order with data:", JSON.stringify(body, null, 2));

    // Generate unique order code
    const orderCode = generateOrderCode();

    // Determine initial payment status
    // For ValeDoce-only payments, mark as approved immediately
    const initialPaymentStatus = body.payment.method === "valedoce" ? "approved" : "pending";

    // Create order in database
    const orderData = {
      order_code: orderCode,
      customer_name: body.customer.name,
      customer_email: body.customer.email,
      customer_phone: body.customer.phone,
      customer_cpf: body.customer.cpf || null,
      delivery_method: body.delivery.method,
      address: body.delivery.address || null,
      district: body.delivery.district || null,
      complement: body.delivery.complement || null,
      reference: body.delivery.reference || null,
      latitude: body.delivery.latitude || null,
      longitude: body.delivery.longitude || null,
      items: body.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      })),
      subtotal: body.totals.subtotal,
      delivery_fee: body.totals.deliveryFee,
      discount_amount: body.totals.discountAmount,
      valedoce_discount: body.totals.valedoceDiscount,
      total: body.totals.total,
      payment_method: body.payment.method,
      payment_status: initialPaymentStatus,
      need_change: body.payment.needChange || false,
      change_amount: body.payment.changeAmount || null,
      custom_cake_details: body.customCakeDetails
        ? { details: body.customCakeDetails }
        : null,
      affiliate_id: body.affiliateId || null,
      affiliate_code: body.affiliateCode || null,
      coupon_code: body.couponCode || null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log("Order created:", order.id, "Status:", initialPaymentStatus);

    let paymentData: any = {
      orderId: order.id,
      orderCode: order.order_code,
      paymentMethod: body.payment.method,
    };

    // Handle ValeDoce-only payment
    if (body.payment.method === "valedoce") {
      // Process ValeDoce spending immediately for ValeDoce-only payments
      await processValeDocePayment(supabase, supabaseUrl, supabaseServiceKey, order, body);
      
      paymentData.paymentStatus = "approved";
      
      // Send receipt email
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-order-receipt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            type: "approved",
          }),
        });
        console.log("Receipt email sent for ValeDoce payment");
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
      }

      // Send admin notification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-admin-order-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        });
        console.log("Admin notification sent for ValeDoce payment");
      } catch (adminError) {
        console.error("Failed to send admin notification:", adminError);
      }

      return new Response(JSON.stringify(paymentData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If payment method is PIX or Card, create Mercado Pago preference
    if (body.payment.method === "pix" || body.payment.method === "card") {
      if (!mercadopagoToken) {
        throw new Error("Mercado Pago access token not configured");
      }

      // Build items for Mercado Pago
      const mpItems = body.items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        currency_id: "BRL",
      }));

      // Add delivery fee as item if applicable
      if (body.totals.deliveryFee > 0) {
        mpItems.push({
          id: "delivery",
          title: "Taxa de Entrega",
          quantity: 1,
          unit_price: Number(body.totals.deliveryFee),
          currency_id: "BRL",
        });
      }

      // Create preference
      const preferenceBody = {
        items: mpItems,
        payer: {
          name: body.customer.name,
          email: body.customer.email,
          phone: {
            number: body.customer.phone.replace(/\D/g, ""),
          },
        },
        external_reference: order.id,
        notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
        back_urls: {
          success: `${req.headers.get("origin")}/payment/success?order=${order.order_code}`,
          failure: `${req.headers.get("origin")}/payment/failure?order=${order.order_code}`,
          pending: `${req.headers.get("origin")}/payment/pending?order=${order.order_code}`,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: body.payment.method === "pix" 
            ? [{ id: "credit_card" }, { id: "debit_card" }]
            : [],
          installments: 12,
        },
      };

      console.log("Creating MP preference:", JSON.stringify(preferenceBody, null, 2));

      const mpResponse = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mercadopagoToken}`,
          },
          body: JSON.stringify(preferenceBody),
        }
      );

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        console.error("MP Error:", mpData);
        throw new Error(`Mercado Pago error: ${JSON.stringify(mpData)}`);
      }

      console.log("MP Preference created:", mpData.id);

      // Update order with preference ID
      await supabase
        .from("orders")
        .update({ mercadopago_preference_id: mpData.id })
        .eq("id", order.id);

      paymentData.preferenceId = mpData.id;
      paymentData.initPoint = mpData.init_point;
      paymentData.sandboxInitPoint = mpData.sandbox_init_point;

      // If PIX, try to create a payment directly to get QR code
      if (body.payment.method === "pix") {
        // Parse phone number for Mercado Pago
        const phoneDigits = body.customer.phone.replace(/\D/g, "");
        const areaCode = phoneDigits.substring(0, 2);
        const phoneNumber = phoneDigits.substring(2);

        // Parse customer name
        const nameParts = body.customer.name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || firstName;

        // Definir expiração do PIX para 30 minutos a partir de agora
        const pixExpirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const pixPaymentBody: any = {
          transaction_amount: body.totals.total,
          description: `Pedido #${order.order_code}`,
          payment_method_id: "pix",
          payer: {
            email: body.customer.email,
            first_name: firstName,
            last_name: lastName,
            phone: {
              area_code: areaCode,
              number: phoneNumber,
            },
          },
          external_reference: order.id,
          notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
          date_of_expiration: pixExpirationDate,
          additional_info: {
            payer: {
              first_name: firstName,
              last_name: lastName,
              phone: {
                area_code: areaCode,
                number: phoneNumber,
              },
            },
          },
        };

        // Add CPF identification if provided
        if (body.customer.cpf) {
          const cpfDigits = body.customer.cpf.replace(/\D/g, "");
          pixPaymentBody.payer.identification = {
            type: "CPF",
            number: cpfDigits,
          };
        }

        console.log("Creating PIX payment:", JSON.stringify(pixPaymentBody, null, 2));

        const pixResponse = await fetch(
          "https://api.mercadopago.com/v1/payments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${mercadopagoToken}`,
              "X-Idempotency-Key": order.id,
            },
            body: JSON.stringify(pixPaymentBody),
          }
        );

        const pixData = await pixResponse.json();

        if (pixResponse.ok && pixData.point_of_interaction?.transaction_data) {
          console.log("PIX payment created:", pixData.id);

          const qrCode = pixData.point_of_interaction.transaction_data.qr_code;
          const qrCodeBase64 = pixData.point_of_interaction.transaction_data.qr_code_base64;

          // Update order with PIX data e data de expiração
          await supabase
            .from("orders")
            .update({
              mercadopago_payment_id: String(pixData.id),
              pix_qr_code: qrCode,
              pix_qr_code_base64: qrCodeBase64,
              pix_expires_at: pixExpirationDate,
            })
            .eq("id", order.id);

          paymentData.pixQrCode = qrCode;
          paymentData.pixQrCodeBase64 = qrCodeBase64;
          paymentData.pixPaymentId = pixData.id;
        } else {
          console.log("PIX payment not created directly, using preference:", pixData);
        }
      }
    }

    // Send receipt email for order creation (pending)
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-order-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          type: "created",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send receipt email:", emailError);
    }

    return new Response(JSON.stringify(paymentData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in create-payment-preference:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Process ValeDoce-only payment
async function processValeDocePayment(
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  order: any,
  body: CreateOrderRequest
) {
  try {
    console.log("Processing ValeDoce-only payment for order:", order.order_code);

    // Find buyer's affiliate record by email
    const { data: buyerAffiliate, error: buyerError } = await supabase
      .from("affiliates")
      .select("*")
      .eq("email", body.customer.email)
      .single();

    if (buyerError || !buyerAffiliate) {
      console.error("Buyer affiliate not found:", buyerError);
      throw new Error("Afiliado não encontrado. Faça login para usar ValeDoce.");
    }

    // Get ValeDoce settings
    const { data: settings } = await supabase
      .from("valedoce_settings")
      .select("valedoce_value")
      .limit(1)
      .single();

    const valedoceValue = settings?.valedoce_value || 1;
    const valedoceAmount = Math.round(body.totals.valedoceDiscount / valedoceValue);

    if (buyerAffiliate.valedoce_balance < valedoceAmount) {
      throw new Error("Saldo ValeDoce insuficiente");
    }

    console.log(`Spending ${valedoceAmount} ValeDoce from buyer ${buyerAffiliate.name}`);

    // Create spent transaction
    const { error: transactionError } = await supabase
      .from("valedoce_transactions")
      .insert([{
        affiliate_id: buyerAffiliate.id,
        amount: -valedoceAmount,
        type: "spent",
        description: `Compra - Pedido #${order.order_code} - Pagamento 100% ValeDoce`,
        order_id: order.id,
      }]);

    if (transactionError) {
      console.error("Error creating ValeDoce spend transaction:", transactionError);
      throw new Error("Erro ao processar ValeDoce");
    }

    // Update buyer's balance
    const newBalance = buyerAffiliate.valedoce_balance - valedoceAmount;
    const { error: updateError } = await supabase
      .from("affiliates")
      .update({ valedoce_balance: newBalance })
      .eq("id", buyerAffiliate.id);

    if (updateError) {
      console.error("Error updating buyer balance:", updateError);
      throw new Error("Erro ao atualizar saldo ValeDoce");
    }

    console.log(`ValeDoce payment processed! New balance: ${newBalance}`);

    // IMPORTANT: Do NOT grant ValeDoce to affiliate when payment is made with ValeDoce
    // ValeDoce payments should not generate ValeDoce rewards
    console.log("Payment made with ValeDoce - no affiliate reward granted");
  } catch (error) {
    console.error("Error processing ValeDoce payment:", error);
    throw error;
  }
}

// Grant ValeDoce to affiliate when sale is made through their link
async function grantValeDoceToAffiliate(
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  order: any,
  affiliateId: string
) {
  try {
    console.log("Granting ValeDoce to affiliate:", affiliateId);

    // Get affiliate details
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("*")
      .eq("id", affiliateId)
      .single();

    if (affiliateError || !affiliate) {
      console.error("Affiliate not found:", affiliateError);
      return;
    }

    // Get products from order items and calculate total ValeDoce reward
    const orderItems = order.items || [];
    let totalValeDoceReward = 0;
    const productNames: string[] = [];

    // Get ValeDoce rewards for each product
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from("products")
        .select("valedoce_reward, name")
        .eq("id", item.id)
        .single();

      if (product) {
        const reward = (product.valedoce_reward || 5) * (item.quantity || 1);
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

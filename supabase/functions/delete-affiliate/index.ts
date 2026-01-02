import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify they're admin
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { affiliateId, adminPassword, adminEmail } = await req.json();

    if (!affiliateId || !adminPassword || !adminEmail) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin password by attempting to sign in
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: "Senha incorreta" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role for deletion
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Permissão negada. Apenas admins podem deletar usuários." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get affiliate info before deletion
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from("affiliates")
      .select("id, user_id, name")
      .eq("id", affiliateId)
      .single();

    if (affiliateError || !affiliate) {
      return new Response(
        JSON.stringify({ error: "Afiliado não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete all related data in order

    // 1. Unlink orders from affiliate (set affiliate_id to null)
    const { error: ordersError } = await supabaseAdmin
      .from("orders")
      .update({ affiliate_id: null, affiliate_code: null })
      .eq("affiliate_id", affiliateId);

    if (ordersError) {
      console.error("Error unlinking orders:", ordersError);
    }

    // 2. Delete valedoce_transactions
    const { error: transactionsError } = await supabaseAdmin
      .from("valedoce_transactions")
      .delete()
      .eq("affiliate_id", affiliateId);

    if (transactionsError) {
      console.error("Error deleting transactions:", transactionsError);
    }

    // 3. Delete affiliate_sales
    const { error: salesError } = await supabaseAdmin
      .from("affiliate_sales")
      .delete()
      .eq("affiliate_id", affiliateId);

    if (salesError) {
      console.error("Error deleting sales:", salesError);
    }

    // 3. Delete affiliate record
    const { error: deleteAffiliateError } = await supabaseAdmin
      .from("affiliates")
      .delete()
      .eq("id", affiliateId);

    if (deleteAffiliateError) {
      return new Response(
        JSON.stringify({ error: "Erro ao deletar afiliado: " + deleteAffiliateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. If affiliate has a user_id, delete the auth user
    if (affiliate.user_id) {
      // Delete profile first
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("user_id", affiliate.user_id);

      // Delete user roles
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", affiliate.user_id);

      // Delete auth user
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
        affiliate.user_id
      );

      if (deleteUserError) {
        console.error("Error deleting auth user:", deleteUserError);
        // Continue even if auth user deletion fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Afiliado "${affiliate.name}" e todos os dados relacionados foram deletados com sucesso.` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

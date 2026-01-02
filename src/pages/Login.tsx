import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, AlertCircle, Eye, EyeOff, Shield, Candy, UserPlus } from "lucide-react";
import GhostLoader from "@/components/ui/ghost-loader";
import StoreLayout from "@/components/layout/StoreLayout";
import { useStore } from "@/context/StoreContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

interface LocationState {
  from?: {
    pathname: string;
  };
  message?: string;
}

const Login = () => {
  const [activeTab, setActiveTab] = useState<"admin" | "affiliate">("admin");

  // Admin login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Affiliate registration state
  const [affiliateMode, setAffiliateMode] = useState<"login" | "register">("login");
  const [affiliateEmail, setAffiliateEmail] = useState("");
  const [affiliatePassword, setAffiliatePassword] = useState("");
  const [affiliateName, setAffiliateName] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [showAffiliatePassword, setShowAffiliatePassword] = useState(false);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);
  const [isAffiliateLoading, setIsAffiliateLoading] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useStore();

  const from = (location.state as LocationState)?.from?.pathname || "/admin";
  const message = (location.state as LocationState)?.message;

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate("/admin");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAffiliateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateError(null);
    setIsAffiliateLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: affiliateEmail,
        password: affiliatePassword,
      });

      if (error) throw error;

      // Verificar se o usuário é afiliado
      const { data: affiliate } = await supabase.from("affiliates").select("*").eq("user_id", data.user.id).single();

      if (affiliate) {
        toast.success("Login realizado com sucesso!");
        navigate("/y/creditos");
      } else {
        toast.error("Você não está cadastrado como afiliado.");
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error("Erro:", err);
      if (err.message.includes("Invalid login credentials")) {
        setAffiliateError("Email ou senha incorretos");
      } else {
        setAffiliateError(err.message || "Erro ao fazer login");
      }
    } finally {
      setIsAffiliateLoading(false);
    }
  };

  const handleAffiliateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateError(null);
    setIsAffiliateLoading(true);

    if (!affiliateName.trim() || !affiliateCode.trim()) {
      setAffiliateError("Preencha todos os campos");
      setIsAffiliateLoading(false);
      return;
    }

    const normalizedCode = affiliateCode
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
    if (normalizedCode.length < 3) {
      setAffiliateError("O código deve ter pelo menos 3 caracteres");
      setIsAffiliateLoading(false);
      return;
    }

    try {
      // Verificar se código já existe
      const { data: existingCode } = await supabase
        .from("affiliates")
        .select("code")
        .eq("code", normalizedCode)
        .single();

      if (existingCode) {
        setAffiliateError("Este código já está em uso. Escolha outro.");
        setIsAffiliateLoading(false);
        return;
      }

      // Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: affiliateEmail,
        password: affiliatePassword,
        options: {
          emailRedirectTo: `${window.location.origin}/y/creditos`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar registro de afiliado
        const { error: affiliateError } = await supabase.from("affiliates").insert([
          {
            user_id: authData.user.id,
            code: normalizedCode,
            name: affiliateName.trim(),
            email: affiliateEmail,
            active: true,
            valedoce_balance: 0,
            points: 0,
            total_sales: 0,
            sales_count: 0,
            store_id: null,
          },
        ]);

        if (affiliateError) {
          console.error("Erro ao criar afiliado:", affiliateError);
          throw new Error("Erro ao criar cadastro de afiliado");
        }

        toast.success("Cadastro realizado! Verifique seu email para confirmar.");
        setAffiliateMode("login");
      }
    } catch (err: any) {
      console.error("Erro:", err);
      if (err.message.includes("already registered")) {
        setAffiliateError("Este email já está cadastrado. Faça login.");
      } else {
        setAffiliateError(err.message || "Erro ao cadastrar");
      }
    } finally {
      setIsAffiliateLoading(false);
    }
  };

  return (
    <StoreLayout showHeader={false} showFooter={false}>
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para loja
          </Button>

          <Card className="w-full">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">{settings.storeName}</CardTitle>
              <CardDescription>Escolha o tipo de acesso</CardDescription>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "admin" | "affiliate")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-4 mb-2" style={{ width: "calc(100% - 32px)" }}>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="affiliate" className="flex items-center gap-2">
                  <Candy className="h-4 w-4" />
                  Afiliado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="mt-0">
                <CardContent className="pt-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <GhostLoader size="small" className="mr-2" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar como Admin"
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="justify-center text-center text-sm text-gray-500">
                  <p>Acesso restrito a administradores</p>
                </CardFooter>
              </TabsContent>

              <TabsContent value="affiliate" className="mt-0">
                <CardContent className="pt-4">
                  {affiliateError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{affiliateError}</AlertDescription>
                    </Alert>
                  )}

                  {affiliateMode === "login" ? (
                    <form onSubmit={handleAffiliateLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="affiliate-email">Email</Label>
                        <Input
                          id="affiliate-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={affiliateEmail}
                          onChange={(e) => setAffiliateEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="affiliate-password">Senha</Label>
                        <div className="relative">
                          <Input
                            id="affiliate-password"
                            type={showAffiliatePassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={affiliatePassword}
                            onChange={(e) => setAffiliatePassword(e.target.value)}
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAffiliatePassword(!showAffiliatePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showAffiliatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
                        disabled={isAffiliateLoading}
                      >
                        {isAffiliateLoading ? (
                          <>
                            <GhostLoader size="small" className="mr-2" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar como Afiliado"
                        )}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAffiliateMode("register")}
                          className="text-sm text-pink-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <UserPlus className="h-4 w-4" />
                          Não tem conta? Cadastre-se
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleAffiliateRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Nome</Label>
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Seu nome"
                          value={affiliateName}
                          onChange={(e) => setAffiliateName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={affiliateEmail}
                          onChange={(e) => setAffiliateEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={affiliatePassword}
                          onChange={(e) => setAffiliatePassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-code">Código do Link</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">/ysa/</span>
                          <Input
                            id="register-code"
                            type="text"
                            placeholder="seucodigo"
                            value={affiliateCode}
                            onChange={(e) => setAffiliateCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                            required
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Este será seu link de indicação único</p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
                        disabled={isAffiliateLoading}
                      >
                        {isAffiliateLoading ? (
                          <>
                            <GhostLoader size="small" className="mr-2" />
                            Cadastrando...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Criar Conta de Afiliado
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAffiliateMode("login")}
                          className="text-sm text-pink-600 hover:underline"
                        >
                          Já tem conta? Faça login
                        </button>
                      </div>
                    </form>
                  )}
                </CardContent>
                <CardFooter className="justify-center text-center">
                  <div className="text-sm text-gray-500">
                    <p className="flex items-center justify-center gap-1">
                      <Candy className="h-4 w-4 text-pink-500" />
                      Ganhe Créditos indicando amigos!
                    </p>
                  </div>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </StoreLayout>
  );
};

export default Login;

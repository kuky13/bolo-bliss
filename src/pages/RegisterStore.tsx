import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Store, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RegisterStore = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    storeName: "",
    storeSlug: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "storeSlug") {
      // Formata slug: minusculo, sem espaços, apenas letras/números e hifens
      const formattedSlug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setFormData(prev => ({ ...prev, [name]: formattedSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Validar slug (permitir erro 401 pois pode ser anon)
      try {
        const { data: existingStore } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', formData.storeSlug)
          .maybeSingle();

        if (existingStore) {
          toast.error("Este endereço de loja já está em uso. Tente outro.");
          setIsLoading(false);
          return;
        }
      } catch (slugError) {
        // Se houver erro na validação de slug, continuar mesmo assim
        console.warn("Aviso ao validar slug:", slugError);
      }

      // 2. Criar Usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      const userId = authData.user.id;

      // 3. Criar Loja
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: formData.storeName,
          slug: formData.storeSlug,
          owner_id: userId,
          active: true
        })
        .select()
        .single();

      if (storeError) throw storeError;

      // 4. Vincular Usuário como Owner
      const { error: userStoreError } = await supabase
        .from('store_users')
        .insert({
          user_id: userId,
          store_id: storeData.id,
          role: 'owner'
        });

      if (userStoreError) throw userStoreError;

      // 5. Inicializar Configurações da Loja
      const { error: settingsError } = await supabase
        .from('store_settings')
        .insert({
          store_id: storeData.id,
          store_name: formData.storeName,
          welcome_message: `Bem-vindo à ${formData.storeName}! 🎂`,
          always_open: true
        });

      if (settingsError) throw settingsError;

      toast.success("Sua loja foi criada com sucesso!");

      // Redireciona para o admin da nova loja
      navigate(`/${formData.storeSlug}/admin/settings`);
    } catch (error: any) {
      console.error("Erro no registro:", error);

      let errorMessage = "Ocorreu um erro ao criar sua loja.";

      if (error.code === '42501') {
        errorMessage = "Erro de permissão. Tente novamente ou contate o suporte.";
      } else if (error.message?.includes("duplicate key") || error.code === '23505') {
        errorMessage = "Este endereço de loja já está em uso.";
      } else if (error.message?.includes("invalid input")) {
        errorMessage = "Dados inválidos. Verifique os campos.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <span className="text-3xl font-bold text-gradient-pink">Doce Vitrine</span>
      </Link>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <h1 className="text-4xl font-bold mb-6">Comece sua jornada <br />no mundo dos doces</h1>
          <ul className="space-y-4">
            {[
              "Catálogo digital profissional",
              "Gestão de pedidos simplificada",
              "Integração direta com WhatsApp",
              "Relatórios de vendas e lucros",
              "Configuração em menos de 5 minutos"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-muted-foreground">
                <CheckCircle2 className="text-primary w-6 h-6 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Card className="shadow-ios-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Criar Minha Loja</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para configurar sua conta e seu catálogo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nome da Confeitaria</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    placeholder="Ex: Doçuras da Maria"
                    required
                    value={formData.storeName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeSlug">Endereço da Loja (URL)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      bolobiz.com/
                    </span>
                    <Input
                      id="storeSlug"
                      name="storeSlug"
                      placeholder="minha-loja"
                      className="pl-[105px]"
                      required
                      value={formData.storeSlug}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este será o link que você enviará para seus clientes.
                  </p>
                </div>
                <hr className="my-2 border-border/50" />
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail de Acesso</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white shadow-pop rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando sua loja...
                  </>
                ) : (
                  <>
                    Criar Minha Loja
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Ao se cadastrar, você concorda com nossos <br />
                <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Privacidade</a>.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterStore;

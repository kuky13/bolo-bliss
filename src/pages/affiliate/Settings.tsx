import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoreLayout from "@/components/layout/StoreLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useValeDoce } from "@/context/ValeDoceContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Save, User, Mail, LinkIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import GhostLoader from "@/components/ui/ghost-loader";

const AffiliateSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { currentAffiliate } = useValeDoce();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    code: ""
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Faça login para acessar as configurações" } });
      return;
    }

    if (currentAffiliate) {
      setFormData({
        name: currentAffiliate.name,
        email: currentAffiliate.email || "",
        code: currentAffiliate.code
      });
    }
  }, [isAuthenticated, currentAffiliate, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAffiliate) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          code: formData.code.toLowerCase().trim()
        })
        .eq("id", currentAffiliate.id);

      if (error) {
        if (error.code === "23505") {
          toast.error("Este código já está em uso. Escolha outro.");
          return;
        }
        throw error;
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!currentAffiliate) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <GhostLoader size="large" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in max-w-lg">
        <Button variant="ghost" onClick={() => navigate("/y/creditos")} className="mb-4 pl-0">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para créditos
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Configurações
        </h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  Usado para receber notificações de novos ValeDoce
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Código do Link
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    /ysa/
                  </span>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="seucodigo"
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Este é o código que aparece no seu link de indicação
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 mb-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <GhostLoader size="small" className="mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </form>

        <Button 
          variant="outline" 
          className="w-full text-red-500 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </StoreLayout>
  );
};

export default AffiliateSettings;

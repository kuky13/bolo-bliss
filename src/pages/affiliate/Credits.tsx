import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StoreLayout from "@/components/layout/StoreLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useValeDoce } from "@/context/ValeDoceContext";
import { useAuth } from "@/context/AuthContext";
import { Candy, Copy, Share2, History, Settings, TrendingUp, ChevronLeft, QrCode } from "lucide-react";
import { toast } from "sonner";
import GhostLoader from "@/components/ui/ghost-loader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
const Credits = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  const {
    currentAffiliate,
    balance,
    transactions,
    isLoading,
    loadTransactions,
    settings
  } = useValeDoce();
  const [showQR, setShowQR] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Faça login para acessar seus créditos"
        }
      });
      return;
    }
    if (currentAffiliate) {
      loadTransactions();
    }
  }, [isAuthenticated, currentAffiliate, navigate, loadTransactions]);
  const affiliateLink = currentAffiliate ? `${window.location.origin}/ysa/${currentAffiliate.code}` : "";
  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Link copiado!");
  };
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu link de indicação",
          text: "Use meu link de indicação e ganhe benefícios!",
          url: affiliateLink
        });
      } catch (error) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };
  const balanceInReais = balance * settings.valedoceValue;
  if (!currentAffiliate && !isLoading) {
    return <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para loja
          </Button>
          
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <Candy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Você ainda não é afiliado</h2>
              <p className="text-muted-foreground mb-6">
                Cadastre-se como afiliado para começar a ganhar ValeDoce!
              </p>
              <Button onClick={() => navigate("/login")} className="bg-gradient-to-r from-pink-500 to-purple-600">
                Cadastrar como Afiliado
              </Button>
            </CardContent>
          </Card>
        </div>
      </StoreLayout>;
  }
  return <StoreLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 pl-0">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para loja
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Créditos
            </h1>
            <p className="text-muted-foreground">Olá, {currentAffiliate?.name}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigate("/y/settings")}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Saldo Principal */}
        <Card className="mb-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm mb-1">Seu saldo</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold">{balance}</span>
                  <span className="text-lg text-pink-100">ValeDoce</span>
                </div>
                <p className="text-pink-200 text-sm mt-2">
                  Equivalente a R$ {balanceInReais.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-4">
                <Candy className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vendas</p>
                  <p className="text-lg font-semibold">{currentAffiliate?.salesCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total ganho</p>
                  <p className="text-lg font-semibold">R$ {(currentAffiliate?.totalSales || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link de Indicação */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Seu Link de Indicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/50 rounded-lg p-3 mb-4 flex items-center justify-between">
              <code className="text-sm truncate flex-1">{affiliateLink}</code>
              <Button variant="ghost" size="icon" onClick={copyLink} className="ml-2">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button onClick={shareLink} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" onClick={() => setShowQR(!showQR)}>
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            {showQR && <div className="mt-4 flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(affiliateLink)}`} alt="QR Code" className="w-36 h-36" />
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* Histórico de Transações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="flex justify-center py-8">
                <GhostLoader size="medium" />
              </div> : transactions.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <Candy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma transação ainda</p>
                <p className="text-sm">Compartilhe seu link para começar a ganhar!</p>
              </div> : <div className="space-y-3">
                {transactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${transaction.type === 'earned' || transaction.type === 'bonus' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Candy className={`h-4 w-4 ${transaction.type === 'earned' || transaction.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || (transaction.type === 'earned' ? 'Comissão recebida' : 'ValeDoce utilizado')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.createdAt), "dd 'de' MMM 'às' HH:mm", {
                      locale: ptBR
                    })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={transaction.amount > 0 ? "default" : "secondary"} className={transaction.amount > 0 ? "bg-green-500" : "bg-red-500"}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </Badge>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </StoreLayout>;
};
export default Credits;
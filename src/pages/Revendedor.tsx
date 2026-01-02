import React from "react";
import StoreLayout from "@/components/layout/StoreLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Store, Gift, TrendingUp, Package, Phone } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const Revendedor: React.FC = () => {
  const { settings } = useStore();

  const defaultMessage =
    "Olá, tenho interesse em ser revendedor(a) dos bolos de pote e doces do Cantinho da Ysa. Pode me passar mais informações?";
  const encodedMessage = encodeURIComponent(defaultMessage);

  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`
    : settings.socialMedia?.whatsapp
      ? `${settings.socialMedia.whatsapp}?text=${encodedMessage}`
      : "#";

  return (
    <StoreLayout>
      <PageTransition>
        <div className="container max-w-4xl mx-auto px-4 py-6 sm:py-10">
          <div className="mb-6 sm:mb-8 text-center">
            <Badge variant="secondary" className="mb-3">
              Seja um parceiro {settings.storeName}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Torne-se um revendedor de bolos de pote
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Lucre vendendo bolos de pote, brigadeiros e outras sobremesas artesanais do {settings.storeName}, com
              preço especial de atacado e suporte próximo.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Preço especial para revenda</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Compre nossos bolos de pote com preço de atacado e revenda com excelente margem de lucro. Ideal para
                  quem quer complementar a renda ou montar um negócio de sobremesas.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pedidos mínimos acessíveis</li>
                  <li>Possibilidade de descontos por volume</li>
                  <li>Sabores fixos para facilitar suas vendas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Variedade de produtos</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Além dos bolos de pote, você também pode revender outros produtos do {settings.storeName}:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Brigadeiros e docinhos gourmet</li>
                  <li>Doces para festas e eventos</li>
                  <li>Outras sobremesas sazonais</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Negócio simples e lucrativo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Trabalhe com produtos de alta saída e ótimo custo-benefício. Venda em empresas, escolas, condomínios,
                  igrejas, eventos e muito mais.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Produto pronto para revenda</li>
                  <li>Você não precisa produzir os doces</li>
                  <li>Perfeito para renda extra ou negócio principal</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Suporte e orientação</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Te ajudamos com orientações de conservação, exposição, montagem de cardápio e sugestões de preços.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Dicas de como vender mais na sua região</li>
                  <li>Sugestões de kits e combinações de produtos</li>
                  <li>Contato direto com o Cantinho da Ysa pelo WhatsApp</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Como funciona para ser revendedor(a)?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Clique no botão <strong>"Saiba mais"</strong>.
                </li>
                <li>Converse com nossa equipe e receba a tabela de preços de atacado.</li>
                <li>Combine sabores, quantidades e dias de entrega.</li>
                <li>Faça seu primeiro pedido e comece a vender.</li>
              </ol>
              <p className="pt-2">
                É simples, sem burocracia e perfeito para quem quer começar a empreender com doces artesanais.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Phone className="mr-2 h-4 w-4" />
                Saiba mais
              </a>
            </Button>

            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <a href="/?search=bolo">Ver catálogo de bolos de pote</a>
            </Button>
          </div>

          <Separator className="mt-8 mb-4" />
          <p className="text-xs text-muted-foreground text-center max-w-xl mx-auto">
            As condições para revendedores podem mudar conforme a demanda da produção. Ao enviar mensagem, nossa equipe
            vai te orientar sobre valores atualizados, sabores disponíveis e quantidade mínima de pedidos.
          </p>
        </div>
      </PageTransition>
    </StoreLayout>
  );
};

export default Revendedor;

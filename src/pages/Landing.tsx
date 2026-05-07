import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  ShoppingBag,
  Smartphone,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Cake,
  Palette,
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gradient-pink">Doce Vitrine</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register-store">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-pop">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Sua confeitaria merece um <br />
              <span className="text-gradient-pink">catálogo digital incrível</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Crie sua loja em minutos, gerencie pedidos pelo WhatsApp e encante seus clientes com uma experiência mobile profissional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register-store">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white shadow-pop rounded-2xl group">
                  Criar Minha Loja
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl">
                  Já sou lojista
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Elements (Visual) */}
          <div className="absolute top-1/2 -left-20 -z-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/4 -right-20 -z-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-50" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo o que você precisa</h2>
            <p className="text-muted-foreground text-lg">Funcionalidades pensadas para facilitar seu dia a dia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8 text-blue-500" />,
                title: "Catálogo Mobile-First",
                description: "Seus clientes fazem pedidos direto pelo celular com uma interface estilo iOS."
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-green-500" />,
                title: "Pedidos via WhatsApp",
                description: "Receba todos os detalhes do pedido e localização do cliente direto no seu WhatsApp."
              },
              {
                icon: <Palette className="w-8 h-8 text-pink-500" />,
                title: "Personalização Total",
                description: "Altere cores, logos e configurações para deixar a loja com a sua cara."
              },
              {
                icon: <ShoppingBag className="w-8 h-8 text-orange-500" />,
                title: "Gestão de Produtos",
                description: "Painel intuitivo para gerenciar categorias, produtos e preços em tempo real."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
                title: "Relatórios de Vendas",
                description: "Acompanhe seus lucros e os produtos mais vendidos de forma simples."
              },
              {
                icon: <Store className="w-8 h-8 text-red-500" />,
                title: "Multi-lojas",
                description: "Gerencie múltiplas unidades ou marcas a partir de uma única conta."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/50 shadow-ios hover-scale h-full">
                  <CardContent className="pt-8 px-8">
                    <div className="mb-6 p-3 bg-muted rounded-2xl w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof/CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary to-purple-600 text-white rounded-[2rem] overflow-hidden relative border-none shadow-2xl">
            <CardContent className="p-12 md:p-20 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Comece a vender hoje mesmo</h2>
              <p className="text-white/80 text-xl mb-12">
                Junte-se a centenas de confeiteiras que profissionalizaram suas vendas com o Bolo Biz.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/register-store">
                  <Button size="lg" className="h-16 px-10 text-xl bg-white text-primary hover:bg-white/90 shadow-xl rounded-2xl font-bold">
                    Criar Catálogo Grátis
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 text-white/70">
                <CheckCircle2 className="w-5 h-5" />
                <span>Sem taxas por pedido</span>
                <span className="mx-2 text-white/20">|</span>
                <CheckCircle2 className="w-5 h-5" />
                <span>Configuração em 5 minutos</span>
              </div>
            </CardContent>

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Bolo Biz</span>
          </div>
          <p className="text-muted-foreground">© 2024 Doce Vitrine - Plataforma de Catálogos Digitais</p>
          <div className="flex gap-6 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

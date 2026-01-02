import React from "react";
import { Store, Truck, Clock, Tag } from "lucide-react";
import { IOSCard } from "@/components/ui/IOSCard";
import { motion } from "framer-motion";
const tips = [{
  icon: Store,
  title: "Informações da Loja",
  description: "Defina nome, logo e WhatsApp para os clientes falarem com você."
}, {
  icon: Truck,
  title: "Entrega",
  description: "Configure taxa de entrega e valor mínimo para frete grátis."
}, {
  icon: Clock,
  title: "Horários",
  description: "Informe quando sua loja aceita pedidos."
}, {
  icon: Tag,
  title: "Cupons",
  description: "Crie cupons de desconto para campanhas rápidas."
}];
const BeginnersGuide: React.FC = () => {
  return (
    <section className="space-y-3">
      {tips.map((tip) => (
        <IOSCard
          key={tip.title}
          variant="flat"
          padding="md"
          className="flex items-start gap-3"
        >
          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <tip.icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{tip.description}</p>
          </div>
        </IOSCard>
      ))}
    </section>
  );
};
export default BeginnersGuide;
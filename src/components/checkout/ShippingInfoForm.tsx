import React from "react";
import { Home, Building2, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface ShippingInfo {
  name: string;
  address: string;
  complement: string;
  district: string;
  reference: string;
  latitude?: number;
  longitude?: number;
}

interface ShippingInfoFormProps {
  shippingInfo: ShippingInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ShippingInfoForm = ({ shippingInfo, onChange }: ShippingInfoFormProps) => {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <label htmlFor="address" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
          <Home className="h-4 w-4 text-primary" />
          Endereço <span className="text-destructive">*</span>
        </label>
        <Input
          id="address"
          name="address"
          placeholder="Rua, número"
          value={shippingInfo.address}
          onChange={onChange}
          required
          className="rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label htmlFor="complement" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Complemento <span className="text-muted-foreground text-xs">(opcional)</span>
        </label>
        <Input
          id="complement"
          name="complement"
          placeholder="Apartamento, bloco, etc."
          value={shippingInfo.complement}
          onChange={onChange}
          className="rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="district" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
          <Navigation className="h-4 w-4 text-primary" />
          Bairro <span className="text-destructive">*</span>
        </label>
        <Input
          id="district"
          name="district"
          placeholder="Seu bairro"
          value={shippingInfo.district}
          onChange={onChange}
          required
          className="rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label htmlFor="reference" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
          Ponto de Referência <span className="text-muted-foreground text-xs">(opcional)</span>
        </label>
        <Textarea
          id="reference"
          name="reference"
          placeholder="Próximo a..."
          value={shippingInfo.reference}
          onChange={onChange}
          className="h-20 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
        />
      </motion.div>
    </div>
  );
};

export default ShippingInfoForm;

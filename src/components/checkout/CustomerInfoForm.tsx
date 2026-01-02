import React from "react";
import { User, Mail, Phone, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile.tsx";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const CustomerInfoForm = ({ customerInfo, onChange }: CustomerInfoFormProps) => {
  const isMobile = useIsMobile();
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    const event = {
      ...e,
      target: { ...e.target, name: "phone", value: formatted },
    };
    onChange(event as React.ChangeEvent<HTMLInputElement>);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    const event = {
      ...e,
      target: { ...e.target, name: "cpf", value: formatted },
    };
    onChange(event as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <label htmlFor="name" className={`mb-1 flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
          <User className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary`} />
          Nome Completo <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Seu nome completo"
          value={customerInfo.name}
          onChange={onChange}
          required
          className={`rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${isMobile ? 'h-10 text-sm' : ''}`}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label htmlFor="email" className={`mb-1 flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
          <Mail className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary`} />
          Email <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={customerInfo.email}
          onChange={onChange}
          required
          className={`rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${isMobile ? 'h-10 text-sm' : ''}`}
        />
        {!isMobile && (
          <p className="mt-1 text-xs text-muted-foreground">
            Enviaremos o recibo do pedido para este email
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="phone" className={`mb-1 flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
          <Phone className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary`} />
          Telefone <span className="text-destructive">*</span>
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={customerInfo.phone}
          onChange={handlePhoneChange}
          required
          maxLength={15}
          className={`rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${isMobile ? 'h-10 text-sm' : ''}`}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label htmlFor="cpf" className={`mb-1 flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
          <FileText className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
          CPF <span className="text-muted-foreground text-xs">(opcional)</span>
        </label>
        <Input
          id="cpf"
          name="cpf"
          placeholder="000.000.000-00"
          value={customerInfo.cpf}
          onChange={handleCPFChange}
          maxLength={14}
          className={`rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${isMobile ? 'h-10 text-sm' : ''}`}
        />
      </motion.div>
    </div>
  );
};

export default CustomerInfoForm;

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Loader2, QrCode, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
interface PixPaymentSectionProps {
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  total: number;
  orderCode: string;
  isLoading?: boolean;
}
const PixPaymentSection = ({
  pixQrCode,
  pixQrCodeBase64,
  total,
  orderCode,
  isLoading = false
}: PixPaymentSectionProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopyCode = async () => {
    if (!pixQrCode) return;
    try {
      await navigator.clipboard.writeText(pixQrCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Erro ao copiar código");
    }
  };
  if (isLoading) {
    return <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Gerando código PIX...</p>
      </div>;
  }
  if (!pixQrCode) {
    return <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
        <div className="p-4 rounded-full bg-muted">
          <QrCode className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">QR Code PIX</p>
          <p className="text-sm text-muted-foreground">
            O código será gerado após confirmar o pedido
          </p>
        </div>
      </div>;
  }
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className="space-y-6">
      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className="p-4 bg-white rounded-2xl shadow-lg">
          {pixQrCodeBase64 ? <img src={`data:image/png;base64,${pixQrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48" /> : <QRCodeSVG value={pixQrCode} size={192} level="H" includeMargin />}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold text-primary">
            R$ {total.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Pedido #{orderCode}
          </p>
        </div>
      </div>

      {/* Copy code button */}
      <div className="space-y-3">
        <p className="text-sm text-center text-muted-foreground">
          Escaneie o QR Code ou copie o código abaixo
        </p>
        
        <div className="relative">
          <div className="p-3 bg-muted/50 rounded-xl text-xs font-mono break-all max-h-24 overflow-y-auto">
            {pixQrCode}
          </div>
        </div>
        
        <Button onClick={handleCopyCode} variant={copied ? "default" : "outline"} className="w-full gap-2 rounded-xl transition-all duration-300">
          {copied ? <>
              <Check className="h-4 w-4" />
              Código Copiado!
            </> : <>
              <Copy className="h-4 w-4" />
              Copiar Código PIX
            </>}
        </Button>
      </div>

      {/* Timer warning */}
      
    </motion.div>;
};
export default PixPaymentSection;
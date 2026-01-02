
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cake } from "lucide-react";

interface CustomCakeFormProps {
  customCakeDetails: string;
  customCakeMessage: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const CustomCakeForm = ({ 
  customCakeDetails, 
  customCakeMessage, 
  onChange 
}: CustomCakeFormProps) => {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50/40 shadow-md backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-store-pink/20 to-store-pink/40 flex items-center justify-center">
          <Cake className="h-5 w-5 text-store-pink" />
        </div>
        <h2 className="text-lg font-medium text-gray-800">Detalhes do Bolo Personalizado</h2>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="customCakeDetails" className="font-medium text-gray-700">
          {customCakeMessage || "Descreva como deseja seu bolo personalizado:"}
        </Label>
        <Textarea
          id="customCakeDetails"
          placeholder="Ex: Bolo para aniversário de 15 anos, tema floral, cobertura de chocolate e decoração em tons de rosa..."
          value={customCakeDetails}
          onChange={onChange}
          className="min-h-[120px] transition-all focus-within:shadow-md bg-white/70"
          required
        />
        <p className="text-xs text-gray-500 italic mt-2">
          Informe todos os detalhes importantes como sabor, tema, cores e ocasião para garantirmos o bolo perfeito para você.
        </p>
      </div>
    </div>
  );
};

export default CustomCakeForm;


import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ImagePlus, Package, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductFormProps {
  initialProduct: Partial<Product>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  inputError: {field: string, message: string} | null;
  isUploading: boolean;
  isEditing?: boolean;
}

const ProductForm = ({ 
  initialProduct, 
  onInputChange, 
  onCheckboxChange, 
  inputError, 
  isUploading,
  isEditing = false 
}: ProductFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Renderiza o indicador de erro para os campos do formulário
  const renderErrorIndicator = (fieldName: string) => {
    if (inputError && inputError.field === fieldName) {
      return (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {inputError.message}
        </div>
      );
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Verificar tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      // Verificar tipo de arquivo
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast.error("Formato de arquivo não suportado. Use JPG, PNG, WEBP ou GIF");
        return;
      }

      // Gerar nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      // Upload para o storage do Supabase
      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Erro ao fazer upload: ${uploadError.message}`);
        return;
      }

      // Obter a URL pública do arquivo
      const { data } = supabase.storage
        .from('imagens')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // Create a synthetic event to leverage the existing input change handler
        const syntheticEvent = {
          target: {
            name: "imageUrl",
            value: data.publicUrl
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onInputChange(syntheticEvent);
        toast.success("Imagem carregada com sucesso!");
      }
    } catch (error: any) {
      toast.error(`Erro ao fazer upload: ${error.message}`);
    } finally {
      // Limpar o input file para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={isEditing ? "edit-name" : "name"} className="font-medium">
          Nome do Produto*
        </Label>
        <Input
          id={isEditing ? "edit-name" : "name"}
          name="name"
          value={initialProduct.name || ""}
          onChange={onInputChange}
          placeholder="Nome do produto"
          className={inputError?.field === "name" ? "border-red-500 focus-visible:ring-red-500" : ""}
          required
        />
        {renderErrorIndicator("name")}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={isEditing ? "edit-price" : "price"} className="font-medium">
          Preço*
        </Label>
        <Input
          id={isEditing ? "edit-price" : "price"}
          name="price"
          type="number"
          step="0.01"
          value={initialProduct.price === 0 && !initialProduct.price ? "" : initialProduct.price}
          onChange={onInputChange}
          placeholder="0.00"
          min="0"
          className={inputError?.field === "price" ? "border-red-500 focus-visible:ring-red-500" : ""}
          required
        />
        {renderErrorIndicator("price")}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={isEditing ? "edit-description" : "description"} className="font-medium">
          Descrição*
        </Label>
        <Textarea
          id={isEditing ? "edit-description" : "description"}
          name="description"
          value={initialProduct.description || ""}
          onChange={onInputChange}
          placeholder="Descrição do produto"
          className={inputError?.field === "description" ? "border-red-500 focus-visible:ring-red-500" : ""}
          required
        />
        {renderErrorIndicator("description")}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={isEditing ? "edit-imageUrl" : "imageUrl"} className="font-medium">
          Imagem do Produto
        </Label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              id={isEditing ? "edit-imageUrl" : "imageUrl"}
              name="imageUrl"
              value={initialProduct.imageUrl || ""}
              onChange={onInputChange}
              placeholder="URL da imagem (ou use o botão de Galeria)"
              className="flex-1"
            />
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={triggerFileInput} 
              disabled={isUploading}
              className="flex gap-2 whitespace-nowrap"
            >
              {isUploading ? "Enviando..." : "Galeria"}
              <ImagePlus className="h-4 w-4" />
            </Button>
          </div>
          
          {initialProduct.imageUrl && (
            <div className="mt-2 h-32 w-32 overflow-hidden rounded border">
              <img 
                src={initialProduct.imageUrl}
                alt="Prévia da imagem"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={isEditing ? "edit-category" : "category"} className="font-medium">
          Categoria
        </Label>
        <Input
          id={isEditing ? "edit-category" : "category"}
          name="category"
          value={initialProduct.category || ""}
          onChange={onInputChange}
          placeholder="Categoria do produto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={isEditing ? "edit-stock" : "stock"} className="font-medium flex items-center">
            <Package className="h-4 w-4 mr-1" /> Estoque
          </Label>
          <Input
            id={isEditing ? "edit-stock" : "stock"}
            name="stock"
            type="number"
            value={initialProduct.stock === undefined ? "" : initialProduct.stock}
            onChange={onInputChange}
            placeholder="Quantidade em estoque"
            min="0"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor={isEditing ? "edit-maxPurchaseQuantity" : "maxPurchaseQuantity"} className="font-medium flex items-center">
            <ShoppingCart className="h-4 w-4 mr-1" /> Máx. por Cliente
          </Label>
          <Input
            id={isEditing ? "edit-maxPurchaseQuantity" : "maxPurchaseQuantity"}
            name="maxPurchaseQuantity"
            type="number"
            value={initialProduct.maxPurchaseQuantity || 5}
            onChange={onInputChange}
            placeholder="Quantidade máxima por cliente"
            min="1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade máxima que um cliente pode comprar (padrão: 5)
          </p>
        </div>
      </div>

      {/* Campo ValeDoce Reward removido - valor controlado globalmente em Configurações */}
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id={isEditing ? "edit-featured" : "featured"}
          checked={initialProduct.featured || false}
          onCheckedChange={onCheckboxChange}
        />
        <Label htmlFor={isEditing ? "edit-featured" : "featured"} className="font-normal">
          Produto em destaque
        </Label>
      </div>
    </div>
  );
};

export default ProductForm;

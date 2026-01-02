import React, { useState, useMemo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProducts } from "@/context/ProductContext";
import { Product } from "@/types";
import { Plus, Package2 } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "@/components/products/ProductForm";
import ProductTable from "@/components/products/ProductTable";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useIsMobile } from "@/hooks/use-mobile";
import IOSSearchBar from "@/components/ui/IOSSearchBar";
import { IOSCard, IOSCardHeader } from "@/components/ui/IOSCard";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { motion } from "framer-motion";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  featured: false,
  category: "",
  stock: 0,
  maxPurchaseQuantity: 5
};

const ProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const confirmation = useConfirmation();
  const isMobile = useIsMobile();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | Omit<Product, "id">>(emptyProduct);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputError, setInputError] = useState<{field: string, message: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (inputError?.field === name) {
      setInputError(null);
    }
    
    if (type === "number") {
      if (value === "") {
        setCurrentProduct((prev) => ({ ...prev, [name]: "" }));
      } else {
        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
          setCurrentProduct((prev) => ({ ...prev, [name]: numberValue }));
        }
      }
    } else {
      setCurrentProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setCurrentProduct((prev) => ({ ...prev, featured: checked }));
  };

  const validateProduct = () => {
    if (!currentProduct.name?.trim()) {
      setInputError({field: "name", message: "Nome do produto é obrigatório"});
      return false;
    }
    
    const priceValue = typeof currentProduct.price === 'string' 
      ? parseFloat(currentProduct.price) 
      : currentProduct.price;
      
    if (priceValue === 0 || isNaN(priceValue) || (typeof currentProduct.price === 'string' && currentProduct.price === '')) {
      setInputError({field: "price", message: "Preço deve ser maior que zero"});
      return false;
    }
    
    if (!currentProduct.description?.trim()) {
      setInputError({field: "description", message: "Descrição do produto é obrigatória"});
      return false;
    }
    
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateProduct()) return;

    const confirmed = await confirmation.confirm({
      title: "Adicionar Produto",
      description: `Tem certeza que deseja adicionar o produto "${currentProduct.name}"?`,
      confirmText: "Adicionar",
      cancelText: "Cancelar",
      variant: "success"
    });

    if (!confirmed) return;

    const price = typeof currentProduct.price === 'string' ? parseFloat(currentProduct.price) || 0 : currentProduct.price;

    addProduct({
      ...currentProduct,
      price,
      stock: currentProduct.stock || 0,
      maxPurchaseQuantity: currentProduct.maxPurchaseQuantity || 5
    } as Omit<Product, "id">);
    
    setCurrentProduct(emptyProduct);
    setIsAdding(false);
    toast.success("Produto adicionado com sucesso!");
  };

  const handleEditProduct = async () => {
    if (!validateProduct()) return;

    const confirmed = await confirmation.confirm({
      title: "Salvar Alterações",
      description: `Tem certeza que deseja salvar as alterações no produto "${currentProduct.name}"?`,
      confirmText: "Salvar",
      cancelText: "Cancelar",
      variant: "warning"
    });

    if (!confirmed) return;

    const price = typeof currentProduct.price === 'string' ? parseFloat(currentProduct.price) || 0 : currentProduct.price;

    updateProduct({
      ...currentProduct,
      price,
      stock: currentProduct.stock || 0,
      maxPurchaseQuantity: currentProduct.maxPurchaseQuantity || 5
    } as Product);
    
    setCurrentProduct(emptyProduct);
    setIsEditing(false);
    toast.success("Produto atualizado com sucesso!");
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const openDeleteDialog = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const closeAndResetForm = () => {
    setCurrentProduct(emptyProduct);
    setInputError(null);
    setIsAdding(false);
    setIsEditing(false);
  };

  return (
    <AdminLayout title="Produtos">
      <PageTransition>
        <StaggerContainer
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="space-y-4"
        >
          {/* Header */}
          <StaggerItem variants={staggerItem}>
            <div className="flex flex-col gap-4">
              {!isMobile && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Package2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Gerenciar Produtos</h1>
                      <p className="text-sm text-muted-foreground">
                        {products.length} {products.length === 1 ? "produto" : "produtos"} cadastrados
                      </p>
                    </div>
                  </div>
                  <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl h-11 gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Adicionar Produto</DialogTitle>
                        <DialogDescription>Preencha os dados do novo produto.</DialogDescription>
                      </DialogHeader>
                      <ProductForm 
                        initialProduct={currentProduct}
                        onInputChange={handleInputChange}
                        onCheckboxChange={handleCheckboxChange}
                        inputError={inputError}
                        isUploading={isUploading}
                      />
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" onClick={closeAndResetForm} className="w-full sm:w-auto rounded-xl">
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button onClick={handleAddProduct} disabled={isUploading} className="w-full sm:w-auto rounded-xl">
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              <IOSSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar produtos por nome, categoria..."
              />

              {searchTerm && (
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </motion.p>
              )}
            </div>
          </StaggerItem>

          {/* Mobile FAB */}
          {isMobile && (
            <FloatingActionButton onClick={() => setIsAdding(true)} label="Novo Produto" />
          )}

          {/* Mobile Add Dialog */}
          {isMobile && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogContent className="max-h-[90vh] overflow-y-auto rounded-t-3xl rounded-b-none fixed bottom-0 top-auto translate-y-0">
                <DialogHeader>
                  <DialogTitle>Adicionar Produto</DialogTitle>
                  <DialogDescription>Preencha os dados do novo produto.</DialogDescription>
                </DialogHeader>
                <ProductForm 
                  initialProduct={currentProduct}
                  onInputChange={handleInputChange}
                  onCheckboxChange={handleCheckboxChange}
                  inputError={inputError}
                  isUploading={isUploading}
                />
                <DialogFooter className="flex-col gap-2">
                  <Button onClick={handleAddProduct} disabled={isUploading} className="w-full rounded-xl h-12">
                    Adicionar Produto
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" onClick={closeAndResetForm} className="w-full rounded-xl">
                      Cancelar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className={cn(
              "max-h-[90vh] overflow-y-auto",
              isMobile ? "rounded-t-3xl rounded-b-none fixed bottom-0 top-auto translate-y-0" : "sm:max-w-md rounded-2xl"
            )}>
              <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
                <DialogDescription>Atualize os dados do produto.</DialogDescription>
              </DialogHeader>
              <ProductForm 
                initialProduct={currentProduct}
                onInputChange={handleInputChange}
                onCheckboxChange={handleCheckboxChange}
                inputError={inputError}
                isUploading={isUploading}
                isEditing={true}
              />
              <DialogFooter className={cn("gap-2", isMobile ? "flex-col" : "flex-col sm:flex-row")}>
                {isMobile ? (
                  <>
                    <Button onClick={handleEditProduct} disabled={isUploading} className="w-full rounded-xl h-12">
                      Salvar Alterações
                    </Button>
                    <DialogClose asChild>
                      <Button variant="ghost" onClick={closeAndResetForm} className="w-full rounded-xl">
                        Cancelar
                      </Button>
                    </DialogClose>
                  </>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={closeAndResetForm} className="w-full sm:w-auto rounded-xl">
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button onClick={handleEditProduct} disabled={isUploading} className="w-full sm:w-auto rounded-xl">
                      Salvar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DeleteProductDialog 
            open={showDeleteDialog} 
            onOpenChange={setShowDeleteDialog}
            onConfirmDelete={handleDeleteProduct}
          />

          {/* Product List */}
          <StaggerItem variants={staggerItem}>
            <IOSCard className="overflow-hidden">
              <IOSCardHeader
                icon={<Package2 className="h-5 w-5 text-primary" />}
                title="Seus Produtos"
                description={`${filteredProducts.length} itens`}
              />
              <div className="p-0">
                <ProductTable 
                  products={filteredProducts} 
                  onEdit={openEditDialog} 
                  onDelete={openDeleteDialog} 
                />
              </div>
            </IOSCard>
          </StaggerItem>

          <ConfirmationDialog
            open={confirmation.isOpen}
            onOpenChange={confirmation.setIsOpen}
            title={confirmation.options.title}
            description={confirmation.options.description}
            confirmText={confirmation.options.confirmText}
            cancelText={confirmation.options.cancelText}
            variant={confirmation.options.variant}
            onConfirm={confirmation.handleConfirm}
          />
        </StaggerContainer>
      </PageTransition>
    </AdminLayout>
  );
};

export default ProductsPage;

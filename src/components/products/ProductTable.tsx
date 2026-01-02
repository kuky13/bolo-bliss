import React from "react";
import { Product } from "@/types";
import { Edit, Trash2, Upload, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProductCardMobile from "./ProductCardMobile";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  // Versão mobile com cards
  const MobileView = () => (
    <div className="space-y-3 md:hidden">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCardMobile
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="py-8 text-center text-muted-foreground rounded-lg border bg-card">
          Nenhum produto cadastrado. Adicione seu primeiro produto!
        </div>
      )}
    </div>
  );

  // Versão desktop com tabela
  const DesktopView = () => (
    <div className="rounded-md border hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Foto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="text-center">Máx/Cliente</TableHead>
            <TableHead className="w-[100px]">Destaque</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => {
              const isOutOfStock = product.stock !== undefined && product.stock <= 0;
              const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock < 5;
              
              return (
                <TableRow 
                  key={product.id}
                  className={isOutOfStock ? "bg-destructive/5" : ""}
                >
                  <TableCell>
                    {product.imageUrl ? (
                      <div className="h-10 w-10 overflow-hidden rounded">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {product.name}
                      {isOutOfStock && (
                        <Badge variant="destructive" className="text-xs">Esgotado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.category || "-"}</TableCell>
                  <TableCell className="text-right">
                    R$ {product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-center font-medium ${isOutOfStock ? 'text-destructive' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>
                    <div className="flex items-center justify-center gap-1">
                      {isOutOfStock && <AlertOctagon className="h-4 w-4" />}
                      {product.stock || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.maxPurchaseQuantity || 5}
                  </TableCell>
                  <TableCell>
                    {product.featured ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                Nenhum produto cadastrado. Adicione seu primeiro produto!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default ProductTable;

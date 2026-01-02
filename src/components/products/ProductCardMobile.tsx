import { Product } from "@/types";
import { Edit, Trash2, Upload, AlertOctagon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardMobileProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCardMobile = ({ product, onEdit, onDelete }: ProductCardMobileProps) => {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock < 5;

  return (
    <Card className={`${isOutOfStock ? "border-destructive/50 bg-destructive/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Imagem do produto */}
          <div className="flex-shrink-0">
            {product.imageUrl ? (
              <div className="h-16 w-16 overflow-hidden rounded-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Informações do produto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate flex items-center gap-1.5">
                  {product.name}
                  {product.featured && (
                    <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                  )}
                </h3>
                {product.category && (
                  <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                )}
              </div>
              <span className="font-bold text-primary whitespace-nowrap">
                R$ {product.price.toFixed(2)}
              </span>
            </div>

            {/* Badges e info */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertOctagon className="h-3 w-3" />
                  Esgotado
                </Badge>
              ) : isLowStock ? (
                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                  Estoque: {product.stock}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                  Estoque: {product.stock || 0}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                Máx: {product.maxPurchaseQuantity || 5}/cliente
              </Badge>
            </div>

            {/* Ações */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardMobile;

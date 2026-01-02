import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const SearchBar = () => {
  const {
    products
  } = useProducts();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const filteredProducts = searchQuery ? products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase()) || product.category?.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-[240px] md:max-w-xs">
          
          
          {searchQuery && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={e => {
          e.stopPropagation();
          setSearchQuery("");
        }}>
              <X size={14} />
            </button>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px] md:w-[350px]" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Digite para pesquisar produtos..." value={searchQuery} onValueChange={setSearchQuery} className="h-9" />
          <CommandEmpty className="py-3">Nenhum produto encontrado.</CommandEmpty>
          {filteredProducts.length > 0 && <CommandGroup heading="Produtos">
              {filteredProducts.slice(0, 6).map(product => <CommandItem key={product.id} onSelect={() => {
            navigate(`/product/${product.id}`);
            setOpen(false);
            setSearchQuery("");
          }} className="flex items-center gap-2 py-2 cursor-pointer">
                  <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                    <img src={product.imageUrl || "https://placehold.co/100x100"} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                  </div>
                  <div className="text-sm font-medium text-store-pink">
                    R$ {product.price.toFixed(2)}
                  </div>
                </CommandItem>)}
              {filteredProducts.length > 6 && <div className="px-2 pb-2 pt-1">
                  <Button variant="link" size="sm" className="w-full text-xs text-store-pink" onClick={() => {
              navigate(`/?search=${encodeURIComponent(searchQuery)}`);
              setOpen(false);
              setSearchQuery("");
            }}>
                    Ver todos os {filteredProducts.length} resultados
                  </Button>
                </div>}
            </CommandGroup>}
        </Command>
      </PopoverContent>
    </Popover>;
};
export default SearchBar;
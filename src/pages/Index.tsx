import React, { useState, useEffect, useMemo, useCallback } from "react";
import StoreLayout from "@/components/layout/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";
import { useStore } from "@/context/StoreContext";
import { useStoreHours } from "@/hooks/useStoreHours";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import SearchSection from "@/components/home/SearchSection";
import EasterEggAlert from "@/components/home/EasterEggAlert";
import CategoryFilter from "@/components/home/CategoryFilter";
import StoreClosedAlert from "@/components/home/StoreClosedAlert";
import { AffiliateIndicator } from "@/components/affiliate/AffiliateIndicator";
import { ProductGridSkeleton, SearchSkeleton, CategoryFilterSkeleton } from "@/components/ui/loading-skeleton";
import { PageTransition, staggerContainer, staggerItem } from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StoreBanners } from "@/components/home/StoreBanners";
const Index = () => {
  const { products, isLoading } = useProducts();
  const { settings } = useStore();
  const { isStoreOpen } = useStoreHours();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParam || "");
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(product => product.category).filter(Boolean)));
  }, [products]);

  const featuredProducts = useMemo(() => {
    return products.filter(product => product.featured);
  }, [products]);

  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    setShowEasterEgg(searchTerm.toLowerCase() === "cookie");
  }, [searchTerm]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSearchTerm("");
  }, []);

  const hasNoResults = useMemo(() => {
    return (searchTerm || selectedCategory) && filteredProducts.length === 0;
  }, [searchTerm, selectedCategory, filteredProducts.length]);

  const showStoreClosedAlert = !settings.alwaysOpen && !isStoreOpen;

  // Show featured section only when no filters are active
  const showFeaturedSection = !searchTerm && !selectedCategory && featuredProducts.length > 0;

  return (
    <StoreLayout>
      <PageTransition>
        <div className="container max-w-7xl mx-auto px-3 py-4 sm:py-6">
          <AffiliateIndicator />
          {/* Banners rotativos de destaque (ex: entrega grátis) */}
          {/* @ts-ignore - componente utiliza campos opcionais de settings */}
          <StoreBanners />

          <div className="mt-4 flex justify-center">
            <Link to="/revendedor">
              <Button variant="secondary" className="rounded-full px-6">
                Seja um revendedor
              </Button>
            </Link>
          </div>
          
          
          {isLoading ? (
            <>
              <SearchSkeleton />
              <CategoryFilterSkeleton />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SearchSection searchTerm={searchTerm} onSearchChange={handleSearchChange} />
              
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </motion.div>
          )}
          
          <EasterEggAlert show={showEasterEgg} />
          
          {showStoreClosedAlert ? null : null}


          {/* Featured Products Section */}
          {!isLoading && showFeaturedSection && (
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Destaques</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Products Section */}
          {isLoading ? (
            <ProductGridSkeleton count={10} />
          ) : (
            <>
              {showFeaturedSection && (
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Todos os Produtos</h2>
                </div>
              )}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3"
                initial="initial"
                animate="enter"
                variants={staggerContainer}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={staggerItem}
                    custom={index}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {hasNoResults && !isLoading && (
            <motion.div 
              className="mt-8 sm:mt-12 text-center py-6 sm:py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-lg text-muted-foreground">Nenhum produto encontrado.</p>
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="mt-4 rounded-xl"
              >
                Limpar filtros
              </Button>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </StoreLayout>
  );
};

export default Index;

import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useProducts } from "@/context/ProductContext";
import { useStore } from "@/context/StoreContext";
import { Package2, Truck, Settings, AlertTriangle, TrendingUp, Check, Store, Plus, Sparkles, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { IOSCard, IOSCardHeader, IOSListItem } from "@/components/ui/IOSCard";
import IOSStatCard from "@/components/ui/IOSStatCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
const Dashboard = () => {
  const {
    products
  } = useProducts();
  const {
    settings
  } = useStore();
  const isMobile = useIsMobile();
  const outOfStockCount = products.filter(p => p.stock !== undefined && p.stock <= 0).length;
  const lowStockCount = products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock < 5).length;
  const inStockCount = products.filter(p => p.stock === undefined || p.stock > 0).length;
  const featuredProductsCount = products.filter(p => p.featured).length;
  const categoriesCount = products.reduce((acc, product) => {
    if (product.category) {
      acc[product.category] = (acc[product.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return <AdminLayout title="Dashboard">
      <PageTransition>
        <StaggerContainer variants={staggerContainer} initial="initial" animate="enter" className="space-y-5">
          {/* Stock Alert Card */}
          {outOfStockCount > 0 && <StaggerItem variants={staggerItem}>
              <motion.div className="ios-card p-4 border-l-4 border-l-destructive bg-destructive/5" initial={{
            x: -20,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            type: "spring",
            stiffness: 200
          }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-destructive text-sm">Alerta de Estoque</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>{outOfStockCount}</strong> produto{outOfStockCount !== 1 ? 's' : ''} sem estoque
                      {lowStockCount > 0 && `. ${lowStockCount} com estoque baixo.`}
                    </p>
                    <Link to="/admin/products" className="inline-block mt-3">
                      <Button size="sm" variant="destructive" className="rounded-xl h-9">
                        Gerenciar Estoque
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>}

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StaggerItem variants={staggerItem}>
              <IOSStatCard icon={Package2} iconColor="text-blue-600" iconBgColor="bg-blue-100 dark:bg-blue-900/30" title="Total" value={products.length} subtitle="produtos" delay={0} />
            </StaggerItem>
            
            <StaggerItem variants={staggerItem}>
              <IOSStatCard icon={Check} iconColor="text-emerald-600" iconBgColor="bg-emerald-100 dark:bg-emerald-900/30" title="Em Estoque" value={inStockCount} subtitle={outOfStockCount > 0 ? `${outOfStockCount} esgotados` : "disponíveis"} delay={50} />
            </StaggerItem>
            
            <StaggerItem variants={staggerItem}>
              <IOSStatCard icon={Truck} iconColor="text-amber-600" iconBgColor="bg-amber-100 dark:bg-amber-900/30" title="Entrega" value={settings.deliveryFee > 0 ? `R$ ${settings.deliveryFee.toFixed(2)}` : "Grátis"} subtitle={settings.freeDeliveryThreshold ? `Grátis acima de R$ ${settings.freeDeliveryThreshold}` : undefined} delay={100} />
            </StaggerItem>
            
            <StaggerItem variants={staggerItem}>
              <IOSStatCard icon={TrendingUp} iconColor="text-pink-600" iconBgColor="bg-pink-100 dark:bg-pink-900/30" title="Destaque" value={featuredProductsCount} subtitle={`de ${products.length} produtos`} delay={150} />
            </StaggerItem>
          </div>

          {/* Quick Actions */}
          <StaggerItem variants={staggerItem}>
            <IOSCard>
              <IOSCardHeader icon={<Sparkles className="h-5 w-5 text-primary" />} title="Ações Rápidas" description="Gerencie sua loja" />
              <div className={cn("grid gap-2 p-4 pt-0", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                <Link to="/admin/orders" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl justify-start gap-3 touch-feedback">
                    <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                    </div>
                    Pedidos
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl justify-start gap-3 touch-feedback">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Store className="h-4 w-4 text-blue-600" />
                    </div>
                    Ver Loja
                  </Button>
                </Link>
                <Link to="/admin/products" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl justify-start gap-3 touch-feedback">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Plus className="h-4 w-4 text-emerald-600" />
                    </div>
                    Novo 
                  </Button>
                </Link>
                <Link to="/admin/settings" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl justify-start gap-3 touch-feedback">
                    <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      <Settings className="h-4 w-4 text-violet-600" />
                    </div>
                    Config
                  </Button>
                </Link>
              </div>
            </IOSCard>
          </StaggerItem>

          {/* Store Info Card */}
          <div className="grid gap-4 md:grid-cols-2">
            <StaggerItem variants={staggerItem}>
              <IOSCard>
                <IOSCardHeader icon={<Store className="h-5 w-5 text-primary" />} title="Sua Loja" description="Informações gerais" />
                <div className="p-4 pt-0 space-y-3">
                  <div className="ios-card p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Nome da Loja</p>
                    <p className="font-semibold truncate">{settings.storeName}</p>
                  </div>
                  
                  {topCategories.length > 0 && <div>
                      <p className="text-xs text-muted-foreground mb-2">Categorias Populares</p>
                      <div className="flex flex-wrap gap-2">
                        {topCategories.map(([category, count]) => <Badge key={category} variant="secondary" className="rounded-lg px-3 py-1">
                            {category} ({count})
                          </Badge>)}
                      </div>
                    </div>}
                </div>
              </IOSCard>
            </StaggerItem>
          </div>
        </StaggerContainer>
      </PageTransition>
    </AdminLayout>;
};
export default Dashboard;
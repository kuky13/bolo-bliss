import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, ArrowRight, Home, User, LogOut, Settings, Gamepad2, LayoutDashboard, Package2, Candy, CreditCard, ChevronRight, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useValeDoce } from "@/context/ValeDoceContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import ValeDoceBalanceBadge from "@/components/ui/ValeDoceBalanceBadge";
const Header = memo(() => {
  const {
    totalItems
  } = useCart();
  const {
    settings
  } = useStore();
  const {
    isAuthenticated,
    isAdmin,
    logout
  } = useAuth();
  const {
    currentAffiliate,
    balance
  } = useValeDoce();
  const isMobile = useIsMobile();
  const isWelcomeVisible = useScrollDirection();
  const handleLogout = async () => {
    await logout();
  };

  // Check if user is an affiliate (has affiliate account but not admin)
  const isAffiliate = currentAffiliate && !isAdmin;
  return <header className="sticky top-0 z-50 animate-fade-in ios-blur border-b border-border/50">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and store name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center touch-feedback">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {settings.storeName}
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Home */}
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-1.5" />
              Início
            </Button>
          </Link>

          {/* Admin - only for admins */}
          {isAuthenticated && isAdmin && <>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  <LayoutDashboard className="h-4 w-4 mr-1.5" />
                  Admin
                </Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Package2 className="h-4 w-4 mr-1.5" />
                  Produtos
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4 mr-1.5" />
                  Configurações
                </Button>
              </Link>
            </>}

          {/* Affiliate - only for affiliates */}
          {isAffiliate && <>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Link to="/y/creditos">
                <Button variant="ghost" size="sm" className="text-pink-500 hover:text-pink-400">
                  
                  Créditos
                </Button>
              </Link>
              <ValeDoceBalanceBadge variant="compact" showLink={false} />
            </>}

          <Separator orientation="vertical" className="h-5 mx-2" />

          {/* Login/Logout */}
          {isAuthenticated ? <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 mr-1.5" />
              Sair
            </Button> : <Link to="/login">
              <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5">
                <User className="h-4 w-4 mr-1.5" />
                Entrar
              </Button>
            </Link>}
        </nav>

        {/* Cart and mobile menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile checkout shortcut */}
          {isMobile && totalItems > 0 && <Link to="/cart" className="touch-feedback">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 animate-spring-in">
                <span className="text-xs font-semibold">Ver</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>}

          {/* Cart icon with counter */}
          <div className="relative">
            <Link to="/cart" className="relative touch-feedback group">
              <div className="p-2.5 rounded-xl bg-secondary/80 group-hover:bg-secondary transition-colors duration-200">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              {totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg animate-spring-in">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>}
            </Link>
            
            {/* Desktop checkout button */}
            {totalItems > 0 && !isMobile && <Link to="/cart" className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 transition-transform duration-200">
                  <span className="text-sm font-semibold">Finalizar Compra</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>}
          </div>
          
          {/* Mobile menu */}
          {isMobile && <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted touch-feedback rounded-xl h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 ios-blur-strong border-l border-border/30" showCloseButton={false}>
                {/* iOS-style drag indicator */}
                <div className="pt-3 pb-2">
                  <div className="ios-indicator" />
                </div>

                {/* ValeDoce Balance Card for Affiliates */}
                {isAffiliate && balance > 0 && <div className="px-4 pb-4">
                    <ValeDoceBalanceBadge variant="expanded" />
                  </div>}

                {/* Navigation menu */}
                <nav className="flex flex-col">
                  {/* Home */}
                  <SheetClose asChild>
                    <Link to="/" className="ios-list-item">
                      <div className="p-2 rounded-lg bg-muted">
                        <Home className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 font-medium">Início</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </Link>
                  </SheetClose>
                  
                  {/* Cart */}
                  <SheetClose asChild>
                    <Link to="/cart" className="ios-list-item">
                      <div className="p-2 rounded-lg bg-muted">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 font-medium">Carrinho</span>
                      {totalItems > 0 && <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          {totalItems}
                        </span>}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </Link>
                  </SheetClose>

                  <Separator className="my-2" />
                  
                  {/* Role-based sections */}
                  {isAuthenticated && isAdmin && <>
                      {/* Admin Section Header */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Administração
                        </p>
                      </div>

                      <SheetClose asChild>
                        <Link to="/admin" className="ios-list-item">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <LayoutDashboard className="h-5 w-5 text-primary" />
                          </div>
                          <span className="flex-1 font-medium text-primary">Dashboard</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link to="/admin/products" className="ios-list-item">
                          <div className="p-2 rounded-lg bg-muted">
                            <Package2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="flex-1 font-medium">Produtos</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link to="/admin/valedoce" className="ios-list-item">
                          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                            <Candy className="h-5 w-5 text-pink-500" />
                          </div>
                          <span className="flex-1 font-medium">ValeDoce</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link to="/admin/settings" className="ios-list-item">
                          <div className="p-2 rounded-lg bg-muted">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="flex-1 font-medium">Configurações</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Link>
                      </SheetClose>
                      
                      {/* Easter egg */}
                      <SheetClose asChild>
                        <Link to="/easteregg" className="ios-list-item opacity-60">
                          <div className="p-2 rounded-lg bg-muted">
                            <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="flex-1 text-sm">Easter Egg</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Link>
                      </SheetClose>

                      <Separator className="my-2" />
                    </>}

                  {/* Affiliate Section */}
                  {isAffiliate && <>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Afiliado
                        </p>
                      </div>

                      <SheetClose asChild>
                        <Link to="/y/creditos" className="ios-list-item">
                          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                            <CreditCard className="h-5 w-5 text-pink-500" />
                          </div>
                          <span className="flex-1 font-medium">Meus Créditos</span>
                          <ValeDoceBalanceBadge variant="compact" showLink={false} />
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link to="/y/settings" className="ios-list-item">
                          <div className="p-2 rounded-lg bg-muted">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="flex-1 font-medium">Configurações</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Link>
                      </SheetClose>

                      <Separator className="my-2" />
                    </>}
                  
                  {/* Authentication section */}
                  {isAuthenticated ? <button onClick={handleLogout} className="ios-list-item text-destructive">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <LogOut className="h-5 w-5 text-destructive" />
                      </div>
                      <span className="flex-1 font-medium text-left">Sair</span>
                    </button> : <SheetClose asChild>
                      <Link to="/login" className="ios-list-item">
                        <div className="p-2 rounded-lg bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="flex-1 font-medium">Entrar</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </Link>
                    </SheetClose>}
                </nav>
                
                {/* Social media footer */}
                {settings.socialMedia && <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 safe-area-pb">
                    <div className="flex justify-center gap-4">
                      {settings.socialMedia.instagram && <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors touch-feedback">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                          </svg>
                        </a>}
                      {settings.socialMedia.whatsapp && <a href={settings.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors touch-feedback">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                        </a>}
                    </div>
                  </div>}
              </SheetContent>
            </Sheet>}
        </div>
      </div>

      {/* Welcome message */}
      {settings.welcomeMessage && <div className={`w-full overflow-hidden bg-secondary/50 border-t border-border/30 transition-all duration-300 ease-out ${isWelcomeVisible ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
          <div className="w-full px-4 py-2">
            <div className="flex items-center justify-center gap-2 text-center">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse hidden sm:block" />
              <p className="text-xs font-medium text-foreground/80 truncate">
                {settings.welcomeMessage}
              </p>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse hidden sm:block" />
            </div>
          </div>
        </div>}
    </header>;
});
Header.displayName = "Header";
export default Header;
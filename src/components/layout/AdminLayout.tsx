import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package2, Settings, LogOut, ChevronLeft, Menu, X, Store, Candy, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useStore } from "@/context/StoreContext";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout } = useAuth();
  const { settings } = useStore();
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pedidos", href: "/admin/orders", icon: ClipboardList },
    { name: "Produtos", href: "/admin/products", icon: Package2 },
    { name: "ValeDoce", href: "/admin/valedoce", icon: Candy },
    { name: "Configurações", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Componente de navegação reutilizável para sidebar
  const NavItem = ({ item, mobile = false }: { item: typeof navigationItems[0]; mobile?: boolean }) => (
    <Link
      to={item.href}
      className={cn(
        "flex items-center rounded-2xl px-4 transition-all duration-300",
        mobile ? "py-3.5" : "py-2.5",
        "text-sm font-medium",
        isActive(item.href) 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-foreground/80 hover:bg-muted/80 active:scale-[0.98]"
      )}
    >
      <item.icon className={cn(mobile ? "mr-3 h-5 w-5" : "mr-3 h-4 w-4")} />
      {item.name}
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Glassmorphism style */}
      {!isMobile && (
        <div className="hidden w-72 flex-shrink-0 border-r bg-card/80 backdrop-blur-xl md:block">
          <div className="flex h-16 items-center justify-center border-b px-6">
            <h2 className="text-lg font-bold text-primary truncate">{settings.storeName}</h2>
          </div>
          <nav className="flex flex-col p-4 gap-1.5">
            {navigationItems.map((item, index) => (
              <div 
                key={item.name} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NavItem item={item} />
              </div>
            ))}
            
            <div className="border-t my-4" />
            
            <Link
              to="/"
              className="flex items-center rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-all duration-300"
            >
              <ChevronLeft className="mr-3 h-4 w-4" />
              Voltar para Loja
            </Link>
            
            <button
              onClick={() => logout()}
              className="mt-2 flex w-full items-center rounded-2xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-300 active:scale-[0.98]"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        {/* Header - Glassmorphism */}
        <header className="flex h-14 items-center justify-between border-b bg-card/80 backdrop-blur-xl px-4 sticky top-0 z-40">
          <div className="flex items-center min-w-0 flex-1">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-3 h-10 w-10 rounded-xl touch-feedback">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 bg-card/95 backdrop-blur-xl">
                  <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-lg font-bold text-primary truncate pr-2">
                      {settings.storeName}
                    </h2>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  <div className="flex flex-col p-4 gap-1.5">
                    {navigationItems.map((item, index) => (
                      <SheetClose key={item.name} asChild>
                        <div 
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <NavItem item={item} mobile />
                        </div>
                      </SheetClose>
                    ))}
                    
                    <div className="border-t pt-4 mt-4 space-y-1.5">
                      <SheetClose asChild>
                        <Link
                          to="/"
                          className="flex items-center rounded-2xl px-4 py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-all duration-300"
                        >
                          <Store className="mr-3 h-5 w-5" />
                          Ver Loja
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <button
                          onClick={() => logout()}
                          className="flex w-full items-center rounded-2xl px-4 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-300"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Sair da Conta
                        </button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
          </div>
          
          {/* Mobile quick access to store */}
          {isMobile && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl touch-feedback">
                <Store className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation - iOS Style */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 border-t bg-card/90 backdrop-blur-xl px-2 py-2 safe-area-pb z-50">
            <div className="flex justify-around items-center max-w-md mx-auto">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex flex-col items-center px-4 py-1.5 rounded-2xl transition-all duration-300 min-w-[72px]",
                      "active:scale-95"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300",
                      active ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium mt-1 transition-colors duration-300",
                      active ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;

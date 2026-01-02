
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Home, ShoppingCart, User, Lock, Settings, LogOut, Gamepad2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Using memo to prevent unnecessary re-renders
const MobileMenu = memo(() => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <User className="h-5 w-5 text-store-pink" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="glass-morphism w-[250px] pt-10"
      >
        <nav className="flex flex-col gap-4">
          <SheetClose asChild>
            <Link to="/" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors">
              <Home className="w-5 h-5 text-store-pink" />
              <span className="text-gray-800">Início</span>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link to="/cart" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-store-pink" />
              <span className="text-gray-800">Carrinho</span>
            </Link>
          </SheetClose>
          
          {isAuthenticated ? (
            <>
              <Separator className="my-2" />
              
              {isAdmin && (
                <>
                  <SheetClose asChild>
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-store-pink hover:bg-gray-100 transition-colors"
                    >
                      <Lock className="w-5 h-5" />
                      <span>Área Administrativa</span>
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link 
                      to="/admin/settings" 
                      className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-store-pink" />
                      <span className="text-gray-800">Configurações</span>
                    </Link>
                  </SheetClose>
                  
                  {/* Easter egg link após o botão de admin */}
                  <SheetClose asChild>
                    <Link 
                      to="/easteregg" 
                      className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors text-xs text-gray-500"
                    >
                      <Gamepad2 className="w-4 h-4 text-gray-400" />
                      <span>Easter Egg</span>
                    </Link>
                  </SheetClose>
                </>
              )}
              
              <Button
                variant="ghost"
                className="flex justify-start items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-gray-800 font-normal">Sair</span>
              </Button>
            </>
          ) : (
            <SheetClose asChild>
              <Link 
                to="/login" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-store-pink" />
                <span className="text-gray-800">Entrar</span>
              </Link>
            </SheetClose>
          )}
        </nav>
        
        {settings.socialMedia && (
          <div className="mt-auto pt-6">
            <Separator className="mb-4" />
            <div className="flex justify-center space-x-4">
              {settings.socialMedia.instagram && (
                <a 
                  href={settings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-store-pink transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings.socialMedia.whatsapp && (
                <a 
                  href={settings.socialMedia.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
});

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;

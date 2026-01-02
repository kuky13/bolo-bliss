import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, User, Settings, LayoutDashboard, Candy } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useValeDoce } from "@/context/ValeDoceContext";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive, badge }) => (
  <Link
    to={to}
    className={cn(
      "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[60px] relative touch-feedback",
      isActive ? "text-primary" : "text-muted-foreground"
    )}
  >
    <div className="relative">
      <Icon className={cn("h-5 w-5 transition-all duration-200", isActive && "scale-110")} />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-spring-in">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
    <span className={cn(
      "text-[10px] font-medium transition-all duration-200",
      isActive && "font-semibold"
    )}>
      {label}
    </span>
    {isActive && (
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
    )}
  </Link>
);

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { currentAffiliate, balance } = useValeDoce();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const items = [
      { to: "/", icon: Home, label: "Início" },
      { to: "/cart", icon: ShoppingCart, label: "Carrinho", badge: totalItems },
    ];

    if (isAuthenticated && isAdmin) {
      items.push({ to: "/admin", icon: LayoutDashboard, label: "Admin" });
    } else if (currentAffiliate) {
      items.push({ 
        to: "/y/creditos", 
        icon: Candy, 
        label: `${balance}`, 
        badge: undefined 
      });
    }

    if (isAuthenticated) {
      items.push({ 
        to: isAdmin ? "/admin/settings" : "/y/settings", 
        icon: Settings, 
        label: "Config" 
      });
    } else {
      items.push({ to: "/login", icon: User, label: "Entrar" });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 ios-blur safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.to)}
            badge={item.badge}
          />
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

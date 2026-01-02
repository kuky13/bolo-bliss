import React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label?: string;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  pulse?: boolean;
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ 
    icon = <Plus className="h-6 w-6" />, 
    label, 
    variant = "primary", 
    size = "lg",
    pulse = false,
    className, 
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
      secondary: "bg-card text-foreground border border-border hover:bg-muted shadow-ios-lg"
    };

    const sizes = {
      md: "h-12 w-12",
      lg: "h-14 w-14"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "fixed bottom-24 right-4 z-40 rounded-full flex items-center justify-center",
          "transition-all duration-200 touch-feedback",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          sizes[size],
          pulse && "animate-pulse",
          label && "px-5 w-auto gap-2",
          className
        )}
        {...props}
      >
        {icon}
        {label && <span className="font-medium text-sm">{label}</span>}
      </button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export default FloatingActionButton;

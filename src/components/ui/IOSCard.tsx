import React from "react";
import { cn } from "@/lib/utils";

interface IOSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "gradient";
  padding?: "none" | "xs" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const IOSCard = React.forwardRef<HTMLDivElement, IOSCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "ios-card",
      elevated: "ios-card-elevated shadow-ios-lg",
      flat: "bg-muted/50 rounded-2xl",
      gradient: "bg-gradient-to-br from-card to-muted/50 rounded-2xl border border-border/30 shadow-ios"
    };

    const paddings = {
      none: "",
      xs: "p-2",
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          paddings[padding],
          "transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

IOSCard.displayName = "IOSCard";

interface IOSCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const IOSCardHeader: React.FC<IOSCardHeaderProps> = ({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) => (
  <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2 rounded-xl bg-primary/10">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

interface IOSListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  chevron?: boolean;
  destructive?: boolean;
}

const IOSListItem = React.forwardRef<HTMLDivElement, IOSListItemProps>(
  ({ icon, title, subtitle, value, chevron, destructive, className, onClick, ...props }, ref) => (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "ios-list-item cursor-pointer",
        destructive && "text-destructive",
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn(
          "p-2 rounded-lg",
          destructive ? "bg-destructive/10" : "bg-muted"
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", destructive && "text-destructive")}>{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {value && <div className="text-sm text-muted-foreground">{value}</div>}
      {chevron && (
        <svg className="h-4 w-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  )
);

IOSListItem.displayName = "IOSListItem";

export { IOSCard, IOSCardHeader, IOSListItem };

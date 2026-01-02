import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IOSStatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  delay?: number;
}

const IOSStatCard: React.FC<IOSStatCardProps> = ({
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  title,
  value,
  subtitle,
  className,
  delay = 0,
}) => {
  return (
    <div
      className={cn(
        "ios-card p-4 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <div className={cn("p-2 rounded-xl", iconBgColor)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>
      
      <p className={cn("text-2xl font-bold", iconColor === "text-primary" ? "" : iconColor)}>
        {value}
      </p>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default IOSStatCard;

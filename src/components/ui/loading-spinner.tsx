
import React from "react";
import { cn } from "@/lib/utils";
import GhostLoader from "./ghost-loader";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
    className?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner = ({
    size = 24,
    className,
    fullScreen = false,
    ...props
}: LoadingSpinnerProps) => {
    // Mapear size numérico para tamanhos do GhostLoader
    const getGhostSize = (size: number): 'small' | 'medium' | 'large' => {
        if (size <= 20) return 'small';
        if (size <= 40) return 'medium';
        return 'large';
    };

    const ghostSize = getGhostSize(size);

    return (
        <div className={cn(fullScreen ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50" : "flex items-center justify-center", className)} {...props}>
            <GhostLoader 
                fullScreen={false} 
                size={ghostSize}
            />
        </div>
    );
};

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="group overflow-hidden border-border/50 transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-4">
          <Skeleton className="h-full w-full" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          
          <div>
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const SearchSkeleton: React.FC = () => {
  return (
    <div className="mb-4 sm:mb-6">
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
};

export const CategoryFilterSkeleton: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
};
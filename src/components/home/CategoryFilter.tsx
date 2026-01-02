
import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = memo(({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const handleCategoryClick = useCallback((category: string) => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  if (categories.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6 -mx-1 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className={`whitespace-nowrap text-xs px-3 h-8 ${
          selectedCategory === null ? "shadow-md bg-store-pink" : ""
        }`}
      >
        Todos
      </Button>
      {categories.map(category => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryClick(category)}
          className={`whitespace-nowrap text-xs px-3 h-8 ${
            selectedCategory === category ? "shadow-md bg-store-pink" : ""
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;

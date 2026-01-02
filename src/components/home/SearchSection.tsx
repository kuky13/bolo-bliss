
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Pesquisar produtos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full shadow-md hover:shadow-lg transition-shadow text-sm h-10"
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => onSearchChange("")}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchSection;

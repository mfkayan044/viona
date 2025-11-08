import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 border border-neutral-300 focus:border-black focus:outline-none transition-colors duration-300 text-sm tracking-wide"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-neutral-100 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

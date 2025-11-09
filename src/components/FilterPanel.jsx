import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange, products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    price: false,
    color: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      category: section === 'category' ? !prev.category : false,
      price: section === 'price' ? !prev.price : false,
      color: section === 'color' ? !prev.color : false
    }));
  };

  // Ürünlerden kategorileri ve renkleri otomatik çıkar
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];

  const priceRanges = [
    { label: 'Tümü', min: 0, max: Infinity },
    { label: '0 - 1000 ₺', min: 0, max: 1000 },
    { label: '1000 - 2000 ₺', min: 1000, max: 2000 },
    { label: '2000 - 3000 ₺', min: 2000, max: 3000 },
    { label: '3000+ ₺', min: 3000, max: Infinity }
  ];

  return (
    <div className="mb-8">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 border border-neutral-300 hover:bg-neutral-50 transition-colors mb-4"
      >
        <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4" />
          Filtreler
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kategori Filtresi */}
          {categories.length > 0 && (
            <div className="border border-neutral-200 p-4">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-sm uppercase tracking-wider font-medium">Kategori</h3>
                {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expandedSections.category && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 -mx-2 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category}
                      onChange={() => onFilterChange('category', null)}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">Tümü</span>
                  </label>
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 -mx-2 transition-colors">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category}
                        onChange={() => onFilterChange('category', category)}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fiyat Filtresi */}
          <div className="border border-neutral-200 p-4">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm uppercase tracking-wider font-medium">Fiyat Aralığı</h3>
              {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {expandedSections.price && (
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 -mx-2 transition-colors">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.priceMin === range.min && filters.priceMax === range.max}
                      onChange={() => onFilterChange('price', { min: range.min, max: range.max })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Renk Filtresi */}
          {colors.length > 0 && (
            <div className="border border-neutral-200 p-4">
              <button
                onClick={() => toggleSection('color')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-sm uppercase tracking-wider font-medium">Renk</h3>
                {expandedSections.color ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expandedSections.color && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 -mx-2 transition-colors">
                    <input
                      type="radio"
                      name="color"
                      checked={!filters.color}
                      onChange={() => onFilterChange('color', null)}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">Tümü</span>
                  </label>
                  {colors.map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 -mx-2 transition-colors">
                      <input
                        type="radio"
                        name="color"
                        checked={filters.color === color}
                        onChange={() => onFilterChange('color', color)}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm capitalize">{color}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Filters & Clear */}
        {(filters.category || filters.color || filters.priceMin > 0 || filters.priceMax < Infinity) && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs">
                  {filters.category}
                  <button onClick={() => onFilterChange('category', null)} className="hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.color && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs capitalize">
                  {filters.color}
                  <button onClick={() => onFilterChange('color', null)} className="hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.priceMin > 0 || filters.priceMax < Infinity) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs">
                  {filters.priceMin}-{filters.priceMax === Infinity ? '+' : filters.priceMax} ₺
                  <button onClick={() => onFilterChange('price', { min: 0, max: Infinity })} className="hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => onFilterChange('clear')}
              className="text-xs uppercase tracking-wider hover:underline"
            >
              Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;

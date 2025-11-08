import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparison } from '../contexts/ComparisonContext';
import { X, ArrowRight } from 'lucide-react';

const ComparisonBar = () => {
  const navigate = useNavigate();
  const { comparisonList, removeFromComparison, clearComparison, comparisonCount } = useComparison();

  if (comparisonCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white z-40 shadow-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-light text-lg uppercase tracking-wider">
              Karşılaştırma ({comparisonCount}/4)
            </h3>
            
            <div className="flex items-center gap-3">
              {comparisonList.map(product => (
                <div key={product.id} className="relative group">
                  <div className="w-16 h-16 bg-neutral-800 rounded overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {/* Boş slotlar */}
              {[...Array(4 - comparisonCount)].map((_, index) => (
                <div key={`empty-${index}`} className="w-16 h-16 bg-neutral-800/50 rounded border-2 border-dashed border-neutral-600" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearComparison}
              className="text-sm text-neutral-400 hover:text-white transition uppercase tracking-wider"
            >
              Temizle
            </button>
            
            <button
              onClick={() => navigate('/compare')}
              disabled={comparisonCount < 2}
              className="bg-white text-black px-6 py-2 flex items-center gap-2 hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              Karşılaştır
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;

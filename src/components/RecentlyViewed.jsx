import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import { Clock } from 'lucide-react';

const RecentlyViewed = () => {
  const { recentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock size={24} className="text-neutral-600" />
          <h2 className="text-2xl font-light uppercase tracking-wider">
            Son Görüntülenen Ürünler
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {recentlyViewed.slice(0, 5).map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="group cursor-pointer bg-white border border-neutral-200 hover:border-black transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h3 className="font-light text-sm uppercase tracking-wider truncate">
                  {product.name}
                </h3>
                <p className="text-neutral-600 text-sm mt-1">
                  {product.price.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;

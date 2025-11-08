import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useReviews } from '../contexts/ReviewContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useFlashSale } from '../contexts/FlashSaleContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Star, Scale, Eye, Zap } from 'lucide-react';
import { ImageSkeleton } from './Skeletons';

const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { getAverageRating, getProductReviews } = useReviews();
  const { addToComparison, isInComparison } = useComparison();
  const { getProductFlashSale, getDiscountedPrice } = useFlashSale();
  const { formatPrice } = useCurrency();
  const [imageLoaded, setImageLoaded] = useState(false);

  const averageRating = parseFloat(getAverageRating(product.id));
  const reviewCount = getProductReviews(product.id).length;
  const inComparison = isInComparison(product.id);
  const flashSale = getProductFlashSale(product.id);
  const discountedPrice = flashSale ? getDiscountedPrice(product.id, product.price) : product.price;

  const handleNavigate = () => {
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Bu ürün stokta yok!');
      return;
    }
    onAddToCart(product);
    toast.success(`${product.name} sepete eklendi!`);
  };

  const handleAddToComparison = (e) => {
    e.stopPropagation();
    const result = addToComparison(product);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  return (
    <div className="group bg-white border border-neutral-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
      <div 
        onClick={handleNavigate}
        className="cursor-pointer"
      >
        {product.image && (
          <div className="relative overflow-hidden h-96">
            {!imageLoaded && <ImageSkeleton className="absolute inset-0" />}
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Badges Container */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {flashSale && (
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 text-xs uppercase tracking-widest font-bold flex items-center gap-1 animate-pulse">
                  <Zap size={14} fill="currentColor" />
                  %{flashSale.discount} İNDİRİM
                </div>
              )}
              
              {product.featured && (
                <div className="bg-amber-50 text-amber-900 px-3 py-1 text-xs uppercase tracking-widest animate-fade-in">
                  Featured
                </div>
              )}
              
              {/* Stok Uyarıları */}
              {product.stock === 0 ? (
                <div className="bg-red-500 text-white px-3 py-1 text-xs uppercase tracking-widest font-medium">
                  Tükendi
                </div>
              ) : product.stock <= 3 && product.stock > 0 && (
                <div className="bg-orange-500 text-white px-3 py-1 text-xs uppercase tracking-widest font-medium animate-pulse">
                  Son {product.stock} Ürün!
                </div>
              )}
            </div>

            {/* Comparison Button */}
            <button
              onClick={handleAddToComparison}
              className={`absolute top-4 left-4 p-2 rounded-full transition-all ${
                inComparison 
                  ? 'bg-black text-white' 
                  : 'bg-white/90 text-black hover:bg-black hover:text-white'
              }`}
              title="Karşılaştırmaya Ekle"
            >
              <Scale size={18} />
            </button>

            {/* Quick View Button */}
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white flex items-center gap-2"
              >
                <Eye size={16} />
                Hızlı Görünüm
              </button>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500"></div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 
          onClick={handleNavigate}
          className="text-lg font-light uppercase tracking-wider mb-2 group-hover:text-neutral-800 transition-colors duration-300 cursor-pointer"
        >
          {product.name}
        </h3>
        <p className="text-neutral-600 text-sm mb-2">
          {product.description}
        </p>
        
        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-neutral-500">({reviewCount} değerlendirme)</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            {flashSale ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-light line-through text-neutral-400">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-2xl font-semibold text-red-600 group-hover:scale-110 inline-block transition-transform duration-300">
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
                <p className="text-xs text-red-600 font-medium">
                  %{flashSale.discount} indirimli
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xl font-light group-hover:scale-110 inline-block transition-transform duration-300">
                  {formatPrice(product.price)}
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  Stock: {product.stock}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="border border-black px-6 py-2 hover:bg-black hover:text-white transition-all duration-300 text-sm uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {product.stock === 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

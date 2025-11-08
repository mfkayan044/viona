import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useApp();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  if (!isOpen || !product) return null;

  const productImages = product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : []);

  // Varyant desteği
  const availableColors = product.variants 
    ? [...new Set(product.variants.map(v => v.color))]
    : [];

  const availableSizes = product.variants && selectedColor
    ? product.variants.find(v => v.color === selectedColor)?.sizes || []
    : [];

  const getVariantPrice = () => {
    if (!product.variants || !selectedColor) return product.price;
    const variant = product.variants.find(v => v.color === selectedColor);
    return product.price + (variant?.priceModifier || 0);
  };

  const currentPrice = getVariantPrice();

  const handleAddToCart = () => {
    let productWithVariant = { ...product, price: currentPrice };
    
    if (selectedColor) {
      productWithVariant.selectedColor = selectedColor;
    }
    if (selectedSize) {
      productWithVariant.selectedSize = selectedSize;
    }

    addToCart(productWithVariant);
    toast.success('Ürün sepete eklendi');
  };

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Image Section */}
          <div className="relative">
            <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      idx === currentImageIndex ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-light uppercase tracking-wider mb-2">{product.name}</h2>
            <p className="text-3xl font-light mb-4">{currentPrice.toLocaleString('tr-TR')} ₺</p>

            {product.description && (
              <p className="text-neutral-600 text-sm mb-6">{product.description}</p>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Renk Seçin:</p>
                <div className="flex gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                      }}
                      className={`px-4 py-2 border rounded transition ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 hover:border-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Beden Seçin:</p>
                <div className="flex gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded transition ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-sm text-green-600">✓ Stokta ({product.stock} adet)</p>
              ) : (
                <p className="text-sm text-red-600">Stokta yok</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={20} />
                Sepete Ekle
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 border rounded transition ${
                  isInWishlist(product.id)
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-neutral-300 hover:border-black'
                }`}
              >
                <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>

            <button
              onClick={handleViewDetails}
              className="w-full btn-outline text-sm"
            >
              Detaylı İncele
            </button>

            {/* Category & Tags */}
            <div className="mt-6 pt-6 border-t space-y-2">
              {product.category && (
                <p className="text-sm text-neutral-600">
                  <span className="font-medium">Kategori:</span> {product.category}
                </p>
              )}
              {product.color && (
                <p className="text-sm text-neutral-600">
                  <span className="font-medium">Renk:</span> <span className="capitalize">{product.color}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

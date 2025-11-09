import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useToast } from '../contexts/ToastContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import { ChevronLeft, ChevronRight, ShoppingBag, Heart, Share2, Scale, Truck, RotateCcw, Shield, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import ImageMagnifier from '../components/ImageMagnifier';
import ProductReviews from '../components/ProductReviews';
import ComparisonBar from '../components/ComparisonBar';
import { ProductDetailSkeleton } from '../components/Skeletons';
import SEO from '../components/SEO';
import generateProductSchema from '../utils/schemaMarkup';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useApp();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToComparison, isInComparison } = useComparison();
  const toast = useToast();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [loading, setLoading] = useState(true);
  // Supabase UUID ile karşılaştırma (string olarak)
  const product = products.find(p => String(p.id) === String(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  // Ürün varyantları varsa renkleri al
  const availableColors = product?.variants?.map(v => v.color) || [product?.color].filter(Boolean);
  const availableSizes = product?.variants?.find(v => v.color === (selectedColor || product?.color))?.sizes || [];

  // Sayfa yüklendiğinde en üste kaydır ve ürünü recently viewed'a ekle
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    if (product) {
      addToRecentlyViewed(product);
    }

    return () => clearTimeout(timer);
  }, [id]); // Sadece id değiştiğinde tekrar çalış

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light mb-4">Ürün bulunamadı</h2>
          <button onClick={() => navigate('/')} className="btn-outline">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Use images array or fallback to single image
  const productImages = product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : []);

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  // Schema markup for SEO
  const productSchema = generateProductSchema(product);

  // Seçili varyanta göre fiyat hesapla
  const getVariantPrice = () => {
    if (!product.variants) return product.price;
    
    const variant = product.variants.find(v => v.color === (selectedColor || product.color));
    if (variant && variant.priceModifier) {
      return product.price + variant.priceModifier;
    }
    return product.price;
  };

  const currentPrice = getVariantPrice();

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Bu ürün stokta yok!');
      return;
    }
    if (product.stock < quantity) {
      toast.warning(`Stokta sadece ${product.stock} adet var!`);
      return;
    }
    
    // Varyant bilgisini sepete ekle
    const productWithVariant = {
      ...product,
      price: currentPrice,
      selectedColor: selectedColor || product.color,
      selectedSize: selectedSize
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithVariant);
    }
    
    const variantInfo = selectedColor || selectedSize 
      ? ` (${[selectedColor, selectedSize].filter(Boolean).join(', ')})`
      : '';
    toast.success(`${quantity} adet ${product.name}${variantInfo} sepete eklendi!`);
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    if (isInWishlist(product.id)) {
      toast.info('Favorilerden kaldırıldı');
    } else {
      toast.wishlist('Favorilere eklendi ❤️');
    }
  };

  const handleAddToComparison = () => {
    const result = addToComparison(product);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).then(() => {
        toast.success('Paylaşıldı!');
      });
    } else {
      setShowShareModal(true);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={product.name}
        description={product.description}
        keywords={`${product.name}, ${product.category}, el yapımı çanta, boncuklu çanta`}
        image={product.image}
        type="product"
        url={window.location.href}
      />
      
      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>

      <Header />
      <Cart />

      {loading ? (
        <ProductDetailSkeleton />
      ) : (
        <div>
          {/* Breadcrumb */}
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <button onClick={() => navigate('/')} className="hover:text-black transition">
                Ana Sayfa
              </button>
              <span>/</span>
              <button onClick={() => navigate('/#products')} className="hover:text-black transition">
                Koleksiyon
              </button>
              <span>/</span>
              <span className="text-black">{product.name}</span>
            </div>
          </div>

          {/* Product Section */}
          <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div className="relative bg-neutral-50 aspect-square overflow-hidden group">
              <ImageMagnifier
                src={productImages[currentImageIndex]}
                alt={product.name}
                magnifierSize={200}
                zoomLevel={2.5}
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 right-4 bg-amber-50 text-amber-900 px-4 py-2 text-xs uppercase tracking-widest z-20">
                  Featured
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square bg-neutral-50 overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-black' : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Price */}
            <div className="border-b border-neutral-200 pb-6">
              <h1 className="text-3xl font-light tracking-wider uppercase mb-4">{product.name}</h1>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-light">{currentPrice.toLocaleString('tr-TR')} ₺</div>
                  {currentPrice !== product.price && (
                    <div className="text-sm text-neutral-500 line-through">{product.price.toLocaleString('tr-TR')} ₺</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 border transition-all hover:scale-110 ${
                      isInWishlist(product.id) ? 'border-red-500 text-red-500' : 'border-neutral-300 hover:border-black'
                    }`}
                  >
                    <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleAddToComparison}
                    className={`p-2 border transition-all hover:scale-110 ${
                      isInComparison(product.id) ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
                    }`}
                    title="Karşılaştırmaya Ekle"
                  >
                    <Scale size={20} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 border border-neutral-300 hover:border-black transition-all hover:scale-110"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm uppercase tracking-widest mb-3 font-light">Ürün Açıklaması</h3>
              <p className="text-neutral-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="border-t border-b border-neutral-200 py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 uppercase tracking-wider">Stok Durumu</span>
                <span className={`font-medium ${
                  product.stock === 0 ? 'text-red-600' : 
                  product.stock <= 3 ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  {product.stock === 0 ? 'Tükendi' : 
                   product.stock <= 3 ? `⚠️ Son ${product.stock} Adet!` : 
                   `${product.stock} Adet Mevcut`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 uppercase tracking-wider">Ürün Kodu</span>
                <span className="font-mono">VN-{product.id.toString().substring(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-widest mb-3 font-light">Renk</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border transition-all ${
                        (selectedColor || product.color) === color
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
              <div>
                <h3 className="text-sm uppercase tracking-widest mb-3 font-light">Beden</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border transition-all ${
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

            {/* Quantity Selector */}
            <div>
              <h3 className="text-sm uppercase tracking-widest mb-3 font-light">Adet</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border border-neutral-300 hover:border-black transition flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-lg font-light w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-12 h-12 border border-neutral-300 hover:border-black transition flex items-center justify-center disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-black text-white py-4 hover:bg-neutral-800 transition-all duration-300 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
              {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </button>

            {/* Services */}
            <div className="space-y-4 pt-6 border-t border-neutral-200">
              <div className="flex items-start gap-4">
                <Truck size={24} className="text-neutral-400 flex-shrink-0" />
                <div>
                  <h4 className="font-light uppercase tracking-wider text-sm mb-1">Ücretsiz Kargo</h4>
                  <p className="text-xs text-neutral-600">500 ₺ ve üzeri alışverişlerde</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <RotateCcw size={24} className="text-neutral-400 flex-shrink-0" />
                <div>
                  <h4 className="font-light uppercase tracking-wider text-sm mb-1">Kolay İade</h4>
                  <p className="text-xs text-neutral-600">14 gün içinde ücretsiz iade</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield size={24} className="text-neutral-400 flex-shrink-0" />
                <div>
                  <h4 className="font-light uppercase tracking-wider text-sm mb-1">Güvenli Ödeme</h4>
                  <p className="text-xs text-neutral-600">SSL sertifikalı güvenli alışveriş</p>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>

          {/* Product Reviews */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
          <div className="container mx-auto px-6 mt-24">
            <h2 className="text-3xl font-light text-center mb-12 uppercase tracking-wider">
              Benzer Ürünler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relatedProduct => (
                <button
                  key={relatedProduct.id}
                  onClick={() => {
                    navigate(`/product/${relatedProduct.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="group text-left"
                >
                  <div className="aspect-square bg-neutral-50 overflow-hidden mb-4">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-light uppercase tracking-wider text-sm mb-2 group-hover:text-neutral-600 transition">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-lg font-light">{relatedProduct.price.toLocaleString('tr-TR')} ₺</p>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light uppercase tracking-wider">Paylaş</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={window.location.href}
              readOnly
              className="input-field mb-4"
              onClick={e => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link kopyalandı!');
                setShowShareModal(false);
              }}
              className="btn-primary w-full"
            >
              Linki Kopyala
            </button>
          </div>
        </div>
      )}

      {/* Comparison Bar */}
      <ComparisonBar />

      <Footer />
    </div>
  );
};

export default ProductDetail;

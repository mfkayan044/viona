import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import ComparisonBar from '../components/ComparisonBar';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useApp();
  const toast = useToast();

  // Sayfa yüklendiğinde en üste kaydır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Bu ürün stokta yok!');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} sepete eklendi!`);
  };

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    toast.info(`${product.name} favorilerden kaldırıldı`);
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm favorileri temizlemek istediğinize emin misiniz?')) {
      clearWishlist();
      toast.success('Favoriler temizlendi');
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <Cart />
        
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="w-24 h-24 mx-auto mb-6 text-neutral-300" />
            <h1 className="text-3xl font-light mb-4 uppercase tracking-wider">
              Favorileriniz Boş
            </h1>
            <p className="text-neutral-600 mb-8 font-light">
              Beğendiğiniz ürünleri favorilere ekleyerek daha sonra inceleyebilirsiniz.
            </p>
            <button
              onClick={() => navigate('/#products')}
              className="inline-block border border-black px-10 py-4 hover:bg-black hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
            >
              Ürünlere Göz Atın
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <Cart />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light uppercase tracking-wider mb-2">
              Favorilerim
            </h1>
            <p className="text-neutral-600">
              {wishlist.length} ürün listenizde
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              Tümünü Temizle
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-500"
            >
              {/* Image */}
              <div 
                onClick={() => {
                  navigate(`/product/${product.id}`);
                  window.scrollTo(0, 0);
                }}
                className="relative overflow-hidden h-80 cursor-pointer"
              >
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(product);
                  }}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white px-6 py-3 text-sm uppercase tracking-widest">
                      Stokta Yok
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="text-base font-light uppercase tracking-wider mb-2 cursor-pointer hover:text-neutral-600 transition-colors line-clamp-1"
                >
                  {product.name}
                </h3>
                
                <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-light">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </span>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex items-center gap-2 border border-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Bar */}
      <ComparisonBar />
      
      <Footer />
    </div>
  );
};

export default WishlistPage;

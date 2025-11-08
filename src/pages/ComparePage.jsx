import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparison } from '../contexts/ComparisonContext';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { useReviews } from '../contexts/ReviewContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { X, ShoppingBag, Star, Check, Minus } from 'lucide-react';

const ComparePage = () => {
  const navigate = useNavigate();
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useApp();
  const toast = useToast();
  const { getAverageRating } = useReviews();

  if (comparisonList.length < 2) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-light mb-6 uppercase tracking-wider">Karşılaştırma</h1>
          <p className="text-neutral-600 mb-8">Karşılaştırmak için en az 2 ürün ekleyin.</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn-primary"
          >
            Alışverişe Devam Et
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Bu ürün stokta yok!');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} sepete eklendi!`);
  };

  // Karşılaştırma özellikleri
  const comparisonFeatures = [
    { key: 'image', label: 'Ürün', type: 'image' },
    { key: 'name', label: 'İsim', type: 'text' },
    { key: 'price', label: 'Fiyat', type: 'price', highlight: true },
    { key: 'rating', label: 'Değerlendirme', type: 'rating' },
    { key: 'stock', label: 'Stok', type: 'stock', highlight: true },
    { key: 'description', label: 'Açıklama', type: 'text' },
    { key: 'featured', label: 'Öne Çıkan', type: 'boolean' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-light uppercase tracking-wider">
            Ürün Karşılaştırma ({comparisonList.length})
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-neutral-600 hover:text-black transition uppercase tracking-wider"
            >
              Alışverişe Devam
            </button>
            <button
              onClick={clearComparison}
              className="btn-outline"
            >
              Tümünü Temizle
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={feature.key} className={index % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                  <td className="p-4 font-light uppercase tracking-wider text-sm text-neutral-600 w-48 sticky left-0 bg-inherit">
                    {feature.label}
                  </td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center relative">
                      {feature.type === 'image' && (
                        <div className="relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-64 object-cover rounded"
                          />
                          <button
                            onClick={() => removeFromComparison(product.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      
                      {feature.type === 'text' && (
                        <span className="text-neutral-800">
                          {product[feature.key]}
                        </span>
                      )}
                      
                      {feature.type === 'price' && (
                        <div className="space-y-2">
                          <div className={`text-2xl font-light ${
                            feature.highlight && product.price === Math.min(...comparisonList.map(p => p.price))
                              ? 'text-green-600 font-medium'
                              : ''
                          }`}>
                            {product.price.toLocaleString('tr-TR')} ₺
                          </div>
                          {feature.highlight && product.price === Math.min(...comparisonList.map(p => p.price)) && (
                            <div className="text-xs text-green-600 uppercase tracking-wider">
                              En Uygun Fiyat
                            </div>
                          )}
                        </div>
                      )}
                      
                      {feature.type === 'rating' && (
                        <div className="flex items-center justify-center gap-2">
                          <Star size={18} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-lg">
                            {getAverageRating(product.id) || 'Henüz değerlendirilmemiş'}
                          </span>
                        </div>
                      )}
                      
                      {feature.type === 'stock' && (
                        <div className="space-y-2">
                          <div className={`text-lg ${
                            product.stock === 0 
                              ? 'text-red-600' 
                              : product.stock <= 3 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                            {product.stock === 0 
                              ? 'Tükendi' 
                              : product.stock <= 3 
                              ? `Son ${product.stock} Adet!` 
                              : `${product.stock} Adet`}
                          </div>
                          {feature.highlight && product.stock === Math.max(...comparisonList.map(p => p.stock)) && product.stock > 0 && (
                            <div className="text-xs text-green-600 uppercase tracking-wider">
                              En Fazla Stok
                            </div>
                          )}
                        </div>
                      )}
                      
                      {feature.type === 'boolean' && (
                        <div className="flex justify-center">
                          {product[feature.key] ? (
                            <Check size={24} className="text-green-600" />
                          ) : (
                            <Minus size={24} className="text-neutral-300" />
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Add to Cart Row */}
              <tr className="bg-neutral-100">
                <td className="p-4"></td>
                {comparisonList.map(product => (
                  <td key={product.id} className="p-4">
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag size={18} />
                        {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-full btn-outline text-sm"
                      >
                        Detayları Gör
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ComparePage;

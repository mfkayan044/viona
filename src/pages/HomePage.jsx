import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import ProductCard from '../components/ProductCard';
import ScrollToTop from '../components/ScrollToTop';
import HeroBackground from '../components/HeroBackground';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import NewsletterPopup from '../components/NewsletterPopup';
import WhatsAppButton from '../components/WhatsAppButton';
import RecentlyViewed from '../components/RecentlyViewed';
import ComparisonBar from '../components/ComparisonBar';
import QuickViewModal from '../components/QuickViewModal';
import FlashSaleBanner from '../components/FlashSaleBanner';
import { ProductCardSkeleton } from '../components/Skeletons';
import { useApp } from '../contexts/AppContext';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { useInView } from '../hooks/useInView';
import SEO from '../components/SEO';
import { generateWebSiteSchema, generateOrganizationSchema } from '../utils/schemaMarkup';

const HomePage = () => {
  const { products, addToCart, siteSettings, heroGallery } = useApp();
  useSmoothScroll();

  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState({
    category: null,
    color: null,
    priceMin: 0,
    priceMax: Infinity
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Her section için ayrı ref
  const [productsRef, productsInView] = useInView();
  const [aboutRef, aboutInView] = useInView();
  const [contactRef, contactInView] = useInView();

  // Filter logic
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = !filters.category || product.category === filters.category;
      
      // Color filter
      const matchesColor = !filters.color || product.color === filters.color;
      
      // Price filter
      const matchesPrice = product.price >= filters.priceMin && product.price <= filters.priceMax;
      
      return matchesSearch && matchesCategory && matchesColor && matchesPrice;
    });

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        // 'default' - keep original order (featured first)
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return filtered;
  }, [products, searchTerm, filters, sortBy]);

  const handleFilterChange = (type, value) => {
    if (type === 'clear') {
      setFilters({
        category: null,
        color: null,
        priceMin: 0,
        priceMax: Infinity
      });
    } else if (type === 'category') {
      setFilters(prev => ({ ...prev, category: value }));
    } else if (type === 'color') {
      setFilters(prev => ({ ...prev, color: value }));
    } else if (type === 'price') {
      setFilters(prev => ({ ...prev, priceMin: value.min, priceMax: value.max }));
    }
  };

  // Schema markup for SEO
  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO pageKey="home" />
      
      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      <Header />
      <FlashSaleBanner />
      <Cart />
      <ScrollToTop />
      <NewsletterPopup />
      <WhatsAppButton />

      {/* Hero Section - Full Width */}
      <section id="home" className="relative w-full min-h-screen py-32 md:py-40 text-center">
        {/* Background Slider */}
        <HeroBackground images={heroGallery} />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6">
          <h2 className="text-6xl md:text-7xl font-light mb-6 tracking-wider uppercase animate-fade-in">
            Timeless<br />Elegance
          </h2>
          <p className="text-lg text-neutral-600 max-w-xl mx-auto mb-12 font-light tracking-wide animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Meticulously handcrafted beaded bags that blend traditional artistry with contemporary design
          </p>
          <a
            href="#products"
            className="inline-block border border-black px-10 py-4 hover:bg-black hover:text-white transition-all duration-300 text-sm uppercase tracking-widest hover:scale-105 active:scale-95 animate-fade-in shadow-lg hover:shadow-2xl"
            style={{ animationDelay: '0.4s' }}
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section 
        id="products" 
        ref={productsRef}
        className={`container mx-auto px-6 py-16 reveal ${productsInView ? 'active' : ''}`}
      >
        <h2 className="text-4xl font-light text-center mb-12 uppercase tracking-wider">
          The Collection
        </h2>
        
        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        {/* Filter Panel */}
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange}
          products={products}
        />
        
        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-sm text-neutral-600 tracking-wide">
            {filteredProducts.length} ürün bulundu
          </p>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600 uppercase tracking-wider">
              Sırala:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-neutral-300 px-4 py-2 text-sm focus:border-black focus:outline-none transition-colors cursor-pointer"
            >
              <option value="default">Önerilen</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="name-asc">İsim: A-Z</option>
              <option value="name-desc">İsim: Z-A</option>
              <option value="stock">Stok Durumu</option>
            </select>
          </div>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id}
                className="reveal-scale"
                style={{ 
                  transitionDelay: productsInView ? `${index * 0.1}s` : '0s',
                  opacity: productsInView ? 1 : 0,
                  transform: productsInView ? 'scale(1)' : 'scale(0.95)'
                }}
              >
                <ProductCard 
                  product={product} 
                  onAddToCart={addToCart}
                  onQuickView={setQuickViewProduct}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-neutral-500 mb-4">Ürün bulunamadı</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                handleFilterChange('clear');
              }}
              className="text-sm uppercase tracking-wider border border-black px-6 py-2 hover:bg-black hover:text-white transition-all duration-300"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </section>

      {/* About Section */}
      <section 
        id="about" 
        ref={aboutRef}
        className={`bg-white py-24 reveal ${aboutInView ? 'active' : ''}`}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-light mb-8 uppercase tracking-wider">About VIONA</h2>
            <p className="text-lg text-neutral-700 leading-relaxed font-light">
              {siteSettings.about}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        ref={contactRef}
        className={`container mx-auto px-6 py-24 reveal ${contactInView ? 'active' : ''}`}
      >
        <h2 className="text-4xl font-light text-center mb-16 uppercase tracking-wider">Contact</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className={`bg-white border border-neutral-200 p-8 reveal-left ${contactInView ? 'active' : ''}`}>
            <h3 className="text-2xl font-light mb-8 uppercase tracking-wider">Get In Touch</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Phone</p>
                <p className="font-light text-lg">{siteSettings.phone}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Email</p>
                <p className="font-light text-lg">{siteSettings.email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Instagram</p>
                <p className="font-light text-lg">{siteSettings.instagram}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Location</p>
                <p className="font-light text-lg">{siteSettings.address}</p>
              </div>
            </div>
          </div>
          
          <div className={`bg-black text-white p-8 reveal-right ${contactInView ? 'active' : ''}`}>
            <h3 className="text-2xl font-light mb-6 uppercase tracking-wider">Custom Design</h3>
            <p className="mb-8 font-light leading-relaxed">
              Create your dream bag with us. We offer bespoke designs tailored to your unique style and preferences.
            </p>
            <button className="border border-white px-8 py-3 hover:bg-white hover:text-black transition text-sm uppercase tracking-widest">
              Request Quote
            </button>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Comparison Bar */}
      <ComparisonBar />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
};

export default HomePage;

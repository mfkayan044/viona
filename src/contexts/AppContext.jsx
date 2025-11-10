import React, { createContext, useContext, useState, useEffect } from 'react';
import { productService, heroImageService, siteSettingsService, categoryService, colorService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kategori ve Renk Yönetimi - Supabase'den yüklenecek
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);

  const [siteSettings, setSiteSettings] = useState({
    siteName: 'VIONA',
    logo: '✨',
    slogan: 'Handcrafted Beaded Elegance',
    about: 'Her biri özenle, tek tek boncuk dizilerek hazırlanan benzersiz çantalar. Geleneksel el sanatlarını modern tasarımla buluşturuyoruz.',
    phone: '+90 555 123 45 67',
    email: 'info@viona.com',
    instagram: '@viona_bags',
    address: 'İstanbul, Türkiye'
  });

  // Hero Gallery - Supabase'den yüklenecek
  const [heroGallery, setHeroGallery] = useState([]);

  // Products - Sadece Supabase'den yüklenecek
  const [products, setProducts] = useState([]);

  // Supabase'den tüm verileri yükle
  useEffect(() => {
    loadSiteSettings();
    loadCategories();
    loadColors();
    loadHeroGallery();
    loadProducts();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const data = await siteSettingsService.get();
      
      if (data) {
        // Veritabanındaki field isimleri ile state'i güncelle
        setSiteSettings({
          siteName: data.site_name || 'VIONA',
          logo: data.logo || '✨',
          slogan: data.slogan || 'Handcrafted Beaded Elegance',
          about: data.about || '',
          phone: data.phone || '',
          email: data.email || '',
          instagram: data.instagram || '',
          address: data.address || ''
        });
        console.log('✅ Site ayarları Supabase\'den yüklendi');
      } else {
        console.log('ℹ️ Supabase\'de site ayarları yok, varsayılan kullanılıyor');
      }
    } catch (error) {
      console.error('❌ Site ayarları yüklenirken hata:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      
      if (data && data.length > 0) {
        // Sadece isimleri al (eski format ile uyumluluk için)
        const categoryNames = data.map(cat => cat.name);
        setCategories(categoryNames);
        console.log(`✅ ${data.length} kategori Supabase'den yüklendi`);
      } else {
        console.log('ℹ️ Supabase\'de kategori yok');
      }
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
    }
  };

  const loadColors = async () => {
    try {
      const data = await colorService.getAll();
      
      if (data && data.length > 0) {
        // Sadece isimleri al (eski format ile uyumluluk için)
        const colorNames = data.map(color => color.name.toLowerCase());
        setColors(colorNames);
        console.log(`✅ ${data.length} renk Supabase'den yüklendi`);
      } else {
        console.log('ℹ️ Supabase\'de renk yok');
      }
    } catch (error) {
      console.error('❌ Renkler yüklenirken hata:', error);
    }
  };

  const loadHeroGallery = async () => {
    try {
      const data = await heroImageService.getAll();
      
      if (data && data.length > 0) {
        const imageUrls = data.map(item => item.image_url);
        setHeroGallery(imageUrls);
        console.log(`✅ ${data.length} hero görsel Supabase'den yüklendi`);
      } else {
        // Fallback - Demo görseller
        console.log('ℹ️ Supabase\'de hero görsel yok, demo kullanılıyor');
        setHeroGallery([
          'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1920&q=80',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1920&q=80',
          'https://images.unsplash.com/photo-1564422167509-4f3a6833fb41?w=1920&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&q=80'
        ]);
      }
    } catch (error) {
      console.error('❌ Hero görseller yüklenirken hata:', error);
      // Fallback
      setHeroGallery([
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1920&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1920&q=80'
      ]);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      
      if (data && data.length > 0) {
        console.log(`✅ ${data.length} ürün Supabase'den yüklendi`);
        setProducts(data);
      } else {
        console.warn('⚠️ Supabase\'de ürün bulunamadı');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Ürünler yüklenirken hata:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Supabase'den ürünleri yükle
  useEffect(() => {
    console.log('🚀 AppContext useEffect ÇALIŞTI - Products Realtime başlatılıyor...');
    
    loadProducts();

    // ✅ Realtime ürün güncellemeleri (stok değişiklikleri için)
    const productsSubscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          console.log('🔔 Ürün güncellendi (stok):', payload);
          
          // Sadece güncellenen ürünü state'te güncelle (tüm listeyi yeniden yüklemek yerine)
          setProducts(prev => 
            prev.map(p => p.id === payload.new.id ? payload.new : p)
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Products Realtime:', status);
      });

    return () => {
      console.log('🔌 Products Realtime kapatılıyor');
      productsSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Supabase ile senkronize ürün yönetimi
  const addProduct = async (product) => {
    try {
      const newProduct = {
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        category: product.category,
        color: product.color || '',
        image: product.image || '',
        images: product.images || [], // ✅ Images array ekle
        stock: parseInt(product.stock) || 0,
        is_new: product.is_new || false,
        is_featured: product.is_featured || false
      };
      
      const created = await productService.create(newProduct);
      console.log('✅ Ürün Supabase\'e eklendi:', created);
      
      // State'i güncelle
      await loadProducts();
    } catch (error) {
      console.error('❌ Ürün eklenirken hata:', error);
      alert('Ürün eklenirken bir hata oluştu!');
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      // Sadece gönderilen alanları güncelle
      const updatePayload = {};
      
      if (updatedData.name !== undefined) updatePayload.name = updatedData.name;
      if (updatedData.description !== undefined) updatePayload.description = updatedData.description;
      if (updatedData.price !== undefined) updatePayload.price = parseFloat(updatedData.price);
      if (updatedData.category !== undefined) updatePayload.category = updatedData.category;
      if (updatedData.color !== undefined) updatePayload.color = updatedData.color;
      if (updatedData.image !== undefined) updatePayload.image = updatedData.image;
      if (updatedData.images !== undefined) updatePayload.images = updatedData.images; // ✅ Images array
      if (updatedData.stock !== undefined) updatePayload.stock = parseInt(updatedData.stock);
      if (updatedData.is_new !== undefined) updatePayload.is_new = updatedData.is_new;
      if (updatedData.is_featured !== undefined) updatePayload.is_featured = updatedData.is_featured;
      
      // featured ve is_featured aynı şey (eski/yeni isimlendirme)
      if (updatedData.featured !== undefined) updatePayload.is_featured = updatedData.featured;
      
      const updated = await productService.update(id, updatePayload);
      
      console.log('✅ Ürün güncellendi:', updated);
      
      // State'i güncelle
      await loadProducts();
    } catch (error) {
      console.error('❌ Ürün güncellenirken hata:', error);
      alert('Ürün güncellenirken bir hata oluştu!');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.delete(id);
      console.log('✅ Ürün Supabase\'den silindi');
      
      // State'i güncelle
      await loadProducts();
    } catch (error) {
      console.error('❌ Ürün silinirken hata:', error);
      alert('Ürün silinirken bir hata oluştu!');
    }
  };

  // Kategori yönetimi
  const addCategory = async (categoryName) => {
    try {
      if (!categoryName || categories.includes(categoryName)) {
        return;
      }
      
      // Supabase'e ekle
      await categoryService.create(categoryName);
      
      // State'i güncelle
      await loadCategories();
      
      console.log('✅ Kategori eklendi:', categoryName);
    } catch (error) {
      console.error('❌ Kategori eklenirken hata:', error);
      alert('Kategori eklenirken bir hata oluştu!');
    }
  };

  const deleteCategory = async (categoryName) => {
    try {
      // Kategoriyi Supabase'den bul ve sil
      const allCategories = await categoryService.getAll();
      const categoryToDelete = allCategories.find(cat => cat.name === categoryName);
      
      if (categoryToDelete) {
        await categoryService.delete(categoryToDelete.id);
        
        // State'i güncelle
        await loadCategories();
        
        console.log('✅ Kategori silindi:', categoryName);
      }
    } catch (error) {
      console.error('❌ Kategori silinirken hata:', error);
      alert('Kategori silinirken bir hata oluştu!');
    }
  };

  // Renk yönetimi
  const addColor = async (colorName) => {
    try {
      const lowerColorName = colorName.toLowerCase();
      
      if (!colorName || colors.includes(lowerColorName)) {
        return;
      }
      
      // Supabase'e ekle
      await colorService.create(colorName);
      
      // State'i güncelle
      await loadColors();
      
      console.log('✅ Renk eklendi:', colorName);
    } catch (error) {
      console.error('❌ Renk eklenirken hata:', error);
      alert('Renk eklenirken bir hata oluştu!');
    }
  };

  const deleteColor = async (colorName) => {
    try {
      // Rengi Supabase'den bul ve sil
      const allColors = await colorService.getAll();
      const colorToDelete = allColors.find(color => color.name.toLowerCase() === colorName.toLowerCase());
      
      if (colorToDelete) {
        await colorService.delete(colorToDelete.id);
        
        // State'i güncelle
        await loadColors();
        
        console.log('✅ Renk silindi:', colorName);
      }
    } catch (error) {
      console.error('❌ Renk silinirken hata:', error);
      alert('Renk silinirken bir hata oluştu!');
    }
  };

  const value = {
    loading,
    isAdmin,
    setIsAdmin,
    cart,
    setCart,
    showCart,
    setShowCart,
    siteSettings,
    setSiteSettings,
    heroGallery,
    setHeroGallery,
    products,
    setProducts,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getTotalPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    setCategories,
    addCategory,
    deleteCategory,
    colors,
    setColors,
    addColor,
    deleteColor
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // LocalStorage'dan yükle
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (error) {
        console.error('Recently viewed parse error:', error);
      }
    }
  }, []);

  // LocalStorage'a kaydet
  useEffect(() => {
    if (recentlyViewed.length > 0) {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  // Ürün ekle
  const addToRecentlyViewed = (product) => {
    if (!product || !product.id) return;

    setRecentlyViewed(prev => {
      // Aynı ürün varsa çıkar
      const filtered = prev.filter(p => p.id !== product.id);
      
      // Ürünü en başa ekle
      const updated = [product, ...filtered];
      
      // Maksimum 10 ürün tut
      return updated.slice(0, 10);
    });
  };

  // Temizle
  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  const value = {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

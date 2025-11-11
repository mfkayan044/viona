import React, { createContext, useContext, useState, useEffect } from 'react';

const FlashSaleContext = createContext();

export const useFlashSale = () => {
  const context = useContext(FlashSaleContext);
  if (!context) {
    throw new Error('useFlashSale must be used within FlashSaleProvider');
  }
  return context;
};

export const FlashSaleProvider = ({ children }) => {
  // Sabit bir kampanya bitiş tarihi (her zaman aynı tarih)
  const CAMPAIGN_END_DATE = '2025-12-31T23:59:59.999Z'; // 31 Aralık 2025
  
  const [flashSales, setFlashSales] = useState(() => {
    const saved = localStorage.getItem('flashSales');
    if (saved) {
      const parsedSales = JSON.parse(saved);
      // Eğer kayıtlı kampanya varsa ve geçerli bir bitiş tarihi varsa kullan
      if (parsedSales.length > 0 && parsedSales[0].endDate) {
        return parsedSales;
      }
    }
    
    // Default kampanya - Sabit tarih ile
    return [
      {
        id: 1,
        name: 'Kış İndirimi',
        discount: 30,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: CAMPAIGN_END_DATE,
        productIds: [1, 2],
        isActive: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('flashSales', JSON.stringify(flashSales));
  }, [flashSales]);

  const addFlashSale = (sale) => {
    const newSale = {
      id: Date.now(),
      ...sale,
      isActive: true
    };
    setFlashSales([...flashSales, newSale]);
  };

  const updateFlashSale = (id, updatedData) => {
    setFlashSales(flashSales.map(sale => 
      sale.id === id ? { ...sale, ...updatedData } : sale
    ));
  };

  const deleteFlashSale = (id) => {
    setFlashSales(flashSales.filter(sale => sale.id !== id));
  };

  const toggleFlashSale = (id) => {
    setFlashSales(flashSales.map(sale =>
      sale.id === id ? { ...sale, isActive: !sale.isActive } : sale
    ));
  };

  const getActiveFlashSales = () => {
    const now = new Date();
    return flashSales.filter(sale => {
      if (!sale.isActive) return false;
      const start = new Date(sale.startDate);
      const end = new Date(sale.endDate);
      return now >= start && now <= end;
    });
  };

  const getProductFlashSale = (productId) => {
    const activeSales = getActiveFlashSales();
    return activeSales.find(sale => sale.productIds.includes(productId));
  };

  const getDiscountedPrice = (productId, originalPrice) => {
    const sale = getProductFlashSale(productId);
    if (!sale) return originalPrice;
    return originalPrice * (1 - sale.discount / 100);
  };

  const value = {
    flashSales,
    addFlashSale,
    updateFlashSale,
    deleteFlashSale,
    toggleFlashSale,
    getActiveFlashSales,
    getProductFlashSale,
    getDiscountedPrice
  };

  return (
    <FlashSaleContext.Provider value={value}>
      {children}
    </FlashSaleContext.Provider>
  );
};

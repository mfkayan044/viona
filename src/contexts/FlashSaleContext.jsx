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
  const [flashSales, setFlashSales] = useState(() => {
    const saved = localStorage.getItem('flashSales');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: 'Kış İndirimi',
        discount: 30,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün sonra
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

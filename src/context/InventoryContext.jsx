import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useOrders } from '../contexts/OrderContext';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const { products } = useApp();
  const { orders } = useOrders();
  
  const [stockAlertThreshold, setStockAlertThreshold] = useState(() => {
    const saved = localStorage.getItem('stockAlertThreshold');
    return saved ? JSON.parse(saved) : 10;
  });

  const [criticalStockThreshold, setCriticalStockThreshold] = useState(() => {
    const saved = localStorage.getItem('criticalStockThreshold');
    return saved ? JSON.parse(saved) : 5;
  });

  const [stockAlerts, setStockAlerts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [criticalStockProducts, setCriticalStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);

  useEffect(() => {
    localStorage.setItem('stockAlertThreshold', JSON.stringify(stockAlertThreshold));
  }, [stockAlertThreshold]);

  useEffect(() => {
    localStorage.setItem('criticalStockThreshold', JSON.stringify(criticalStockThreshold));
  }, [criticalStockThreshold]);

  useEffect(() => {
    updateStockStatus();
  }, [products, stockAlertThreshold, criticalStockThreshold]);

  const updateStockStatus = () => {
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= stockAlertThreshold && p.stock > criticalStockThreshold);
    const criticalStock = products.filter(p => p.stock > 0 && p.stock <= criticalStockThreshold);
    const outOfStock = products.filter(p => p.stock === 0);

    setLowStockProducts(lowStock);
    setCriticalStockProducts(criticalStock);
    setOutOfStockProducts(outOfStock);

    // Uyarıları oluştur
    const alerts = [];
    
    if (outOfStock.length > 0) {
      alerts.push({
        id: 'out-of-stock',
        type: 'error',
        message: `${outOfStock.length} ürün stokta yok!`,
        products: outOfStock,
        timestamp: new Date()
      });
    }

    if (criticalStock.length > 0) {
      alerts.push({
        id: 'critical-stock',
        type: 'warning',
        message: `${criticalStock.length} ürün kritik stok seviyesinde!`,
        products: criticalStock,
        timestamp: new Date()
      });
    }

    if (lowStock.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'info',
        message: `${lowStock.length} ürün düşük stok seviyesinde`,
        products: lowStock,
        timestamp: new Date()
      });
    }

    setStockAlerts(alerts);
  };

  const getStockStatus = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'unknown';
    
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock <= criticalStockThreshold) return 'critical';
    if (product.stock <= stockAlertThreshold) return 'low';
    return 'normal';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'out-of-stock': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      case 'normal': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStockLabel = (status) => {
    switch (status) {
      case 'out-of-stock': return 'Stokta Yok';
      case 'critical': return 'Kritik Seviye';
      case 'low': return 'Düşük Stok';
      case 'normal': return 'Normal';
      default: return 'Bilinmiyor';
    }
  };

  // Satış trendine göre stok önerisi
  const getSuggestedRestock = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    // Son 30 gün satış verisi
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const productOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= last30Days && order.items?.some(item => item.productId === productId);
    });

    const totalSold = productOrders.reduce((sum, order) => {
      const item = order.items.find(i => i.productId === productId);
      return sum + (item?.quantity || 0);
    }, 0);

    // Günlük ortalama satış
    const dailyAverage = totalSold / 30;
    
    // 60 günlük önerilen stok (2 aylık)
    const suggestedStock = Math.ceil(dailyAverage * 60);
    
    return suggestedStock - product.stock;
  };

  const getInventoryValue = () => {
    return products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  };

  const value = {
    stockAlertThreshold,
    setStockAlertThreshold,
    criticalStockThreshold,
    setCriticalStockThreshold,
    stockAlerts,
    lowStockProducts,
    criticalStockProducts,
    outOfStockProducts,
    getStockStatus,
    getStockColor,
    getStockLabel,
    getSuggestedRestock,
    getInventoryValue,
    updateStockStatus
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

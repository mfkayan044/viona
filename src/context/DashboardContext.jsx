import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useOrders } from '../contexts/OrderContext';
import { analyticsService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const { products } = useApp();
  const { orders, loadOrders } = useOrders();
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Realtime subscriptions
  useEffect(() => {
    // Orders tablosundaki değişiklikleri dinle
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔔 Order değişikliği:', payload);
          loadOrders(); // Siparişleri yeniden yükle
          loadDashboardStats(); // İstatistikleri güncelle
        }
      )
      .subscribe();

    // Products tablosundaki değişiklikleri dinle
    const productsSubscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('🔔 Product değişikliği:', payload);
          // AppContext'in loadProducts'ı tetikle (global refresh için)
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadDashboardStats();
    calculateSalesData();
    calculateTopProducts();
    calculateCategoryStats();
    calculateRecentOrders();
  }, [orders, products]);

  // ✅ Supabase'den dashboard istatistiklerini çek
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardStats();
      
      setStats({
        totalRevenue: data.total_revenue || 0,
        totalOrders: data.total_orders || 0,
        totalProducts: data.total_products || 0,
        totalCustomers: data.total_customers || 0,
        pendingOrders: data.pending_orders || 0,
        completedOrders: data.completed_orders || 0,
        averageOrderValue: data.average_order_value || 0
      });
    } catch (error) {
      console.error('Dashboard stats load error:', error);
      // Fallback: localStorage'dan hesapla
      calculateStats();
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    const uniqueCustomers = new Set(orders.map(o => o.userId)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      totalCustomers: uniqueCustomers,
      pendingOrders,
      completedOrders,
      averageOrderValue
    });
  };

  const calculateRecentOrders = () => {
    // Son 5 siparişi al ve ters çevir (en yeni başta)
    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentOrders(recent);
  };

  const calculateSalesData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });

      const revenue = dayOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);

      last7Days.push({
        date: dateStr,
        revenue,
        orders: dayOrders.length
      });
    }

    setSalesData(last7Days);
  };

  const calculateTopProducts = () => {
    const productSales = {};

    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.name,
            totalSold: 0,
            revenue: 0
          };
        }
        productSales[item.productId].totalSold += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const sorted = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    setTopProducts(sorted);
  };

  const calculateCategoryStats = () => {
    const categoryData = {};

    products.forEach(product => {
      const category = product.category || 'Diğer';
      if (!categoryData[category]) {
        categoryData[category] = {
          name: category,
          count: 0,
          value: 0
        };
      }
      categoryData[category].count++;
      categoryData[category].value += product.price;
    });

    setCategoryStats(Object.values(categoryData));
  };

  const getMonthlyRevenue = () => {
    const monthlyData = {};
    
    orders.forEach(order => {
      if (order.status === 'completed') {
        const date = new Date(order.createdAt);
        const monthKey = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += order.totalAmount;
      }
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
  };

  const getOrderStatusBreakdown = () => {
    const statusCounts = {
      'pending': 0,
      'processing': 0,
      'shipped': 0,
      'completed': 0,
      'cancelled': 0
    };

    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: orders.length > 0 ? (count / orders.length * 100).toFixed(1) : 0
    }));
  };

  const value = {
    stats,
    salesData,
    topProducts,
    categoryStats,
    recentOrders,
    getMonthlyRevenue,
    getOrderStatusBreakdown
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

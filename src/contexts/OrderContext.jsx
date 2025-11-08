import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderService, productService, notificationService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase'den siparişleri yükle
  useEffect(() => {
    // Eski localStorage verilerini temizle
    localStorage.removeItem('orders');
    
    loadOrders();

    // ✅ Realtime sipariş güncellemeleri
    const ordersSubscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔔 Sipariş güncellendi:', payload);
          loadOrders(); // Siparişleri yeniden yükle
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      
      if (data && data.length > 0) {
        // Supabase formatını düzenle
        const formattedOrders = data.map((order, index) => ({
          ...order,
          // Daha güzel sipariş numarası: VN + timestamp'in son 8 hanesi
          orderNumber: `VN${new Date(order.created_at).getTime().toString().slice(-8)}`,
          date: order.created_at
        }));
        setOrders(formattedOrders);
        console.log(`✅ ${data.length} sipariş Supabase'den yüklendi`);
      } else {
        console.log('ℹ️ Henüz sipariş yok');
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Siparişler yüklenirken hata:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Yeni sipariş oluştur
  const createOrder = async (orderData) => {
    try {
      const newOrder = {
        customer_name: orderData.customerName || orderData.customer_name,
        customer_email: orderData.customerEmail || orderData.customer_email,
        customer_phone: orderData.customerPhone || orderData.customer_phone,
        items: orderData.items,
        total: orderData.total,
        status: 'pending',
        payment_method: orderData.paymentMethod || orderData.payment_method || 'Kredi Kartı',
        shipping_address: orderData.shippingAddress || orderData.shipping_address
      };

      // Supabase'e sipariş kaydet
      const created = await orderService.create(newOrder);
      console.log('✅ Sipariş Supabase\'e kaydedildi:', created);

      // Stokları güncelle
      for (const item of orderData.items) {
        try {
          // Mevcut ürünü al
          const product = await productService.getById(item.productId || item.id);
          if (product) {
            const newStock = (product.stock || 0) - (item.quantity || 1);
            // Stok güncellemesi
            await productService.update(product.id, { stock: Math.max(0, newStock) });
            console.log(`✅ ${product.name} stoğu güncellendi: ${product.stock} → ${newStock}`);
          }
        } catch (error) {
          console.error('❌ Stok güncellenirken hata:', error);
          // Stok hatası sipariş sürecini engellemez
        }
      }

      // Lokal state'i güncelle
      const orderWithLocal = {
        ...created,
        orderNumber: `VN${new Date(created.created_at).getTime().toString().slice(-8)}`,
        date: created.created_at
      };
      setOrders(prev => [orderWithLocal, ...prev]);

      // ✅ Admin bildirimi oluştur
      try {
        await notificationService.create({
          type: 'new_order',
          title: '🛍️ Yeni Sipariş',
          message: `${orderData.customerName || 'Müşteri'} yeni sipariş verdi. Sipariş No: VN${new Date(created.created_at).getTime().toString().slice(-8)}`,
          data: {
            order_id: created.id,
            customer_name: orderData.customerName,
            total: orderData.total
          },
          priority: 'high'
        });
      } catch (notifError) {
        console.error('❌ Bildirim oluşturulamadı:', notifError);
        // Bildirim hatası sipariş sürecini engellemez
      }

      return orderWithLocal;
    } catch (error) {
      console.error('❌ Sipariş oluşturulurken hata:', error);
      alert('Sipariş oluşturulurken bir hata oluştu!');
      throw error;
    }
  };

  // Sipariş durumu güncelle
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      console.log('✅ Sipariş durumu güncellendi:', newStatus);
      
      // Lokal state'i güncelle
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('❌ Sipariş durumu güncellenirken hata:', error);
      alert('Sipariş durumu güncellenirken bir hata oluştu!');
    }
  };

  // Siparişi iptal et
  const cancelOrder = (orderId) => {
    updateOrderStatus(orderId, 'cancelled');
  };

  // Siparişi sil
  const deleteOrder = async (orderId) => {
    try {
      await orderService.delete(orderId);
      console.log('✅ Sipariş silindi:', orderId);
      
      // Lokal state'den kaldır
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('❌ Sipariş silinirken hata:', error);
      alert('Sipariş silinirken bir hata oluştu!');
      throw error;
    }
  };

  // Sipariş detayı getir
  const getOrder = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const value = {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    getOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

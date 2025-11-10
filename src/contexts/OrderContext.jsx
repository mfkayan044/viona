import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderService, productService, notificationService, userService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';
import { emailService } from '../services/email.service';

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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      
      if (data && data.length > 0) {
        // Supabase formatını düzenle
        const formattedOrders = data.map((order, index) => ({
          ...order,
          // order_number veritabanından gelir (trigger ile oluşturulur)
          orderNumber: order.order_number || `VN${new Date(order.created_at).getTime().toString().slice(-8)}`,
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

  // Supabase'den siparişleri yükle
  useEffect(() => {
    console.log('🚀 OrderContext useEffect ÇALIŞTI - Realtime başlatılıyor...');
    
    // Eski localStorage verilerini temizle
    localStorage.removeItem('orders');
    
    loadOrders();

    // ✅ Realtime sipariş güncellemeleri
    const channel = supabase.channel('orders-changes');
    
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔔 Sipariş güncellendi:', payload);
          loadOrders(); // Siparişleri yeniden yükle
        }
      )
      .subscribe((status) => {
        console.log('📡 Orders Realtime Status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Orders Realtime BAŞARILI');
        }
      });

    return () => {
      console.log('🔌 Orders Realtime kapatılıyor');
      channel.unsubscribe();
    };
  }, []); // loadOrders stable olduğu için dependency'e eklemeye gerek yok

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
      console.log('📋 Order Number:', created.order_number);

      // order_number kontrolü
      if (!created.order_number) {
        console.error('❌ Order number oluşturulmadı! Trigger çalışmıyor olabilir.');
        // Fallback: Manuel order number oluştur
        created.order_number = `VN${Date.now().toString().slice(-8)}`;
      }

      // ℹ️ Stok güncellemesi admin panelinden manuel yapılacak
      // RLS policy nedeniyle guest checkout'ta 406 hatası veriyor
      console.log('ℹ️ Stok güncellemesi admin panelinden manuel yapılacak');

      // Lokal state'i güncelle
      const orderWithLocal = {
        ...created,
        orderNumber: created.order_number, // Veritabanından gelen order_number
        date: created.created_at
      };
      setOrders(prev => [orderWithLocal, ...prev]);

      // ✅ Admin bildirimi oluştur
      try {
        await notificationService.create({
          type: 'new_order',
          title: '🛍️ Yeni Sipariş',
          message: `${orderData.customerName || 'Müşteri'} yeni sipariş verdi. Sipariş No: ${created.order_number}`,
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

      // ✅ Müşteriye sipariş onay maili gönder
      try {
        // Adresi string formatına çevir
        let addressString = orderData.shippingAddress || orderData.shipping_address;
        if (typeof addressString === 'object' && addressString !== null) {
          // CheckoutPage'den gelen format: address, city, district, postalCode
          const parts = [
            addressString.address || addressString.street || '',
            addressString.district || '',
            addressString.city || addressString.state || '',
            addressString.postalCode || addressString.zipCode || ''
          ].filter(part => part.trim());
          addressString = parts.join(', ');
        }

        const orderForEmail = {
          order_number: created.order_number, // Artık kesinlikle var
          created_at: created.created_at,
          items: orderData.items,
          total_amount: orderData.total,
          shipping_address: addressString
        };

        await emailService.sendOrderConfirmation(orderForEmail, {
          email: orderData.customerEmail || orderData.customer_email,
          full_name: orderData.customerName || orderData.customer_name
        });
        console.log('✅ Müşteriye sipariş onay maili gönderildi');
      } catch (emailError) {
        console.warn('❌ Sipariş onay maili gönderilemedi:', emailError);
      }

      // ✅ Admin'e yeni sipariş bildirimi maili gönder
      try {
        // Adresi string formatına çevir
        let addressString = orderData.shippingAddress || orderData.shipping_address;
        if (typeof addressString === 'object' && addressString !== null) {
          // CheckoutPage'den gelen format: address, city, district, postalCode
          const parts = [
            addressString.address || addressString.street || '',
            addressString.district || '',
            addressString.city || addressString.state || '',
            addressString.postalCode || addressString.zipCode || ''
          ].filter(part => part.trim());
          addressString = parts.join(', ');
        }

        const orderForEmail = {
          order_number: created.order_number, // Artık kesinlikle var
          created_at: created.created_at,
          items: orderData.items,
          total_amount: orderData.total,
          shipping_address: addressString
        };

        await emailService.sendAdminOrderNotification(orderForEmail, {
          email: orderData.customerEmail || orderData.customer_email,
          full_name: orderData.customerName || orderData.customer_name,
          phone: orderData.customerPhone || orderData.customer_phone
        });
        console.log('✅ Admine sipariş bildirimi gönderildi');
      } catch (emailError) {
        console.warn('❌ Admin sipariş bildirimi gönderilemedi:', emailError);
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
      // Sipariş bilgisini al
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Sipariş bulunamadı');
      }

      // Durumu güncelle
      await orderService.updateStatus(orderId, newStatus);
      console.log('✅ Sipariş durumu güncellendi:', newStatus);
      
      // Lokal state'i güncelle
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Müşteriye durum güncelleme maili gönder
      try {
        await emailService.sendOrderStatusUpdate(
          {
            order_number: order.order_number || order.orderNumber,
            id: order.id
          },
          {
            email: order.customer_email,
            full_name: order.customer_name
          },
          newStatus
        );
        console.log('✅ Müşteriye durum güncelleme maili gönderildi');
      } catch (emailError) {
        console.warn('❌ Durum güncelleme maili gönderilemedi:', emailError);
      }
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Supabase'den bildirimleri yükle
  useEffect(() => {
    loadNotifications();

    // ✅ Realtime bildirim güncellemeleri
    const notificationsSubscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('🔔 Yeni bildirim:', payload);
          loadNotifications(); // Bildirimleri yeniden yükle
        }
      )
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);

  // Okunmamış sayısını güncelle
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data || []);
    } catch (error) {
      console.error('Notifications load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewOrders = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const recentOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const hourAgo = new Date();
      hourAgo.setHours(hourAgo.getHours() - 1);
      return orderDate >= hourAgo;
    });

    // Bekleyen siparişler için bildirim
    if (pendingOrders.length > 0) {
      const existingNotif = notifications.find(n => n.type === 'pending-orders');
      if (!existingNotif || existingNotif.count !== pendingOrders.length) {
        addNotification({
          type: 'pending-orders',
          title: 'Bekleyen Siparişler',
          message: `${pendingOrders.length} adet onay bekleyen sipariş var`,
          count: pendingOrders.length,
          category: 'order',
          priority: 'high'
        });
      }
    }

    // Yeni siparişler için bildirim
    recentOrders.forEach(order => {
      const notifId = `order-${order.id}`;
      const exists = notifications.some(n => n.id === notifId);
      if (!exists) {
        addNotification({
          id: notifId,
          type: 'new-order',
          title: 'Yeni Sipariş',
          message: `#${order.id} numaralı sipariş alındı - ${order.totalAmount} ₺`,
          category: 'order',
          priority: 'high',
          link: '/admin/orders'
        });
      }
    });
  };

  const checkForNewMessages = () => {
    const unreadMessages = messages.filter(m => !m.read);
    
    unreadMessages.forEach(message => {
      const notifId = `message-${message.id}`;
      const exists = notifications.some(n => n.id === notifId);
      if (!exists) {
        addNotification({
          id: notifId,
          type: 'new-message',
          title: 'Yeni Mesaj',
          message: `${message.name} - ${message.subject}`,
          category: 'message',
          priority: 'medium',
          link: '/admin/contact'
        });
      }
    });
  };

  const checkStockAlerts = () => {
    stockAlerts.forEach(alert => {
      const notifId = `stock-${alert.id}`;
      const exists = notifications.some(n => n.id === notifId);
      
      if (!exists) {
        let priority = 'low';
        if (alert.type === 'error') priority = 'high';
        else if (alert.type === 'warning') priority = 'medium';

        addNotification({
          id: notifId,
          type: 'stock-alert',
          title: 'Stok Uyarısı',
          message: alert.message,
          category: 'inventory',
          priority,
          link: '/admin/inventory'
        });
      }
    });
  };

  const addNotification = (notification) => {
    const newNotif = {
      ...notification,
      id: notification.id || `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Max 50 bildirim
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const clearAllRead = async () => {
    try {
      await notificationService.deleteRead();
      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch (error) {
      console.error('Clear read error:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
  };
    deleteNotification,
    clearAll,
    getNotificationsByCategory,
    getUnreadByCategory
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

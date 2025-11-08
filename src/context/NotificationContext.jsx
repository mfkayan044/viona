import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useInventory } from '../context/InventoryContext';
import { useContact } from '../contexts/ContactContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { orders } = useOrders();
  const { stockAlerts } = useInventory();
  const { messages } = useContact();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('adminNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    checkForNewOrders();
  }, [orders]);

  useEffect(() => {
    checkForNewMessages();
  }, [messages]);

  useEffect(() => {
    checkStockAlerts();
  }, [stockAlerts]);

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

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationsByCategory = (category) => {
    return notifications.filter(n => n.category === category);
  };

  const getUnreadByCategory = (category) => {
    return notifications.filter(n => n.category === category && !n.read).length;
  };

  const value = {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
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

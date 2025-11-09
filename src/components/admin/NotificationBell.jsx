import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Package, ShoppingBag, Mail } from 'lucide-react';
import { notificationService } from '../../services/supabase.service';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    
    // Her 30 saniyede bir yenile
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const allNotifs = await notificationService.getAll();
      setNotifications(allNotifs.slice(0, 10)); // Son 10 bildirim
      const unread = allNotifs.filter(n => !n.is_read);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenemedi:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id);
      await loadNotifications();
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.deleteRead();
      await loadNotifications();
    } catch (error) {
      console.error('Bildirimler temizlenemedi:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-600 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal': return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low': return 'border-l-4 border-gray-400 bg-gray-50';
      default: return 'border-l-4 border-gray-300 bg-white';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new_order': return <ShoppingBag size={18} />;
      case 'low_stock': return <Package size={18} />;
      case 'new_user': return '👤';
      case 'payment_received': return '💳';
      case 'return_request': return '↩️';
      default: return <Bell size={18} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bildirim İkonu */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-gray-800 rounded-lg transition"
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Bildirim Paneli */}
      {showNotifications && (
        <div className="fixed right-4 top-16 w-96 max-w-[calc(100vw-2rem)] max-h-[600px] bg-white border border-neutral-300 shadow-2xl z-[9999] flex flex-col rounded-lg overflow-hidden">
          {/* Başlık */}
          <div className="p-4 border-b border-neutral-300 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-gray-900" />
              <h3 className="font-medium uppercase tracking-wider text-gray-900">Bildirimler</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Bildirim Listesi */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <Bell size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Bildirim bulunmuyor</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-neutral-50 transition-colors ${
                      !notif.is_read ? getPriorityColor(notif.priority) : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 ${!notif.is_read ? 'text-black' : 'text-neutral-400'}`}>
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${!notif.is_read ? 'text-black' : 'text-neutral-600'}`}>
                            {notif.title}
                          </h4>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">{notif.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-400">
                            {formatTime(notif.created_at)}
                          </span>
                          <div className="flex gap-1">
                            {!notif.is_read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                title="Okundu işaretle"
                              >
                                <Check size={14} className="text-green-600" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alt İşlemler */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-neutral-300 bg-neutral-50 flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex-1 px-3 py-2 text-xs border border-neutral-300 hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <CheckCheck size={14} />
                  Tümünü Okundu İşaretle
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex-1 px-3 py-2 text-xs border border-neutral-300 hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Trash2 size={14} />
                Okunmuşları Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

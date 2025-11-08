import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';

const CartReminderContext = createContext();

export const useCartReminder = () => {
  const context = useContext(CartReminderContext);
  if (!context) {
    throw new Error('useCartReminder must be used within CartReminderProvider');
  }
  return context;
};

export const CartReminderProvider = ({ children }) => {
  const { cart } = useApp();
  const [showReminder, setShowReminder] = useState(false);
  const [reminderCart, setReminderCart] = useState([]);

  useEffect(() => {
    // Sepet değiştiğinde localStorage'a kaydet
    if (cart.length > 0) {
      localStorage.setItem('cartReminder', JSON.stringify({
        cart,
        timestamp: new Date().getTime()
      }));
    } else {
      localStorage.removeItem('cartReminder');
    }
  }, [cart]);

  useEffect(() => {
    // Sayfa yüklendiğinde eski sepeti kontrol et
    const savedCart = localStorage.getItem('cartReminder');
    if (savedCart) {
      const { cart: oldCart, timestamp } = JSON.parse(savedCart);
      const hoursPassed = (new Date().getTime() - timestamp) / (1000 * 60 * 60);
      
      // 24 saat içinde sepet varsa ve şu an boşsa hatırlat
      if (hoursPassed < 24 && cart.length === 0 && oldCart.length > 0) {
        setReminderCart(oldCart);
        // 2 saniye sonra hatırlatıcıyı göster
        setTimeout(() => {
          setShowReminder(true);
        }, 2000);
      }
    }
  }, []);

  const dismissReminder = () => {
    setShowReminder(false);
    localStorage.removeItem('cartReminder');
  };

  const value = {
    showReminder,
    reminderCart,
    dismissReminder,
    setShowReminder
  };

  return (
    <CartReminderContext.Provider value={value}>
      {children}
    </CartReminderContext.Provider>
  );
};

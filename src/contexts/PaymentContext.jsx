import React, { createContext, useContext, useState, useEffect } from 'react';
import { paymentMethodService } from '../services/supabase.service';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase'den yükle
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getAll();
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Payment methods load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aktif ödeme yöntemlerini getir
  const getActivePaymentMethods = () => {
    return paymentMethods.filter(method => method.is_active);
  };

  // Code ile ödeme yöntemi getir
  const getPaymentMethodByCode = (code) => {
    return paymentMethods.find(method => method.code === code);
  };

  // Ödeme yöntemi güncelle
  const updatePaymentMethod = async (id, updates) => {
    try {
      await paymentMethodService.update(id, updates);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Update payment method error:', error);
      throw error;
    }
  };

  // Aktif/Pasif durumunu değiştir
  const togglePaymentMethod = async (id, isActive) => {
    try {
      await paymentMethodService.toggleActive(id, isActive);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Toggle payment method error:', error);
      throw error;
    }
  };

  const value = {
    paymentMethods,
    loading,
    getActivePaymentMethods,
    getPaymentMethodByCode,
    updatePaymentMethod,
    togglePaymentMethod,
    loadPaymentMethods
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

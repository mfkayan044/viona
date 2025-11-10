import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CouponContext = createContext();

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('coupons');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        code: 'HOSGELDIN50',
        discount: 50,
        type: 'percentage', // 'percentage' veya 'fixed'
        minAmount: 200,
        maxDiscount: 100,
        validUntil: '2025-12-31',
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        description: 'İlk alışverişinizde %50 indirim'
      },
      {
        id: 2,
        code: 'KARGO0',
        discount: 30,
        type: 'fixed',
        minAmount: 150,
        maxDiscount: 30,
        validUntil: '2025-12-31',
        usageLimit: 200,
        usedCount: 0,
        isActive: true,
        description: 'Kargo bedava - 30 TL indirim'
      },
      {
        id: 3,
        code: 'YAZ2025',
        discount: 30,
        type: 'percentage',
        minAmount: 300,
        maxDiscount: 150,
        validUntil: '2025-08-31',
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
        description: 'Yaz kampanyası %30 indirim'
      }
    ];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  const validateCoupon = async (code, cartTotal, userEmail) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      return { valid: false, message: 'Geçersiz kupon kodu' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Bu kupon artık aktif değil' };
    }

    if (new Date(coupon.validUntil) < new Date()) {
      return { valid: false, message: 'Bu kuponun süresi dolmuş' };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Bu kuponun kullanım limiti dolmuş' };
    }

    if (cartTotal < coupon.minAmount) {
      return { 
        valid: false, 
        message: `Bu kupon minimum ${coupon.minAmount} TL alışveriş için geçerlidir` 
      };
    }

    // ✅ Kullanıcının bu kuponu daha önce kullanıp kullanmadığını kontrol et
    if (userEmail) {
      try {
        const { data, error } = await supabase
          .from('coupon_usage')
          .select('id')
          .eq('coupon_code', code.toUpperCase())
          .eq('user_email', userEmail.toLowerCase())
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          return { 
            valid: false, 
            message: 'Bu kuponu daha önce kullandınız. Her kupon müşteri başına 1 kere kullanılabilir.' 
          };
        }
      } catch (error) {
        console.error('Kupon kontrolü hatası:', error);
        // Hata durumunda yine de devam et
      }
    }

    return { valid: true, coupon };
  };

  const applyCoupon = async (code, cartTotal, userEmail) => {
    const result = await validateCoupon(code, cartTotal, userEmail);
    
    if (!result.valid) {
      return { success: false, message: result.message };
    }

    setAppliedCoupon(result.coupon);
    return { 
      success: true, 
      message: 'Kupon başarıyla uygulandı!',
      coupon: result.coupon 
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const calculateDiscount = (cartTotal) => {
    if (!appliedCoupon) return 0;

    let discount = 0;
    
    if (appliedCoupon.type === 'percentage') {
      discount = (cartTotal * appliedCoupon.discount) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discount;
    }

    return Math.min(discount, cartTotal);
  };

  const useCouponCode = (couponId) => {
    setCoupons(prev => prev.map(c => 
      c.id === couponId 
        ? { ...c, usedCount: c.usedCount + 1 }
        : c
    ));
  };

  // Admin Functions
  const addCoupon = (couponData) => {
    const newCoupon = {
      ...couponData,
      id: Date.now(),
      usedCount: 0,
      isActive: true
    };
    setCoupons(prev => [...prev, newCoupon]);
  };

  const updateCoupon = (couponId, updates) => {
    setCoupons(prev => prev.map(c => 
      c.id === couponId ? { ...c, ...updates } : c
    ));
  };

  const deleteCoupon = (couponId) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  const toggleCouponStatus = (couponId) => {
    setCoupons(prev => prev.map(c => 
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    ));
  };

  return (
    <CouponContext.Provider value={{
      coupons,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      calculateDiscount,
      useCouponCode,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponStatus
    }}>
      {children}
    </CouponContext.Provider>
  );
};

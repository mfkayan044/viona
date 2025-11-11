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
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Supabase'den kuponları çek
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCoupons(data);
      } else {
        // Eğer veritabanında kupon yoksa, default kuponları ekle
        await initializeDefaultCoupons();
      }
    } catch (error) {
      console.error('❌ Kuponlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultCoupons = async () => {
    const defaultCoupons = [
      {
        code: 'HOSGELDIN50',
        discount: 50,
        type: 'percentage',
        min_purchase: 200,
        expires_at: '2025-12-31T23:59:59Z',
        max_uses: 100,
        current_uses: 0,
        is_active: true
      },
      {
        code: 'KARGO0',
        discount: 30,
        type: 'fixed',
        min_purchase: 150,
        expires_at: '2025-12-31T23:59:59Z',
        max_uses: 200,
        current_uses: 0,
        is_active: true
      }
    ];

    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert(defaultCoupons)
        .select();

      if (error) throw error;
      if (data) setCoupons(data);
    } catch (error) {
      console.error('❌ Default kuponlar eklenirken hata:', error);
    }
  };

  const validateCoupon = async (code, cartTotal, userEmail) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      return { valid: false, message: 'Geçersiz kupon kodu' };
    }

    if (!coupon.is_active) {
      return { valid: false, message: 'Bu kupon artık aktif değil' };
    }

    if (new Date(coupon.expires_at) < new Date()) {
      return { valid: false, message: 'Bu kuponun süresi dolmuş' };
    }

    if (coupon.current_uses >= coupon.max_uses) {
      return { valid: false, message: 'Bu kuponun kullanım limiti dolmuş' };
    }

    if (cartTotal < coupon.min_purchase) {
      return { 
        valid: false, 
        message: `Bu kupon minimum ${coupon.min_purchase} TL alışveriş için geçerlidir` 
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
    } else {
      discount = appliedCoupon.discount;
    }

    return Math.min(discount, cartTotal);
  };

  const useCouponCode = async (couponId) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ current_uses: supabase.raw('current_uses + 1') })
        .eq('id', couponId);

      if (error) throw error;
      
      // Local state güncelle
      setCoupons(prev => prev.map(c => 
        c.id === couponId 
          ? { ...c, current_uses: c.current_uses + 1 }
          : c
      ));
    } catch (error) {
      console.error('❌ Kupon kullanım sayısı güncellenirken hata:', error);
    }
  };

  // Admin Functions
  const addCoupon = async (couponData) => {
    try {
      const newCoupon = {
        code: couponData.code,
        discount: couponData.discount,
        type: couponData.type,
        min_purchase: couponData.minAmount || 0,
        expires_at: couponData.validUntil,
        max_uses: couponData.usageLimit || 100,
        current_uses: 0,
        is_active: true
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert([newCoupon])
        .select()
        .single();

      if (error) throw error;
      
      setCoupons(prev => [...prev, data]);
      return { success: true };
    } catch (error) {
      console.error('❌ Kupon eklenirken hata:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCoupon = async (couponId, updates) => {
    try {
      const updateData = {
        code: updates.code,
        discount: updates.discount,
        type: updates.type,
        min_purchase: updates.minAmount,
        expires_at: updates.validUntil,
        max_uses: updates.usageLimit,
        is_active: updates.isActive !== undefined ? updates.isActive : undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const { error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', couponId);

      if (error) throw error;
      
      setCoupons(prev => prev.map(c => 
        c.id === couponId ? { ...c, ...updateData } : c
      ));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Kupon güncellenirken hata:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteCoupon = async (couponId) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      return { success: true };
    } catch (error) {
      console.error('❌ Kupon silinirken hata:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleCouponStatus = async (couponId) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) return;

      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', couponId);

      if (error) throw error;
      
      setCoupons(prev => prev.map(c => 
        c.id === couponId ? { ...c, is_active: !c.is_active } : c
      ));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Kupon durumu değiştirilirken hata:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <CouponContext.Provider value={{
      coupons,
      loading,
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

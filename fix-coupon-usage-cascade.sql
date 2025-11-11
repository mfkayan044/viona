-- ====================================
-- FIX COUPON USAGE CASCADE DELETE
-- ====================================

-- Mevcut foreign key constraint'i kaldır
ALTER TABLE public.coupon_usage
DROP CONSTRAINT IF EXISTS coupon_usage_order_id_fkey;

-- Yeni constraint ekle - CASCADE DELETE ile
ALTER TABLE public.coupon_usage
ADD CONSTRAINT coupon_usage_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;  -- Sipariş silindiğinde kupon kullanımı da silinsin

-- Test edelim
-- SELECT * FROM coupon_usage WHERE order_id IS NOT NULL;

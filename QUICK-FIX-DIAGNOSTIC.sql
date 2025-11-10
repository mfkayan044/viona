-- ====================================
-- ADIM ADIM KONTROL VE KURULUM
-- ====================================

-- =====================
-- ADIM 1: TRİGGER VAR MI?
-- =====================
SELECT 
  p.proname as function_name,
  '✅ KURULU' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_product_stock';

-- Sonuç: 
-- ✅ 1 satır dönüyorsa KURULU
-- ❌ Boş dönüyorsa supabase-stock-trigger.sql çalıştır!

-- =====================
-- ADIM 2: TRİGGER AKTİF Mİ?
-- =====================
SELECT 
  trigger_name,
  event_object_table,
  '✅ AKTİF' as status
FROM information_schema.triggers
WHERE trigger_name = 'auto_update_stock';

-- Sonuç:
-- ✅ 1 satır dönüyorsa AKTİF
-- ❌ Boş dönüyorsa supabase-stock-trigger.sql çalıştır!

-- =====================
-- ADIM 3: REALTIME VAR MI?
-- =====================
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE tablename = t.tablename
      AND pubname = 'supabase_realtime'
    ) 
    THEN '✅ AKTİF'
    ELSE '❌ KAPALI'
  END as realtime_status
FROM pg_tables t
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'orders');

-- Sonuç:
-- ✅ Her ikisi de AKTİF olmalı
-- ❌ KAPALI ise: Supabase Dashboard > Database > Replication > Enable Realtime

-- =====================
-- ADIM 4: TEST
-- =====================
-- Bir ürün ID'si al
SELECT id, name, stock FROM products LIMIT 1;

-- O ID'yi buraya yapıştır ve çalıştır:
-- (UUID'yi değiştir!)
WITH test_data AS (
  SELECT 
    id,
    stock as old_stock
  FROM products 
  WHERE id = 'BURAYA_ID_YAPISTIR' -- ← DEĞİŞTİR!
)
INSERT INTO orders (
  customer_name,
  customer_email,
  items,
  total
) 
SELECT 
  'Test User',
  'test@test.com',
  jsonb_build_array(
    jsonb_build_object(
      'productId', id,
      'quantity', 2
    )
  ),
  100
FROM test_data
RETURNING id, order_number;

-- Şimdi stoğu kontrol et - 2 azalmış mı?
SELECT id, name, stock FROM products WHERE id = 'BURAYA_ID_YAPISTIR'; -- ← DEĞİŞTİR!

-- Test siparişini sil
DELETE FROM orders WHERE customer_email = 'test@test.com';

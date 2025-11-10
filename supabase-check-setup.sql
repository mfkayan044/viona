-- ====================================
-- KONTROL VE KURULUM SKRIPTI
-- ====================================
-- Tüm trigger ve tabloların doğru kurulup kurulmadığını kontrol et

-- 1. Trigger fonksiyonu var mı?
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_product_stock';

-- 2. Trigger var mı?
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'auto_update_stock';

-- 3. coupon_usage tablosu var mı?
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'coupon_usage'
ORDER BY ordinal_position;

-- 4. coupon_usage unique constraint var mı?
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'coupon_usage'
  AND tc.constraint_type = 'UNIQUE';

-- 5. RLS policies kontrol
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('coupon_usage', 'orders', 'products');

-- ====================================
-- REALTIME KONTROL VE DÜZELTME
-- ====================================

-- 1. Realtime publication var mı kontrol et
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- 2. Hangi tablolar realtime'da?
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Eğer orders ve products yoksa, ekle:
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- 4. Tekrar kontrol - şimdi olmalı
SELECT 
  tablename,
  '✅ Realtime Aktif' as durum
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('orders', 'products');

-- Beklenen: 2 satır (orders ve products)

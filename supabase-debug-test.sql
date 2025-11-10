-- ====================================
-- HIZLI TEST VE DEBUG
-- ====================================

-- 1. Trigger çalışıyor mu test et
-- Test sipariş insert et ve stok düşümünü kontrol et

-- Önce bir ürünün ID'sini al
SELECT id, name, stock FROM products LIMIT 1;

-- O ürünün şu anki stoğunu not et, sonra test sipariş oluştur:
-- ÖNEMLİ: Aşağıdaki UUID'yi yukarıdaki sorgudan aldığın ürün ID'si ile değiştir!

INSERT INTO orders (
  customer_name,
  customer_email,
  customer_phone,
  items,
  total,
  status
) VALUES (
  'Test User',
  'test@test.com',
  '5551234567',
  '[
    {
      "productId": "BURAYA_ÜRÜN_ID_GİR",
      "name": "Test Ürün",
      "price": 100,
      "quantity": 2,
      "image": "test.jpg"
    }
  ]'::jsonb,
  200,
  'pending'
) RETURNING id, order_number;

-- Şimdi ürünün stoğunu tekrar kontrol et - 2 adet azalmış olmalı!
SELECT id, name, stock FROM products WHERE id = 'BURAYA_ÜRÜN_ID_GİR';

-- ====================================
-- REALTIME AKTIF Mİ?
-- ====================================

-- Supabase Dashboard > Database > Replication
-- "products" ve "orders" tablolarında "Enable Realtime" işaretli mi kontrol et

-- Alternatif: SQL ile kontrol
SELECT 
  schemaname,
  tablename,
  -- Realtime aktif mi?
  (SELECT count(*) FROM pg_publication_tables WHERE tablename = t.tablename) as is_realtime
FROM pg_tables t
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'orders');

-- Eğer is_realtime = 0 ise Realtime KAPALI!
-- Supabase Dashboard'dan aktif et!

-- ====================================
-- TRIGGER LOGLARI
-- ====================================

-- PostgreSQL notice'ları görmek için Supabase SQL Editor'da:
-- Settings > Show notices: ON yap

-- Sonra test sipariş oluştur, console'da şunu göreceksin:
-- "Stok güncellendi: Product ID xxx, Eski: 10, Yeni: 8"

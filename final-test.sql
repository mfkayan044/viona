-- ====================================
-- STOK KONTROL VE TRİGGER TEST
-- ====================================

-- ADIM 1: Stok durumunu göster
SELECT 
  name,
  stock,
  CASE WHEN stock > 0 THEN '✅' ELSE '❌' END as stok_durumu
FROM products
ORDER BY stock DESC
LIMIT 5;

-- ADIM 2: Bir ürünün stokunu 100 yap
UPDATE products 
SET stock = 100
WHERE id = (SELECT id FROM products LIMIT 1)
RETURNING name, stock;

-- ADIM 3: Trigger Testi
WITH test AS (
  SELECT id, name, stock as eski FROM products WHERE stock > 0 LIMIT 1
)
INSERT INTO orders (customer_name, customer_email, items, total)
SELECT 
  'Test',
  'test@test.com',
  jsonb_build_array(jsonb_build_object('productId', id, 'quantity', 7)),
  700
FROM test
RETURNING id;

-- ADIM 4: Sonuç
SELECT 
  p.name as "Ürün",
  100 as "Önceki Stok",
  p.stock as "Şimdiki Stok",
  (100 - p.stock) as "Fark",
  CASE 
    WHEN (100 - p.stock) = 7 THEN '✅ ÇALIŞIYOR'
    ELSE '❌ ÇALIŞMIYOR'
  END as "Durum"
FROM products p
WHERE p.stock < 100
LIMIT 1;

-- Temizlik
DELETE FROM orders WHERE customer_email = 'test@test.com';

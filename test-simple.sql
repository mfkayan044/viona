-- ====================================
-- BASIT TEST - SONUÇ TABLOYLA DÖNER
-- ====================================
-- Bu test sonucu tablo olarak gösterir

WITH test_product AS (
  -- Stoklu bir ürün seç
  SELECT id, name, stock as old_stock
  FROM products 
  WHERE stock > 5 
  LIMIT 1
),
test_order AS (
  -- Test sipariş oluştur
  INSERT INTO orders (
    customer_name,
    customer_email,
    customer_phone,
    items,
    total,
    status
  )
  SELECT 
    'Trigger Test',
    'trigger-test@viona.com',
    '5551234567',
    jsonb_build_array(
      jsonb_build_object(
        'productId', id,
        'name', name,
        'price', 100,
        'quantity', 3
      )
    ),
    300,
    'pending'
  FROM test_product
  RETURNING id as order_id
),
check_stock AS (
  -- Yeni stoğu kontrol et
  SELECT 
    tp.id as product_id,
    tp.name as product_name,
    tp.old_stock,
    p.stock as new_stock,
    (tp.old_stock - p.stock) as fark
  FROM test_product tp
  JOIN products p ON p.id = tp.id
)
SELECT 
  product_name as "Ürün",
  old_stock as "Eski Stok",
  new_stock as "Yeni Stok",
  fark as "Fark",
  CASE 
    WHEN fark = 3 THEN '✅ TRİGGER ÇALIŞIYOR!'
    ELSE '❌ TRİGGER ÇALIŞMIYOR!'
  END as "Durum"
FROM check_stock;

-- Test siparişini temizle
DELETE FROM orders WHERE customer_email = 'trigger-test@viona.com';

-- SONUÇ:
-- Eğer "Fark" = 3 ve "Durum" = ✅ ise trigger çalışıyor
-- Eğer "Fark" = 0 ve "Durum" = ❌ ise trigger KURULU DEĞİL!

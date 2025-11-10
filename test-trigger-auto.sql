-- ====================================
-- KOLAY TEST - KOPYALA YAPISTIR
-- ====================================
-- Bu SQL'i tek seferde çalıştır, otomatik test eder!

DO $$
DECLARE
  test_product_id UUID;
  test_product_name TEXT;
  old_stock INTEGER;
  new_stock INTEGER;
  test_order_id UUID;
BEGIN
  -- 1. Rastgele bir ürün seç (stoklu olan)
  SELECT id, name, stock 
  INTO test_product_id, test_product_name, old_stock
  FROM products 
  WHERE stock > 5 
  LIMIT 1;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST BAŞLIYOR...';
  RAISE NOTICE 'Ürün: % (ID: %)', test_product_name, test_product_id;
  RAISE NOTICE 'Başlangıç Stok: %', old_stock;
  RAISE NOTICE '========================================';
  
  -- 2. Test sipariş oluştur (3 adet)
  INSERT INTO orders (
    customer_name,
    customer_email,
    customer_phone,
    items,
    total,
    status
  ) VALUES (
    'Trigger Test User',
    'trigger-test@viona.com',
    '5551234567',
    jsonb_build_array(
      jsonb_build_object(
        'productId', test_product_id,
        'name', test_product_name,
        'price', 100,
        'quantity', 3
      )
    ),
    300,
    'pending'
  ) RETURNING id INTO test_order_id;
  
  RAISE NOTICE 'Test sipariş oluşturuldu: %', test_order_id;
  
  -- 3. Yeni stoğu kontrol et
  SELECT stock INTO new_stock FROM products WHERE id = test_product_id;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SONUÇ:';
  RAISE NOTICE 'Eski Stok: %', old_stock;
  RAISE NOTICE 'Yeni Stok: %', new_stock;
  RAISE NOTICE 'Fark: %', (old_stock - new_stock);
  RAISE NOTICE '========================================';
  
  -- 4. Değerlendirme
  IF (old_stock - new_stock) = 3 THEN
    RAISE NOTICE '✅✅✅ TRİGGER ÇALIŞIYOR! ✅✅✅';
    RAISE NOTICE 'Stok başarıyla 3 adet azaldı!';
  ELSE
    RAISE WARNING '❌❌❌ TRİGGER ÇALIŞMIYOR! ❌❌❌';
    RAISE WARNING 'Stok DEĞİŞMEDİ veya yanlış değişti!';
    RAISE WARNING 'Muhtemelen trigger KURULU DEĞİL!';
    RAISE WARNING 'supabase-stock-trigger.sql dosyasını çalıştır!';
  END IF;
  
  -- 5. Test siparişini sil (temizlik)
  DELETE FROM orders WHERE id = test_order_id;
  RAISE NOTICE 'Test siparişi temizlendi.';
  
  RAISE NOTICE '========================================';
END $$;

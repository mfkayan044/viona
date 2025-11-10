-- ====================================
-- STOK OTOMATIK DÜŞÜRME TRİGGER
-- ====================================
-- Sipariş oluşturulduğunda otomatik olarak ürün stoklarını düşürür
-- RLS policy'den bağımsız çalışır (SECURITY DEFINER)

-- 1. Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER
SECURITY DEFINER -- Admin yetkisiyle çalışır, RLS bypass
LANGUAGE plpgsql
AS $$
DECLARE
  item JSONB;
  product_id UUID;
  quantity INTEGER;
  current_stock INTEGER;
BEGIN
  -- Sipariş items'ları döngüye al
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    -- Product ID ve quantity'yi al
    product_id := (item->>'productId')::UUID;
    quantity := (item->>'quantity')::INTEGER;
    
    -- Null kontrolü
    IF product_id IS NULL THEN
      product_id := (item->>'id')::UUID;
    END IF;
    
    IF product_id IS NOT NULL AND quantity IS NOT NULL THEN
      -- Mevcut stok miktarını al
      SELECT stock INTO current_stock
      FROM products
      WHERE id = product_id;
      
      -- Stok varsa güncelle
      IF current_stock IS NOT NULL THEN
        UPDATE products
        SET stock = GREATEST(0, stock - quantity),
            updated_at = NOW()
        WHERE id = product_id;
        
        RAISE NOTICE 'Stok güncellendi: Product ID %, Eski: %, Yeni: %', 
          product_id, current_stock, GREATEST(0, current_stock - quantity);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- 2. Trigger'ı orders tablosuna ekle
DROP TRIGGER IF EXISTS auto_update_stock ON orders;

CREATE TRIGGER auto_update_stock
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

COMMENT ON FUNCTION update_product_stock() IS 'Yeni sipariş oluşturulduğunda ürün stoklarını otomatik olarak düşürür';

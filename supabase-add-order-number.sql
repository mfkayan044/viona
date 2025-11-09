-- Orders tablosuna order_number kolonu ekle ve otomatik generate et
-- VN32547799 formatında sipariş numaraları

-- 1. Kolonu ekle
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) UNIQUE;

-- 2. Mevcut siparişler için random order number generate et
UPDATE orders
SET order_number = 'VN' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0')
WHERE order_number IS NULL;

-- 3. Yeni siparişler için otomatik trigger oluştur
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'VN' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger'ı orders tablosuna ekle
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- 5. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

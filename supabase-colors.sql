-- Colors Table
-- Ürün renkleri için veritabanı tablosu

CREATE TABLE IF NOT EXISTS colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Herkes aktif renkleri görebilir
CREATE POLICY "Anyone can view active colors"
ON colors FOR SELECT
USING (is_active = true);

-- Herkes renk ekleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can insert colors"
ON colors FOR INSERT
WITH CHECK (true);

-- Herkes renk güncelleyebilir (Soft delete için gerekli)
CREATE POLICY "Anyone can update colors"
ON colors FOR UPDATE
USING (true)
WITH CHECK (true);

-- Herkes renk silebilir (Hard delete - opsiyonel)
CREATE POLICY "Anyone can delete colors"
ON colors FOR DELETE
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_colors_order ON colors(order_index);
CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(is_active);

-- Varsayılan renkler
INSERT INTO colors (name, hex_code, order_index, is_active) VALUES
  ('Şeffaf', NULL, 1, true),
  ('Bej', '#F5F5DC', 2, true),
  ('Altın', '#FFD700', 3, true),
  ('Gümüş', '#C0C0C0', 4, true),
  ('Siyah', '#000000', 5, true),
  ('Beyaz', '#FFFFFF', 6, true),
  ('Kırmızı', '#FF0000', 7, true),
  ('Mavi', '#0000FF', 8, true),
  ('Yeşil', '#00FF00', 9, true),
  ('Pembe', '#FFC0CB', 10, true)
ON CONFLICT (name) DO NOTHING;

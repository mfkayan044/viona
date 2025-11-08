-- Categories Table
-- Ürün kategorileri için veritabanı tablosu

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Herkes aktif kategorileri görebilir
CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
USING (is_active = true);

-- Herkes kategori ekleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can insert categories"
ON categories FOR INSERT
WITH CHECK (true);

-- Herkes kategori güncelleyebilir (Soft delete için gerekli)
CREATE POLICY "Anyone can update categories"
ON categories FOR UPDATE
USING (true)
WITH CHECK (true);

-- Herkes kategori silebilir (Hard delete - opsiyonel)
CREATE POLICY "Anyone can delete categories"
ON categories FOR DELETE
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Varsayılan kategoriler
INSERT INTO categories (name, order_index, is_active) VALUES
  ('Akşam Çantası', 1, true),
  ('Clutch', 2, true),
  ('Mini Çanta', 3, true),
  ('Omuz Çantası', 4, true),
  ('Çapraz Çanta', 5, true),
  ('El Çantası', 6, true)
ON CONFLICT (name) DO NOTHING;

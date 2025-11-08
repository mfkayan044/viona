-- Categories RLS Policies Fix
-- Mevcut policy'leri sil ve yeniden oluştur

-- Eski policy'leri sil (tüm olası isimler)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;

-- Yeni policy'ler (Soft delete için UPDATE'e izin ver)

-- Herkes aktif kategorileri görebilir
CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
USING (is_active = true);

-- Admin olmayan herkes de inaktif kategorileri görebilir (geçici)
CREATE POLICY "Anyone can view all categories"
ON categories FOR SELECT
USING (true);

-- Herkes kategori ekleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can insert categories"
ON categories FOR INSERT
WITH CHECK (true);

-- Herkes kategori güncelleyebilir (Soft delete için gerekli)
CREATE POLICY "Anyone can update categories"
ON categories FOR UPDATE
USING (true);

-- Herkes kategori silebilir (Hard delete - opsiyonel)
CREATE POLICY "Anyone can delete categories"
ON categories FOR DELETE
USING (true);

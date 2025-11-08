-- Colors RLS Policies Fix
-- Mevcut policy'leri sil ve yeniden oluştur

-- Eski policy'leri sil (tüm olası isimler)
DROP POLICY IF EXISTS "Anyone can view colors" ON colors;
DROP POLICY IF EXISTS "Anyone can view active colors" ON colors;
DROP POLICY IF EXISTS "Anyone can insert colors" ON colors;
DROP POLICY IF EXISTS "Anyone can update colors" ON colors;
DROP POLICY IF EXISTS "Anyone can delete colors" ON colors;

-- Yeni policy'ler (Soft delete için UPDATE'e izin ver)

-- Herkes aktif renkleri görebilir
CREATE POLICY "Anyone can view active colors"
ON colors FOR SELECT
USING (is_active = true);

-- Admin olmayan herkes de inaktif renkleri görebilir (geçici)
CREATE POLICY "Anyone can view all colors"
ON colors FOR SELECT
USING (true);

-- Herkes renk ekleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can insert colors"
ON colors FOR INSERT
WITH CHECK (true);

-- Herkes renk güncelleyebilir (Soft delete için gerekli)
CREATE POLICY "Anyone can update colors"
ON colors FOR UPDATE
USING (true);

-- Herkes renk silebilir (Hard delete - opsiyonel)
CREATE POLICY "Anyone can delete colors"
ON colors FOR DELETE
USING (true);

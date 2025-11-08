-- Geçici INSERT policy - Seed için
-- Supabase dashboard'da SQL Editor'de bu komutu çalıştırın

-- Products tablosu için geçici policy (Önce sil, sonra oluştur)
DROP POLICY IF EXISTS "Products are editable by admins only" ON products;
DROP POLICY IF EXISTS "Anyone can insert products (TEMPORARY)" ON products;
DROP POLICY IF EXISTS "Anyone can update products (TEMPORARY)" ON products;
DROP POLICY IF EXISTS "Anyone can delete products (TEMPORARY)" ON products;

CREATE POLICY "Anyone can insert products (TEMPORARY)" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products (TEMPORARY)" ON products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products (TEMPORARY)" ON products FOR DELETE USING (true);

-- Orders tablosu için geçici policy (Önce sil, sonra oluştur)
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders (TEMPORARY)" ON orders;

CREATE POLICY "Anyone can insert orders (TEMPORARY)" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders (TEMPORARY)" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can update orders (TEMPORARY)" ON orders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete orders (TEMPORARY)" ON orders FOR DELETE USING (true);

-- NOT: Seed işlemi tamamlandıktan sonra bu policy'leri kaldırıp
-- sadece admin yetkisi ile değiştirmeyi unutmayın!

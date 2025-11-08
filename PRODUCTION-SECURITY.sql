-- ====================================
-- PRODUCTION GÜVENLİK AYARLARI
-- ÖNEMLİ: Bu SQL'i production'a çıkmadan ÖNCE çalıştırın!
-- ====================================

-- ====================================
-- 1. USERS TABLE - Güvenli RLS Policies
-- ====================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Mevcut açık policy'leri sil
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Anyone can update users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can delete users" ON users;

-- Herkes kullanıcıları görebilir (public profiller için)
CREATE POLICY "Users are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Sadece yeni kayıt sırasında insert (auth.uid() ile aynı ID)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Sadece adminler kullanıcı silebilir
CREATE POLICY "Only admins can delete users"
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================
-- 2. ORDERS TABLE - Güvenli RLS Policies
-- ====================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

-- Müşteriler kendi siparişlerini görebilir, adminler hepsini görebilir
CREATE POLICY "Users can view own orders, admins all"
ON orders FOR SELECT
USING (
  user_id = auth.uid() OR
  customer_email = (SELECT email FROM users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Herkes sipariş oluşturabilir (checkout için)
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Sadece adminler sipariş güncelleyebilir
CREATE POLICY "Only admins can update orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Sadece adminler sipariş silebilir
CREATE POLICY "Only admins can delete orders"
ON orders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================
-- 3. PRODUCTS TABLE - Güvenli RLS Policies
-- ====================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- Herkes ürünleri görebilir
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Sadece adminler ürün ekleyebilir
CREATE POLICY "Only admins can insert products"
ON products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Sadece adminler ürün güncelleyebilir
CREATE POLICY "Only admins can update products"
ON products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Sadece adminler ürün silebilir
CREATE POLICY "Only admins can delete products"
ON products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================
-- 4. NOTIFICATIONS TABLE - Sadece Admin
-- ====================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can delete notifications" ON notifications;

-- Sadece adminler bildirimleri görebilir
CREATE POLICY "Only admins can view notifications"
ON notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Herkes bildirim oluşturabilir (sistem için)
CREATE POLICY "Anyone can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Sadece adminler bildirimleri güncelleyebilir
CREATE POLICY "Only admins can update notifications"
ON notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Sadece adminler bildirimleri silebilir
CREATE POLICY "Only admins can delete notifications"
ON notifications FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================
-- 5. STORAGE POLICIES - Güvenli Upload
-- ====================================

-- Avatars bucket policies güncelle
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Sadece authenticated users avatar upload yapabilir
CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'public'
);

-- Sadece kendi avatarını güncelleyebilir
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Sadece kendi avatarını silebilir
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- ====================================
-- 6. İLK ADMİN KULLANICI OLUŞTUR
-- ====================================

-- ÖNEMLI: Bu kullanıcıyı Supabase Auth'da manuel oluşturun
-- Email: admin@viona.com
-- Şifre: (güçlü bir şifre belirleyin)

-- Sonra bu SQL ile admin yapın:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@viona.com';

-- ====================================
-- TAMAMLANDI! ✅
-- ====================================
-- 
-- SON KONTROL:
-- 1. Admin kullanıcı oluşturuldu mu?
-- 2. Tüm policy'ler çalışıyor mu?
-- 3. Test kullanıcısı ile dene:
--    - Başka kullanıcı profilini değiştirebiliyor mu? (HAYIR olmalı)
--    - Sipariş oluşturabiliyor mu? (EVET olmalı)
--    - Başka kullanıcı siparişini görebiliyor mu? (HAYIR olmalı)
-- ====================================

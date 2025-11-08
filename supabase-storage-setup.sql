-- ====================================
-- VIONA - SUPABASE STORAGE SETUP
-- Product images ve Avatar upload için storage buckets ve policies
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- ====================================

-- ====================================
-- 1. PRODUCT IMAGES BUCKET
-- ====================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Product Images Policies
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ====================================
-- 2. AVATARS BUCKET (Profile Pictures)
-- ====================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Avatar Policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

-- ====================================
-- TAMAMLANDI! ✅
-- ====================================
-- 
-- Bu SQL 2 bucket oluşturur:
-- 1. product-images (Ürün resimleri)
-- 2. avatars (Kullanıcı profil resimleri)
-- 
-- Her ikisi de PUBLIC bucket (herkese açık)
-- File size limit: Dashboard'dan ayarlayın (2MB önerilir)
-- ====================================

-- NOT: Production ortamında güvenlik için policy'leri şu şekilde değiştirin:
-- CREATE POLICY "Authenticated users can upload" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'product-images' AND 
--   auth.role() = 'authenticated'
-- );

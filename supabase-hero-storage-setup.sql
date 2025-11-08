-- Hero Images Storage Bucket Setup
-- Bu scripti Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Hero images için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS politikaları

-- Herkes hero images'ları görebilir
CREATE POLICY "Anyone can view hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Herkes hero images yükleyebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-images');

-- Herkes hero images güncelleyebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can update hero images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-images');

-- Herkes hero images silebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can delete hero images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-images');

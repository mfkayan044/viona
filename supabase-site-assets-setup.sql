-- Site Assets (Logo, Favicon vb.) Storage Bucket Setup
-- Bu scripti Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Site assets için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS politikaları

-- Herkes site assets'leri görebilir
CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Herkes site assets yükleyebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

-- Herkes site assets güncelleyebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can update site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

-- Herkes site assets silebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can delete site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');

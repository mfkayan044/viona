# Site Ayarları Supabase Kurulum Rehberi

## 📋 Yapılması Gerekenler

### 1️⃣ Site Assets Bucket Oluştur

Supabase Dashboard → SQL Editor'de çalıştırın:

```sql
-- supabase-site-assets-setup.sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Anyone can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Anyone can update site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

CREATE POLICY "Anyone can delete site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');
```

### 2️⃣ Site Settings Tablosu Oluştur

Supabase Dashboard → SQL Editor'de çalıştırın:

```sql
-- supabase-site-settings.sql
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logo TEXT,
  site_name TEXT NOT NULL,
  slogan TEXT,
  about TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
ON site_settings FOR SELECT
USING (true);

CREATE POLICY "Anyone can update site settings"
ON site_settings FOR UPDATE
USING (true);

CREATE POLICY "Anyone can insert site settings"
ON site_settings FOR INSERT
WITH CHECK (true);

-- Varsayılan site ayarları
INSERT INTO site_settings (
  logo, site_name, slogan, about, phone, email, instagram, address
) VALUES (
  '👜',
  'VIONA',
  'Premium El Çantaları',
  'Viona olarak, kadınların günlük yaşamlarına şıklık ve zarafet katan özel tasarım çantalar üretiyoruz.',
  '+90 (555) 123 45 67',
  'info@viona.com',
  '@viona_bags',
  'İstanbul, Türkiye'
) ON CONFLICT DO NOTHING;
```

## ✅ Tamamlandı!

Artık:
- ✅ Site ayarları Supabase'den yükleniyor
- ✅ Logo Supabase Storage'a kaydediliyor
- ✅ Değişiklikler anında veritabanına kaydediliyor
- ✅ Sayfa yenilendiğinde güncel veriler geliyor

## 🎯 Test Etmek İçin:

1. Admin Panel → Settings
2. Logo yükleyin
3. Site ayarlarını değiştirin
4. Kaydet'e basın
5. Sayfayı yenileyin → Değişiklikler kalıcı olmalı! ✨

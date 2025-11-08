# Hero Görselleri Supabase Kurulum Rehberi

## 📋 Yapılacaklar Listesi

### 1️⃣ Hero Images Tablosunu Oluştur

Supabase Dashboard'da **SQL Editor**'e gidin ve şu dosyayı çalıştırın:
- `supabase-hero-images.sql`

VEYA doğrudan bu SQL'i yapıştırın:

```sql
-- Hero Images Table
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Herkes aktif hero images'ları görebilir
CREATE POLICY "Anyone can view active hero images"
ON hero_images FOR SELECT
USING (is_active = true);

-- Herkes hero images ekleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can insert hero images"
ON hero_images FOR INSERT
WITH CHECK (true);

-- Herkes hero images güncelleyebilir (GEÇİCİ)
CREATE POLICY "Anyone can update hero images"
ON hero_images FOR UPDATE
USING (true);

-- Herkes hero images silebilir (GEÇİCİ)
CREATE POLICY "Anyone can delete hero images"
ON hero_images FOR DELETE
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hero_images_order ON hero_images(order_index);
CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(is_active);
```

### 2️⃣ Storage Bucket'ını Oluştur

Supabase Dashboard'da **SQL Editor**'e gidin ve şu dosyayı çalıştırın:
- `supabase-hero-storage-setup.sql`

VEYA doğrudan bu SQL'i yapıştırın:

```sql
-- Hero images için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS politikaları

-- Herkes hero images'ları görebilir
CREATE POLICY "Anyone can view hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Herkes hero images yükleyebilir (geçici - production'da admin-only olmalı)
CREATE POLICY "Anyone can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-images');

-- Herkes hero images güncelleyebilir (geçici)
CREATE POLICY "Anyone can update hero images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-images');

-- Herkes hero images silebilir (geçici)
CREATE POLICY "Anyone can delete hero images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-images');
```

## ✅ Tamamlandı!

Artık admin panelden hero görsel yönetimi yapabilirsiniz:

### 🎯 Nasıl Kullanılır?

1. **Admin Panel** → **Settings** sayfasına gidin
2. **Hero Gallery Yönetimi** bölümünde:
   - 📁 **Dosya Seç** butonuna tıklayın
   - VEYA sürükle-bırak ile görsel ekleyin
3. Görseller otomatik olarak:
   - ✅ Supabase Storage'a yüklenir
   - ✅ Veritabanına kaydedilir
   - ✅ Ana sayfada görüntülenir

### 🗑️ Görsel Silme

- Her görselin üzerindeki **Çöp Kutusu** ikonuna tıklayın
- Görsel hem Storage'dan hem veritabanından silinir

### 📊 Özellikler

- ✅ Cihazdan yükleme (Storage)
- ✅ Sürükle-bırak desteği
- ✅ Format kontrolü (JPG, PNG, WebP, GIF)
- ✅ Boyut kontrolü (max 10MB)
- ✅ Sıralama desteği (order_index)
- ✅ Aktif/Pasif durumu (is_active)
- ✅ Otomatik yedekleme (Supabase)

### 🔐 Production İçin Güvenlik

Production'a çıkarken **RLS politikalarını** güncelleyin:

```sql
-- Sadece adminler hero images ekleyebilir
DROP POLICY "Anyone can insert hero images" ON hero_images;
CREATE POLICY "Only admins can insert hero images"
ON hero_images FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
  SELECT id FROM users WHERE role = 'admin'
));

-- Storage için de benzer şekilde
-- ...
```

## 🎨 Demo Görseller (Opsiyonel)

İlk görselleri eklemek isterseniz:

```sql
INSERT INTO hero_images (image_url, order_index, is_active) VALUES
('https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1920&q=80', 1, true),
('https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1920&q=80', 2, true),
('https://images.unsplash.com/photo-1564422167509-4f3a6833fb41?w=1920&q=80', 3, true),
('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&q=80', 4, true);
```

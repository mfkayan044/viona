-- Site Settings Table
-- Site ayarları için veritabanı tablosu

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

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Herkes site settings'i görebilir
CREATE POLICY "Anyone can view site settings"
ON site_settings FOR SELECT
USING (true);

-- Herkes site settings güncelleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can update site settings"
ON site_settings FOR UPDATE
USING (true);

-- Herkes site settings ekleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can insert site settings"
ON site_settings FOR INSERT
WITH CHECK (true);

-- İlk kayıt - Varsayılan site ayarları
INSERT INTO site_settings (
  logo,
  site_name,
  slogan,
  about,
  phone,
  email,
  instagram,
  address
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

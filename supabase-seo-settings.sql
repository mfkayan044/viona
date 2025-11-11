-- ====================================
-- SEO SETTINGS TABLE
-- ====================================

-- Önce eski tablo varsa sil
DROP TABLE IF EXISTS public.seo_settings CASCADE;

-- SEO ayarları tablosu
CREATE TABLE public.seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL,
  page_title TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  schema_markup JSONB,
  google_analytics_id TEXT,
  google_search_console_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage SEO settings" ON public.seo_settings;
DROP POLICY IF EXISTS "Everyone can read SEO settings" ON public.seo_settings;

-- Admin can do everything
CREATE POLICY "Admins can manage SEO settings"
ON public.seo_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Everyone can read
CREATE POLICY "Everyone can read SEO settings"
ON public.seo_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Varsayılan SEO ayarları ekle
INSERT INTO public.seo_settings (page_key, page_title, meta_title, meta_description, meta_keywords) VALUES
('home', 'Ana Sayfa', 'Viona - Premium Moda & Giyim', 'Viona ile tarzınızı yansıtın. En yeni moda trendleri, kaliteli ürünler ve hızlı teslimat.', 'moda, giyim, elbise, ayakkabı, aksesuar, online alışveriş'),
('products', 'Ürünler', 'Tüm Ürünler - Viona', 'Geniş ürün yelpazemizi keşfedin. Kadın, erkek ve çocuk giyim koleksiyonları.', 'ürünler, moda, giyim, koleksiyon'),
('contact', 'İletişim', 'İletişim - Viona', 'Viona ile iletişime geçin. Müşteri hizmetlerimiz size yardımcı olmak için burada.', 'iletişim, müşteri hizmetleri, destek'),
('blog', 'Blog', 'Blog - Viona', 'Moda trendleri, stil önerileri ve daha fazlası için blogumuzu takip edin.', 'blog, moda blog, stil, trend');

-- Updated at trigger
DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON public.seo_settings;
DROP FUNCTION IF EXISTS update_seo_settings_updated_at();

CREATE OR REPLACE FUNCTION update_seo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_settings_updated_at();

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_seo_settings_page_key ON public.seo_settings(page_key);

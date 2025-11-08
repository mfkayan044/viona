-- Hero Gallery için tablo ve servis
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- Hero images tablosu
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hero images" ON hero_images FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can insert hero images (TEMPORARY)" ON hero_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update hero images (TEMPORARY)" ON hero_images FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete hero images (TEMPORARY)" ON hero_images FOR DELETE USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_hero_images_order ON hero_images(order_index);
CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(is_active);

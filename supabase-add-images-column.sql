-- Products tablosuna images array ekle
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- images column ekle (TEXT[] array)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Mevcut tek image'i images array'ine kopyala
UPDATE products 
SET images = ARRAY[image] 
WHERE image IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

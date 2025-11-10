-- ====================================
-- REALTIME DURUM KONTROLÜ
-- ====================================

-- Hangi tablolar realtime'da?
SELECT 
  tablename as "Tablo",
  '✅ Realtime Aktif' as "Durum"
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY tablename;

-- Eğer orders ve products burada görünüyorsa:
-- ✅ Realtime AÇIK
-- Sadece frontend'i yenile ve test et!

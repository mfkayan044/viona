-- ====================================
-- ADIM 1: TEMİZ BAŞLANGIÇ KONTROLÜ
-- ====================================

-- Auth kullanıcılarını kontrol et (boş olmalı)
SELECT COUNT(*) as auth_user_count FROM auth.users;

-- Public users tablosunu kontrol et (boş olmalı)
SELECT COUNT(*) as public_user_count FROM public.users;

-- Sonuç: Her ikisi de 0 olmalı

-- ====================================
-- Eğer hala kullanıcı varsa, hepsini sil:
-- ====================================

-- Public users'ı sil
DELETE FROM public.users;

-- NOT: auth.users'ı manuel silemezsiniz
-- Supabase Dashboard > Authentication > Users > Her birini tek tek silin
-- VEYA yeni proje başlatın

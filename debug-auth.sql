-- ====================================
-- AUTH DEBUG - Kullanıcı Kontrol
-- ====================================

-- 1. Auth users tablosunda kayıtlı kullanıcılar
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Public users tablosunda kayıtlı profiller
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Auth users var ama public.users'da eksik olan kayıtlar
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at as auth_created,
  pu.id as profile_id,
  pu.name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- ====================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- Sonuçları kontrol edin:
-- - auth.users'da kullanıcı var mı?
-- - email_confirmed_at NULL mu? (NULL ise email onayı bekleniyor)
-- - public.users'da profil eksik mi?
-- ====================================

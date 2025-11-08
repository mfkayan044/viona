-- ====================================
-- EKSİK PROFİL OLUŞTUR
-- ====================================

-- 1. Önce auth.users'da bu kullanıcı var mı kontrol et
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users
WHERE id = '3e0480eb-8b6c-4d4b-a24d-8f060081b590';

-- 2. Eğer auth.users'da varsa, public.users'a profil ekle
-- (Email'i yukarıdaki sorguda göreceksiniz, onu kullanın)

INSERT INTO public.users (id, name, email, role, status, created_at)
VALUES (
  '3e0480eb-8b6c-4d4b-a24d-8f060081b590',
  'Serkan Kayan', -- Auth'daki bilgiden alın veya manuel girin
  'efe.yorsan@gmail.com', -- YUKARDA GÖRDÜĞÜNÜZ EMAİL
  'customer',
  'active',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- 3. Kontrol et
SELECT * FROM public.users WHERE id = '3e0480eb-8b6c-4d4b-a24d-8f060081b590';

-- ====================================
-- TÜM EKSİK PROFİLLERİ OTOMATIK OLUŞTUR
-- ====================================

INSERT INTO public.users (id, name, email, role, status, created_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'first_name' || ' ' || au.raw_user_meta_data->>'last_name',
    SPLIT_PART(au.email, '@', 1)
  ) as name,
  au.email,
  'customer' as role,
  'active' as status,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Sonuçları kontrol et
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;

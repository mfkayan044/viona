-- ====================================
-- EMAIL CONFIRMATION KAPAT
-- ====================================

-- Tüm mevcut kullanıcıları onayla
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ====================================
-- ÖNEMLI:
-- Supabase Dashboard'da da kapatmanız gerekiyor:
-- Authentication > Configuration > Email Auth
-- "Enable email confirmations" → OFF
-- ====================================

-- Mevcut kullanıcıları kontrol et:
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

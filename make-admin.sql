-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- test@example.com kullanıcısını admin yapın

UPDATE users 
SET role = 'admin' 
WHERE email = 'test@example.com';

-- Kontrol et
SELECT id, email, name, role FROM users WHERE email = 'test@example.com';

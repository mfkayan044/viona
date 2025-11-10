-- Users tablosuna newsletter subscription kolonu ekle

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_users_is_subscribed ON users(is_subscribed);

COMMENT ON COLUMN users.is_subscribed IS 'Kullanıcı newsletter/bültene abone mi?';

-- Users tablosunu yeniden oluştur (Supabase Auth entegrasyonu için)

-- Önce eski tabloyu sil (dikkatli!)
DROP TABLE IF EXISTS users CASCADE;

-- Yeni users tablosu - ID varsayılan değer OLMADAN (Supabase Auth ID'si kullanılacak)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Supabase Auth user ID buraya gelecek
  user_number SERIAL UNIQUE NOT NULL, -- Otomatik artan sayı ID
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer', -- 'admin', 'customer', 'manager'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  avatar VARCHAR(500),
  addresses JSONB DEFAULT '[]'::jsonb, -- Kullanıcı adresleri
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Anyone can update users"
ON users FOR UPDATE
USING (true);

CREATE POLICY "Anyone can insert users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete users"
ON users FOR DELETE
USING (true);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Comment
COMMENT ON COLUMN users.id IS 'Supabase Auth user ID - manually set, not auto-generated';
COMMENT ON COLUMN users.addresses IS 'User addresses stored as JSON array';
